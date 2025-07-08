// Serviço principal de billing
const StripeService = require('./stripe-service');
const SubscriptionRepository = require('../repositories/subscription-repository');
const InvoiceRepository = require('../repositories/invoice-repository');
const UserRepository = require('../../auth/repositories/user-repository');

class BillingService {
    constructor() {
        this.stripeService = new StripeService();
        this.subscriptionRepository = new SubscriptionRepository();
        this.invoiceRepository = new InvoiceRepository();
        this.userRepository = new UserRepository();
    }

    /**
     * Inicia processo de assinatura
     * @param {string} userId - ID do usuário
     * @param {string} planName - Nome do plano
     * @param {string} successUrl - URL de sucesso
     * @param {string} cancelUrl - URL de cancelamento
     * @returns {Promise<Object>} URL do checkout
     */
    async createSubscription(userId, planName, successUrl, cancelUrl) {
        // Valida plano
        if (!['fomi_duplo', 'fomi_supremo'].includes(planName)) {
            throw new Error('Plano inválido');
        }

        // Busca dados do usuário
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        // Verifica se já tem assinatura ativa
        const existingSubscription = await this.subscriptionRepository.findActiveByUserId(userId);
        if (existingSubscription) {
            throw new Error('Usuário já possui assinatura ativa');
        }

        // Cria ou busca customer no Stripe
        const customer = await this.stripeService.createOrGetCustomer(user);

        // Cria assinatura inicial no nosso banco (será atualizada pelo webhook)
        await this.subscriptionRepository.create({
            user_id: userId,
            stripe_customer_id: customer.id,
            plano: 'fomi_simples', // Será atualizado pelo webhook
            status: 'incomplete'
        });

        // Cria sessão de checkout
        const session = await this.stripeService.createCheckoutSession(
            customer.id,
            planName,
            successUrl,
            cancelUrl
        );

        return {
            checkout_url: session.url,
            session_id: session.id
        };
    }

    /**
     * Busca dados da assinatura do usuário
     * @param {string} userId - ID do usuário
     * @returns {Promise<Object>} Dados da assinatura
     */
    async getUserSubscription(userId) {
        const subscription = await this.subscriptionRepository.findActiveByUserId(userId);
        
        if (!subscription) {
            return {
                plano: 'fomi_simples',
                status: 'free',
                active: true
            };
        }

        return {
            ...subscription,
            active: ['active', 'trialing'].includes(subscription.status)
        };
    }

    /**
     * Cria portal de billing
     * @param {string} userId - ID do usuário
     * @param {string} returnUrl - URL de retorno
     * @returns {Promise<Object>} URL do portal
     */
    async createBillingPortal(userId, returnUrl) {
        const subscription = await this.subscriptionRepository.findActiveByUserId(userId);
        
        if (!subscription) {
            throw new Error('Usuário não possui assinatura ativa');
        }

        const portal = await this.stripeService.createBillingPortal(
            subscription.stripe_customer_id,
            returnUrl
        );

        return {
            portal_url: portal.url
        };
    }

    /**
     * Busca faturas do usuário
     * @param {string} userId - ID do usuário
     * @returns {Promise<Array>} Lista de faturas
     */
    async getUserInvoices(userId) {
        return await this.invoiceRepository.findByUserId(userId);
    }

    /**
     * Cancela assinatura
     * @param {string} userId - ID do usuário
     * @returns {Promise<void>}
     */
    async cancelSubscription(userId) {
        const subscription = await this.subscriptionRepository.findActiveByUserId(userId);
        
        if (!subscription || !subscription.stripe_subscription_id) {
            throw new Error('Assinatura não encontrada');
        }

        await this.stripeService.cancelSubscription(subscription.stripe_subscription_id);
        
        // O webhook atualizará o status automaticamente
    }
}

module.exports = BillingService;