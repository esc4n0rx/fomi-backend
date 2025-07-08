// Repositório de faturas
const { supabase } = require('../../../config/database');

class InvoiceRepository {
    /**
     * Busca faturas por usuário
     * @param {string} userId - ID do usuário
     * @param {number} limit - Limite de registros
     * @returns {Promise<Array>} Lista de faturas
     */
    async findByUserId(userId, limit = 50) {
        const { data, error } = await supabase
            .from('fomi_invoices')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            throw new Error(`Erro ao buscar faturas: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Busca fatura por Stripe ID
     * @param {string} stripeInvoiceId - ID da fatura no Stripe
     * @returns {Promise<Object|null>} Fatura ou null
     */
    async findByStripeId(stripeInvoiceId) {
        const { data, error } = await supabase
            .from('fomi_invoices')
            .select('*')
            .eq('stripe_invoice_id', stripeInvoiceId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error(`Erro ao buscar fatura: ${error.message}`);
        }

        return data;
    }

    /**
     * Cria nova fatura
     * @param {Object} invoiceData - Dados da fatura
     * @returns {Promise<Object>} Fatura criada
     */
    async create(invoiceData) {
        const { data, error } = await supabase
            .from('fomi_invoices')
            .insert([invoiceData])
            .select('*')
            .single();

        if (error) {
            throw new Error(`Erro ao criar fatura: ${error.message}`);
        }

        return data;
    }

    /**
     * Atualiza fatura por Stripe ID
     * @param {string} stripeInvoiceId - ID no Stripe
     * @param {Object} invoiceData - Dados para atualizar
     * @returns {Promise<Object>} Fatura atualizada
     */
    async updateByStripeId(stripeInvoiceId, invoiceData) {
        const { data, error } = await supabase
            .from('fomi_invoices')
            .update(invoiceData)
            .eq('stripe_invoice_id', stripeInvoiceId)
            .select('*')
            .single();

        if (error) {
            throw new Error(`Erro ao atualizar fatura: ${error.message}`);
        }

        return data;
    }
}

module.exports = InvoiceRepository;