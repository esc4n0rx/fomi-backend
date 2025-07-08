// Webhook do Stripe
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
    
    if (priceId === process.env.STRIPE_PRICE_FOMI_DUPLO) {
        return 'fomi_duplo';
    }
    if (priceId === process.env.STRIPE_PRICE_FOMI_SUPREMO) {
        return 'fomi_supremo';
    }
    
    return 'fomi_simples';
};

/**
 * Processa eventos de assinatura
 */
const handleSubscriptionEvent = async (event, subscription) => {
    const customerId = subscription.customer;
    
    // Busca usuário pelo customer_id
    const existingSubscription = await subscriptionRepository.findByCustomerId(customerId);
    if (!existingSubscription) {
        console.error('Usuário não encontrado para customer:', customerId);
        return;
    }

    const planName = mapStripePlanToOurPlan(subscription);
    
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

    switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
            await subscriptionRepository.updateByStripeId(subscription.id, subscriptionData);
            console.log(`Assinatura ${event.type}:`, subscription.id);
            break;
            
        case 'customer.subscription.deleted':
            await subscriptionRepository.updateByStripeId(subscription.id, {
                status: 'canceled',
                canceled_at: new Date(),
                ended_at: new Date()
            });
            console.log('Assinatura cancelada:', subscription.id);
            break;
    }
};

/**
 * Processa eventos de fatura
 */
const handleInvoiceEvent = async (event, invoice) => {
    const customerId = invoice.customer;
    
    // Busca assinatura pelo customer_id
    const subscription = await subscriptionRepository.findByCustomerId(customerId);
    if (!subscription) {
        console.error('Assinatura não encontrada para customer:', customerId);
        return;
    }

    const invoiceData = {
        user_id: subscription.user_id,
        subscription_id: subscription.id,
        stripe_invoice_id: invoice.id,
        numero_fatura: invoice.number,
        status: invoice.status,
        total: invoice.total / 100, // Stripe usa centavos
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
            console.log(`Fatura ${event.type}:`, invoice.id);
            break;
            
        case 'invoice.payment_succeeded':
            await invoiceRepository.updateByStripeId(invoice.id, {
                status: 'paid',
                paid_at: new Date()
            });
            console.log('Pagamento de fatura bem-sucedido:', invoice.id);
            break;
            
        case 'invoice.payment_failed':
            await invoiceRepository.updateByStripeId(invoice.id, {
                status: 'open'
            });
            console.log('Pagamento de fatura falhou:', invoice.id);
            break;
    }
};

/**
 * Endpoint do webhook
 */
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Erro na verificação do webhook:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        // Processa eventos de assinatura
        if (event.type.startsWith('customer.subscription.')) {
            await handleSubscriptionEvent(event, event.data.object);
        }
        
        // Processa eventos de fatura
        if (event.type.startsWith('invoice.')) {
            await handleInvoiceEvent(event, event.data.object);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Erro ao processar webhook:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;