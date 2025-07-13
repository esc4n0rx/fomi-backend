const express = require('express');
const { stripe, STRIPE_WEBHOOK_SECRET } = require('../config/stripe');
const SubscriptionRepository = require('../modules/billing/repositories/subscription-repository');
const InvoiceRepository = require('../modules/billing/repositories/invoice-repository');
const UserRepository = require('../modules/auth/repositories/user-repository');

const router = express.Router();

const subscriptionRepository = new SubscriptionRepository();
const invoiceRepository = new InvoiceRepository();
const userRepository = new UserRepository();

/**
 * Mapeia plano do Stripe para nosso sistema
 * @param {Object} subscription - Assinatura do Stripe
 * @returns {string} Nome do plano
 */
const mapStripePlanToOurPlan = (subscription) => {
    const priceId = subscription.items.data[0]?.price?.id;
    
    console.log(`🔍 Mapeando plano - Price ID: ${priceId}`);
    console.log(`🔍 Price IDs configurados:`, {
        fomi_duplo: process.env.STRIPE_PRICE_FOMI_DUPLO,
        fomi_supremo: process.env.STRIPE_PRICE_FOMI_SUPREMO
    });
    
    if (priceId === process.env.STRIPE_PRICE_FOMI_DUPLO) {
        return 'fomi_duplo';
    }
    if (priceId === process.env.STRIPE_PRICE_FOMI_SUPREMO) {
        return 'fomi_supremo';
    }
    
    console.log(`⚠️ Price ID não reconhecido: ${priceId}, retornando fomi_simples`);
    return 'fomi_simples';
};

/**
 * Processa eventos de assinatura (MELHORADO com mais logs)
 */
const handleSubscriptionEvent = async (event, subscription) => {
    const customerId = subscription.customer;
    
    console.log(`📝 Processando evento de assinatura: ${event.type}`);
    console.log(`📝 Customer ID: ${customerId}`);
    console.log(`📝 Subscription ID: ${subscription.id}`);
    console.log(`📝 Status: ${subscription.status}`);
    console.log(`📝 Objeto completo da assinatura:`, JSON.stringify(subscription, null, 2));
    
    let existingSubscription = await subscriptionRepository.findByCustomerId(customerId);
    
    if (!existingSubscription) {
        console.error(`❌ Assinatura não encontrada para customer: ${customerId}`);
        
        // Tenta buscar por stripe_subscription_id se disponível
        if (subscription.id) {
            console.log(`🔄 Tentando buscar por stripe_subscription_id: ${subscription.id}`);
            existingSubscription = await subscriptionRepository.findByStripeId(subscription.id);
        }
        
        if (!existingSubscription) {
            console.error(`❌ Assinatura não encontrada nem por customer_id nem por subscription_id`);
            return;
        }
    }

    const planName = mapStripePlanToOurPlan(subscription);
    console.log(`📋 Plano mapeado: ${planName}`);
    
    const subscriptionData = {
        stripe_subscription_id: subscription.id,
        plano: planName,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000),
        trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
        ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000) : null,
        metadata: subscription.metadata || {}
    };

    console.log(`📊 Dados da assinatura para atualizar:`, subscriptionData);

    try {
        switch (event.type) {
            case 'customer.subscription.created':
                console.log(`🆕 Processando criação de assinatura`);
                await subscriptionRepository.update(existingSubscription.id, subscriptionData);
                console.log(`✅ Assinatura atualizada após criação: ${subscription.id}`);
                break;
                
            case 'customer.subscription.updated':
                console.log(`🔄 Processando atualização de assinatura`);
                // Busca novamente para pegar a mais recente
                existingSubscription = await subscriptionRepository.findByStripeId(subscription.id) ||
                                       await subscriptionRepository.findByCustomerId(customerId);
                
                if (existingSubscription) {
                    await subscriptionRepository.update(existingSubscription.id, subscriptionData);
                    console.log(`✅ Assinatura atualizada: ${subscription.id}`);
                } else {
                    console.error(`❌ Assinatura não encontrada para atualização: ${subscription.id}`);
                }
                break;
                
            case 'customer.subscription.deleted':
                console.log(`🗑️ Processando cancelamento de assinatura`);
                existingSubscription = await subscriptionRepository.findByStripeId(subscription.id) ||
                                       await subscriptionRepository.findByCustomerId(customerId);
                
                if (existingSubscription) {
                    await subscriptionRepository.update(existingSubscription.id, {
                        status: 'canceled',
                        canceled_at: new Date(),
                        ended_at: new Date()
                    });
                    console.log(`✅ Assinatura cancelada: ${subscription.id}`);
                } else {
                    console.error(`❌ Assinatura não encontrada para cancelamento: ${subscription.id}`);
                }
                break;
                
            default:
                console.log(`ℹ️ Evento de assinatura não tratado: ${event.type}`);
        }
    } catch (updateError) {
        console.error(`❌ Erro ao atualizar assinatura no banco:`, updateError);
        throw updateError;
    }
};

