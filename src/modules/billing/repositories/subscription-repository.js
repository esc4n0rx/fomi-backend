// Repositório de assinaturas
const { supabase } = require('../../../config/database');

class SubscriptionRepository {
    /**
     * Busca assinatura ativa por usuário
     * @param {string} userId - ID do usuário
     * @returns {Promise<Object|null>} Assinatura ativa ou null
     */
    async findActiveByUserId(userId) {
        const { data, error } = await supabase
            .from('fomi_subscriptions')
            .select('*')
            .eq('user_id', userId)
            .in('status', ['active', 'trialing', 'past_due'])
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error(`Erro ao buscar assinatura: ${error.message}`);
        }

        return data;
    }

    /**
     * Busca assinatura por Stripe ID
     * @param {string} stripeSubscriptionId - ID da assinatura no Stripe
     * @returns {Promise<Object|null>} Assinatura ou null
     */
    async findByStripeId(stripeSubscriptionId) {
        const { data, error } = await supabase
            .from('fomi_subscriptions')
            .select('*')
            .eq('stripe_subscription_id', stripeSubscriptionId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error(`Erro ao buscar assinatura: ${error.message}`);
        }

        return data;
    }

    /**
     * Busca assinatura por customer ID
     * @param {string} stripeCustomerId - ID do customer no Stripe
     * @returns {Promise<Object|null>} Assinatura ou null
     */
    async findByCustomerId(stripeCustomerId) {
        const { data, error } = await supabase
            .from('fomi_subscriptions')
            .select('*')
            .eq('stripe_customer_id', stripeCustomerId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error(`Erro ao buscar assinatura: ${error.message}`);
        }

        return data;
    }

    /**
     * Cria nova assinatura
     * @param {Object} subscriptionData - Dados da assinatura
     * @returns {Promise<Object>} Assinatura criada
     */
    async create(subscriptionData) {
        const { data, error } = await supabase
            .from('fomi_subscriptions')
            .insert([subscriptionData])
            .select('*')
            .single();

        if (error) {
            throw new Error(`Erro ao criar assinatura: ${error.message}`);
        }

        return data;
    }

    /**
     * Atualiza assinatura
     * @param {string} id - ID da assinatura
     * @param {Object} subscriptionData - Dados para atualizar
     * @returns {Promise<Object>} Assinatura atualizada
     */
    async update(id, subscriptionData) {
        const { data, error } = await supabase
            .from('fomi_subscriptions')
            .update(subscriptionData)
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            throw new Error(`Erro ao atualizar assinatura: ${error.message}`);
        }

        return data;
    }

    /**
     * Atualiza assinatura por Stripe ID
     * @param {string} stripeSubscriptionId - ID no Stripe
     * @param {Object} subscriptionData - Dados para atualizar
     * @returns {Promise<Object>} Assinatura atualizada
     */
    async updateByStripeId(stripeSubscriptionId, subscriptionData) {
        const { data, error } = await supabase
            .from('fomi_subscriptions')
            .update(subscriptionData)
            .eq('stripe_subscription_id', stripeSubscriptionId)
            .select('*')
            .single();

        if (error) {
            throw new Error(`Erro ao atualizar assinatura: ${error.message}`);
        }

        return data;
    }
}

module.exports = SubscriptionRepository;