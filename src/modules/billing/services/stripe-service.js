// Serviço do Stripe
const { stripe, STRIPE_PRICE_IDS } = require('../../../config/stripe');

class StripeService {
    /**
     * Cria ou busca customer no Stripe
     * @param {Object} userData - Dados do usuário
     * @returns {Promise<Object>} Customer do Stripe
     */
    async createOrGetCustomer(userData) {
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
            throw new Error(`Plano ${planName} não encontrado`);
        }

        return await stripe.checkout.sessions.create({
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
    }

    /**
     * Cria portal de billing
     * @param {string} customerId - ID do customer
     * @param {string} returnUrl - URL de retorno
     * @returns {Promise<Object>} Sessão do portal
     */
    async createBillingPortal(customerId, returnUrl) {
        return await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl
        });
    }

    /**
     * Busca assinatura no Stripe
     * @param {string} subscriptionId - ID da assinatura
     * @returns {Promise<Object>} Assinatura do Stripe
     */
    async getSubscription(subscriptionId) {
        return await stripe.subscriptions.retrieve(subscriptionId);
    }

    /**
     * Cancela assinatura
     * @param {string} subscriptionId - ID da assinatura
     * @returns {Promise<Object>} Assinatura cancelada
     */
    async cancelSubscription(subscriptionId) {
        return await stripe.subscriptions.cancel(subscriptionId);
    }

    /**
     * Busca faturas de um customer
     * @param {string} customerId - ID do customer
     * @param {number} limit - Limite de faturas
     * @returns {Promise<Array>} Lista de faturas
     */
    async getCustomerInvoices(customerId, limit = 10) {
        const invoices = await stripe.invoices.list({
            customer: customerId,
            limit: limit
        });
        
        return invoices.data;
    }
}

module.exports = StripeService;