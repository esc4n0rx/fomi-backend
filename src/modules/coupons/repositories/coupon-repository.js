// Repositório de cupons
const { supabase } = require('../../../config/database');

class CouponRepository {
    /**
     * Busca cupons por loja
     * @param {string} storeId - ID da loja
     * @param {boolean} onlyActive - Buscar apenas ativos
     * @returns {Promise<Array>} Lista de cupons
     */
    async findByStoreId(storeId, onlyActive = false) {
        let query = supabase
            .from('fomi_coupons')
            .select('*')
            .eq('store_id', storeId)
            .eq('ativo', true);

        if (onlyActive) {
            const today = new Date().toISOString().split('T')[0];
            query = query
                .lte('data_inicio', today)
                .gte('data_fim', today);
        }

        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) {
            throw new Error(`Erro ao buscar cupons: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Busca cupom por ID
     * @param {string} id - ID do cupom
     * @returns {Promise<Object|null>} Cupom ou null
     */
    async findById(id) {
        const { data, error } = await supabase
            .from('fomi_coupons')
            .select('*')
            .eq('id', id)
            .eq('ativo', true)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error(`Erro ao buscar cupom: ${error.message}`);
        }

        return data;
    }

    /**
     * Busca cupom por código
     * @param {string} codigo - Código do cupom
     * @param {string} storeId - ID da loja
     * @returns {Promise<Object|null>} Cupom ou null
     */
    async findByCode(codigo, storeId) {
        const { data, error } = await supabase
            .from('fomi_coupons')
            .select('*')
            .eq('codigo', codigo.toUpperCase())
            .eq('store_id', storeId)
            .eq('ativo', true)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error(`Erro ao buscar cupom: ${error.message}`);
        }

        return data;
    }

    /**
     * Cria novo cupom
     * @param {Object} couponData - Dados do cupom
     * @returns {Promise<Object>} Cupom criado
     */
    async create(couponData) {
        const { data, error } = await supabase
            .from('fomi_coupons')
            .insert([{
                ...couponData,
                codigo: couponData.codigo.toUpperCase()
            }])
            .select('*')
            .single();

        if (error) {
            throw new Error(`Erro ao criar cupom: ${error.message}`);
        }

        return data;
    }

    /**
     * Atualiza cupom
     * @param {string} id - ID do cupom
     * @param {Object} couponData - Dados para atualizar
     * @returns {Promise<Object>} Cupom atualizado
     */
    async update(id, couponData) {
        const updateData = { ...couponData };
        if (updateData.codigo) {
            updateData.codigo = updateData.codigo.toUpperCase();
        }

        const { data, error } = await supabase
            .from('fomi_coupons')
            .update(updateData)
            .eq('id', id)
            .eq('ativo', true)
            .select('*')
            .single();

        if (error) {
            throw new Error(`Erro ao atualizar cupom: ${error.message}`);
        }

        return data;
    }

    /**
     * Desativa cupom (soft delete)
     * @param {string} id - ID do cupom
     * @returns {Promise<void>}
     */
    async deactivate(id) {
        const { error } = await supabase
            .from('fomi_coupons')
            .update({ ativo: false })
            .eq('id', id);

        if (error) {
            throw new Error(`Erro ao desativar cupom: ${error.message}`);
        }
    }

    /**
     * Incrementa uso do cupom
     * @param {string} id - ID do cupom
     * @returns {Promise<void>}
     */
    async incrementUsage(id) {
        const { error } = await supabase
            .from('fomi_coupons')
            .update({ total_usado: supabase.raw('total_usado + 1') })
            .eq('id', id);

        if (error) {
            throw new Error(`Erro ao incrementar uso do cupom: ${error.message}`);
        }
    }
}

module.exports = CouponRepository;