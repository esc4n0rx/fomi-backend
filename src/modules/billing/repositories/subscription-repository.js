// Repositório de assinaturas (MELHORADO com debug)
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
            .in('status', ['active', 'trialing', 'past_due', 'incomplete']) // Incluído 'incomplete'
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
     * Busca assinatura por customer ID (MELHORADO com debug)
     * @param {string} stripeCustomerId - ID do customer no Stripe
     * @returns {Promise<Object|null>} Assinatura ou null
     */
    async findByCustomerId(stripeCustomerId) {
        console.log(`🔍 Buscando assinatura para customer_id: ${stripeCustomerId}`);
        
        const { data, error } = await supabase
            .from('fomi_subscriptions')
            .select('*')
            .eq('stripe_customer_id', stripeCustomerId)
            .order('created_at', { ascending: false }) // Pega a mais recente
            .limit(1);

        if (error) {
            console.error(`❌ Erro ao buscar assinatura por customer_id: ${error.message}`);
            throw new Error(`Erro ao buscar assinatura: ${error.message}`);
        }

        const subscription = data && data.length > 0 ? data[0] : null;
        
        if (subscription) {
            console.log(`✅ Assinatura encontrada: ${subscription.id} para customer ${stripeCustomerId}`);
        } else {
            console.log(`❌ Nenhuma assinatura encontrada para customer ${stripeCustomerId}`);
            
            // Debug: listar todas as assinaturas para análise
            const { data: allSubs } = await supabase
                .from('fomi_subscriptions')
                .select('id, user_id, stripe_customer_id, stripe_subscription_id, status')
                .order('created_at', { ascending: false })
                .limit(10);
            
            console.log('📊 Últimas assinaturas no banco:', allSubs);
        }

        return subscription;
    }

    /**
     * Cria nova assinatura
     * @param {Object} subscriptionData - Dados da assinatura
     * @returns {Promise<Object>} Assinatura criada
     */
    async create(subscriptionData) {
        console.log(`🆕 Criando assinatura:`, subscriptionData);
        
        const { data, error } = await supabase
            .from('fomi_subscriptions')
            .insert([subscriptionData])
            .select('*')
            .single();

        if (error) {
            console.error(`❌ Erro ao criar assinatura: ${error.message}`);
            throw new Error(`Erro ao criar assinatura: ${error.message}`);
        }

        console.log(`✅ Assinatura criada com sucesso: ${data.id}`);
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
        console.log(`🔄 Atualizando assinatura ${stripeSubscriptionId}:`, subscriptionData);
        
        const { data, error } = await supabase
            .from('fomi_subscriptions')
            .update(subscriptionData)
            .eq('stripe_subscription_id', stripeSubscriptionId)
            .select('*')
            .single();

        if (error) {
            console.error(`❌ Erro ao atualizar assinatura: ${error.message}`);
            throw new Error(`Erro ao atualizar assinatura: ${error.message}`);
        }

        console.log(`✅ Assinatura atualizada com sucesso: ${data.id}`);
        return data;
    }
}

module.exports = SubscriptionRepository;