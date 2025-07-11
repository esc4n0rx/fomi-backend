// Serviço do Stripe (MELHORADO com tratamento de erros)
const { stripe, STRIPE_PRICE_IDS } = require('../../../config/stripe');

class StripeService {
    /**
     * Cria ou busca customer no Stripe
     * @param {Object} userData - Dados do usuário
     * @returns {Promise<Object>} Customer do Stripe
     */
    async createOrGetCustomer(userData) {
        try {
            // Busca customer existente por email
            const existingCustomers = await stripe.customers.list({
                email: userData.email,
                limit: 1
            });

            if (existingCustomers.data.length > 0) {
                return existingCustomers.data[0];
            }

            // Cria novo customer
            return await stripe.customers.create({
                email: userData.email,
                name: userData.nome,
                metadata: {
                    user_id: userData.id,
                    cpf: userData.cpf
                }
            });
        } catch (error) {
            console.error('Erro ao criar/buscar customer no Stripe:', error);
            throw new Error(`Erro ao processar customer: ${error.message}`);
        }
    }

    /**
     * Cria sessão de checkout
     * @param {string} customerId - ID do customer
     * @param {string} planName - Nome do plano
     * @param {string} successUrl - URL de sucesso
     * @param {string} cancelUrl - URL de cancelamento
     * @returns {Promise<Object>} Sessão de checkout
     */
    async createCheckoutSession(customerId, planName, successUrl, cancelUrl) {
        const priceId = STRIPE_PRICE_IDS[planName];
        
        if (!priceId) {
            throw new Error(`Plano ${planName} não encontrado ou price_id não configurado`);
        }

        try {
            console.log(`🔄 Criando checkout session para plano ${planName} com price_id: ${priceId}`);
            
            const session = await stripe.checkout.sessions.create({
                customer: customerId,
                payment_method_types: ['card'],
                mode: 'subscription',
                line_items: [{
                    price: priceId,
                    quantity: 1
                }],
                success_url: successUrl,
                cancel_url: cancelUrl,
                allow_promotion_codes: true,
                billing_address_collection: 'required',
                locale: 'pt-BR',
                metadata: {
                    plan: planName
                }
            });

            console.log(`✅ Checkout session criada: ${session.id}`);
            return session;
        } catch (error) {
            console.error('Erro ao criar checkout session:', {
                planName,
                priceId,
                customerId,
                error: error.message
            });
            
            // Mensagem de erro mais específica
            if (error.code === 'resource_missing') {
                throw new Error(`Price ID inválido para o plano ${planName}. Verifique a configuração no dashboard do Stripe.`);
            }
            
            throw new Error(`Erro ao criar sessão de checkout: ${error.message}`);
        }
    }

    /**
     * Cria portal de billing
     * @param {string} customerId - ID do customer
     * @param {string} returnUrl - URL de retorno
     * @returns {Promise<Object>} Sessão do portal
     */
    async createBillingPortal(customerId, returnUrl) {
        try {
            return await stripe.billingPortal.sessions.create({
                customer: customerId,
                return_url: returnUrl
            });
        } catch (error) {
            console.error('Erro ao criar portal de billing:', error);
            throw new Error(`Erro ao criar portal: ${error.message}`);
        }
    }

    /**
     * Busca assinatura no Stripe
     * @param {string} subscriptionId - ID da assinatura
     * @returns {Promise<Object>} Assinatura do Stripe
     */
    async getSubscription(subscriptionId) {
        try {
            return await stripe.subscriptions.retrieve(subscriptionId);
        } catch (error) {
            console.error('Erro ao buscar assinatura:', error);
            throw new Error(`Erro ao buscar assinatura: ${error.message}`);
        }
    }

    /**
     * Cancela assinatura
     * @param {string} subscriptionId - ID da assinatura
     * @returns {Promise<Object>} Assinatura cancelada
     */
    async cancelSubscription(subscriptionId) {
        try {
            return await stripe.subscriptions.cancel(subscriptionId);
        } catch (error) {
            console.error('Erro ao cancelar assinatura:', error);
            throw new Error(`Erro ao cancelar assinatura: ${error.message}`);
        }
    }

    /**
     * Busca faturas de um customer
     * @param {string} customerId - ID do customer
     * @param {number} limit - Limite de faturas
     * @returns {Promise<Array>} Lista de faturas
     */
    async getCustomerInvoices(customerId, limit = 10) {
        try {
            const invoices = await stripe.invoices.list({
                customer: customerId,
                limit: limit
            });
            
            return invoices.data;
        } catch (error) {
            console.error('Erro ao buscar faturas:', error);
            throw new Error(`Erro ao buscar faturas: ${error.message}`);
        }
    }

    /**
     * Lista todos os preços disponíveis (útil para debug)
     * @returns {Promise<Array>} Lista de preços
     */
    async listAvailablePrices() {
        try {
            const prices = await stripe.prices.list({
                active: true,
                limit: 100
            });
            
            return prices.data;
        } catch (error) {
            console.error('Erro ao listar preços:', error);
            throw new Error(`Erro ao listar preços: ${error.message}`);
        }
    }
}

module.exports = StripeService;