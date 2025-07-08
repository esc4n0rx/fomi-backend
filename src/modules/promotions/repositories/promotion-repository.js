// Repositório de promoções
const { supabase } = require('../../../config/database');

class PromotionRepository {
    /**
     * Busca promoções por loja
     * @param {string} storeId - ID da loja
     * @param {boolean} onlyActive - Buscar apenas ativas
     * @returns {Promise<Array>} Lista de promoções
     */
    async findByStoreId(storeId, onlyActive = false) {
        let query = supabase
            .from('fomi_promotions')
            .select(`
                *,
                produto_gratis:fomi_products(id, nome, preco)
            `)
            .eq('store_id', storeId)
            .eq('ativo', true);

        if (onlyActive) {
            const today = new Date().toISOString().split('T')[0];
            query = query
                .lte('data_inicio', today)
                .gte('data_fim', today);
        }

        query = query.order('data_inicio', { ascending: false });

        const { data, error } = await query;

        if (error) {
            throw new Error(`Erro ao buscar promoções: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Conta promoções ativas por loja
     * @param {string} storeId - ID da loja
     * @returns {Promise<number>} Número de promoções ativas
     */
    async countActiveByStoreId(storeId) {
        const today = new Date().toISOString().split('T')[0];
        
        const { count, error } = await supabase
            .from('fomi_promotions')
            .select('*', { count: 'exact', head: true })
            .eq('store_id', storeId)
            .eq('ativo', true)
            .lte('data_inicio', today)
            .gte('data_fim', today);

        if (error) {
            throw new Error(`Erro ao contar promoções: ${error.message}`);
        }

        return count || 0;
    }

    /**
     * Busca promoção por ID
     * @param {string} id - ID da promoção
     * @returns {Promise<Object|null>} Promoção ou null
     */
    async findById(id) {
        const { data, error } = await supabase
            .from('fomi_promotions')
            .select(`
                *,
                produto_gratis:fomi_products(id, nome, preco)
            `)
            .eq('id', id)
            .eq('ativo', true)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error(`Erro ao buscar promoção: ${error.message}`);
        }

        return data;
    }

    /**
     * Verifica se produto pertence à loja
     * @param {string} productId - ID do produto
     * @param {string} storeId - ID da loja
     * @returns {Promise<boolean>} True se pertence
     */
    async productBelongsToStore(productId, storeId) {
        const { data, error } = await supabase
            .from('fomi_products')
            .select('id')
            .eq('id', productId)
            .eq('store_id', storeId)
            .eq('ativo', true)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error(`Erro ao verificar produto: ${error.message}`);
        }

        return !!data;
    }

    /**
     * Cria nova promoção
     * @param {Object} promotionData - Dados da promoção
     * @returns {Promise<Object>} Promoção criada
     */
    async create(promotionData) {
        const { data, error } = await supabase
            .from('fomi_promotions')
            .insert([promotionData])
            .select(`
                *,
                produto_gratis:fomi_products(id, nome, preco)
            `)
            .single();

        if (error) {
            throw new Error(`Erro ao criar promoção: ${error.message}`);
        }

        return data;
    }

    /**
     * Atualiza promoção
     * @param {string} id - ID da promoção
     * @param {Object} promotionData - Dados para atualizar
     * @returns {Promise<Object>} Promoção atualizada
     */
    async update(id, promotionData) {
        const { data, error } = await supabase
            .from('fomi_promotions')
            .update(promotionData)
            .eq('id', id)
            .eq('ativo', true)
            .select(`
                *,
                produto_gratis:fomi_products(id, nome, preco)
            `)
            .single();

        if (error) {
            throw new Error(`Erro ao atualizar promoção: ${error.message}`);
        }

        return data;
    }

    /**
     * Desativa promoção (soft delete)
     * @param {string} id - ID da promoção
     * @returns {Promise<void>}
     */
    async deactivate(id) {
        const { error } = await supabase
            .from('fomi_promotions')
            .update({ ativo: false })
            .eq('id', id);

        if (error) {
            throw new Error(`Erro ao desativar promoção: ${error.message}`);
        }
    }
}

module.exports = PromotionRepository;