/**
 * Processa eventos de fatura
 */
const handleInvoiceEvent = async (event, invoice) => {
    const customerId = invoice.customer;
    
    console.log(`📄 Processando evento de fatura: ${event.type} para customer: ${customerId}`);
    
    const subscription = await subscriptionRepository.findByCustomerId(customerId);
    if (!subscription) {
        console.error(`❌ Assinatura não encontrada para customer: ${customerId} no evento de fatura`);
        return;
    }

    const invoiceData = {
        user_id: subscription.user_id,
        subscription_id: subscription.id,
        stripe_invoice_id: invoice.id,
        numero_fatura: invoice.number,
        status: invoice.status,
        total: invoice.total / 100,
        subtotal: invoice.subtotal / 100,
        tax: invoice.tax || 0,
        currency: invoice.currency.toUpperCase(),
        period_start: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
        period_end: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
        due_date: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
        paid_at: invoice.status_transitions?.paid_at ? new Date(invoice.status_transitions.paid_at * 1000) : null,
        hosted_invoice_url: invoice.hosted_invoice_url,
        invoice_pdf: invoice.invoice_pdf,
        metadata: invoice.metadata || {}
    };

    try {
        switch (event.type) {
            case 'invoice.created':
            case 'invoice.updated':
            case 'invoice.finalized':
                const existingInvoice = await invoiceRepository.findByStripeId(invoice.id);
                if (existingInvoice) {
                    await invoiceRepository.updateByStripeId(invoice.id, invoiceData);
                } else {
                    await invoiceRepository.create(invoiceData);
                }
                console.log(`✅ Fatura ${event.type}: ${invoice.id}`);
                break;
                
            case 'invoice.payment_succeeded':
                await invoiceRepository.updateByStripeId(invoice.id, {
                    status: 'paid',
                    paid_at: new Date()
                });
                console.log(`✅ Pagamento de fatura bem-sucedido: ${invoice.id}`);
                break;
                
            case 'invoice.payment_failed':
                await invoiceRepository.updateByStripeId(invoice.id, {
                    status: 'open'
                });
                console.log(`❌ Pagamento de fatura falhou: ${invoice.id}`);
                break;
        }
    } catch (invoiceError) {
        console.error(`❌ Erro ao processar fatura:`, invoiceError);
        throw invoiceError;
    }
};

/**
 * Endpoint do webhook (MELHORADO com logs detalhados)
 */
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    console.log(`🎯 Webhook recebido - Signature: ${sig ? 'presente' : 'ausente'}`);
    console.log(`🎯 Webhook secret configurado: ${STRIPE_WEBHOOK_SECRET ? 'SIM' : 'NÃO'}`);
    console.log(`🎯 Body size: ${req.body.length} bytes`);

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
        console.log(`🎯 Webhook verificado com sucesso: ${event.type} - ID: ${event.id}`);
        console.log(`🎯 Event data:`, JSON.stringify(event.data.object, null, 2));
    } catch (err) {
        console.error('❌ Erro na verificação do webhook:', err.message);
        console.error('❌ Webhook secret usado:', STRIPE_WEBHOOK_SECRET);
        console.error('❌ Signature recebida:', sig);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        // Log do evento recebido
        console.log(`🔍 Processando evento: ${event.type}`);
        
        // Processa eventos de assinatura
        if (event.type.startsWith('customer.subscription.')) {
            console.log(`📋 Evento de assinatura detectado: ${event.type}`);
            await handleSubscriptionEvent(event, event.data.object);
        }
        
        // Processa eventos de fatura
        else if (event.type.startsWith('invoice.')) {
            console.log(`📄 Evento de fatura detectado: ${event.type}`);
            await handleInvoiceEvent(event, event.data.object);
        }
        
        // Eventos de checkout
        else if (event.type.startsWith('checkout.session.')) {
            console.log(`🛒 Evento de checkout detectado: ${event.type}`);
            console.log(`🛒 Session data:`, JSON.stringify(event.data.object, null, 2));
        }
        
        // Outros eventos
        else {
            console.log(`ℹ️ Evento não tratado: ${event.type}`);
        }

        console.log(`✅ Webhook processado com sucesso: ${event.type}`);
        res.json({ received: true, event_type: event.type });
    } catch (error) {
        console.error(`❌ Erro ao processar webhook ${event.type}:`, error);
        console.error(`❌ Stack trace:`, error.stack);
        res.status(500).json({ 
            error: 'Erro interno do servidor',
            event_type: event.type,
            message: error.message 
        });
    }
});

// Endpoint para testar se webhooks estão funcionando
router.get('/stripe/test', (req, res) => {
    res.json({
        success: true,
        message: 'Endpoint de webhook funcionando',
        webhook_secret_configured: !!STRIPE_WEBHOOK_SECRET,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;