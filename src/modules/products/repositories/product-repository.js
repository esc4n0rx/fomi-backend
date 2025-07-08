// Repositório de produtos
const { supabase } = require('../../../config/database');

class ProductRepository {
    /**
     * Busca produtos por loja
     * @param {string} storeId - ID da loja
     * @param {Object} filters - Filtros opcionais
     * @returns {Promise<Array>} Lista de produtos
     */
    async findByStoreId(storeId, filters = {}) {
        let query = supabase
            .from('fomi_products')
            .select(`
                *,
                category:fomi_categories(id, nome, cor)
            `)
            .eq('store_id', storeId)
            .eq('ativo', true);

        // Aplica filtros
        if (filters.category_id) {
            query = query.eq('category_id', filters.category_id);
        }

        if (filters.disponivel !== undefined) {
            query = query.eq('disponivel', filters.disponivel);
        }

        if (filters.destaque !== undefined) {
            query = query.eq('destaque', filters.destaque);
        }

        query = query.order('ordem', { ascending: true });

        const { data, error } = await query;

        if (error) {
            throw new Error(`Erro ao buscar produtos: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Conta produtos ativos por loja
     * @param {string} storeId - ID da loja
     * @returns {Promise<number>} Número de produtos
     */
    async countByStoreId(storeId) {
        const { count, error } = await supabase
            .from('fomi_products')
            .select('*', { count: 'exact', head: true })
            .eq('store_id', storeId)
            .eq('ativo', true);

        if (error) {
            throw new Error(`Erro ao contar produtos: ${error.message}`);
        }

        return count || 0;
    }

    /**
     * Busca produto por ID
     * @param {string} id - ID do produto
     * @returns {Promise<Object|null>} Produto ou null
     */
    async findById(id) {
        const { data, error } = await supabase
            .from('fomi_products')
            .select(`
                *,
                category:fomi_categories(id, nome, cor)
            `)
            .eq('id', id)
            .eq('ativo', true)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error(`Erro ao buscar produto: ${error.message}`);
        }

        return data;
    }

    /**
     * Verifica se categoria pertence à loja
     * @param {string} categoryId - ID da categoria
     * @param {string} storeId - ID da loja
     * @returns {Promise<boolean>} True se pertence
     */
    async categoryBelongsToStore(categoryId, storeId) {
        const { data, error } = await supabase
            .from('fomi_categories')
            .select('id')
            .eq('id', categoryId)
            .eq('store_id', storeId)
            .eq('ativo', true)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error(`Erro ao verificar categoria: ${error.message}`);
        }

        return !!data;
    }

    /**
     * Cria novo produto
     * @param {Object} productData - Dados do produto
     * @returns {Promise<Object>} Produto criado
     */
    async create(productData) {
        const { data, error } = await supabase
            .from('fomi_products')
            .insert([productData])
            .select(`
                *,
                category:fomi_categories(id, nome, cor)
            `)
            .single();

        if (error) {
            throw new Error(`Erro ao criar produto: ${error.message}`);
        }

        return data;
    }

    /**
     * Atualiza produto
     * @param {string} id - ID do produto
     * @param {Object} productData - Dados para atualizar
     * @returns {Promise<Object>} Produto atualizado
     */
    async update(id, productData) {
        const { data, error } = await supabase
            .from('fomi_products')
            .update(productData)
            .eq('id', id)
            .eq('ativo', true)
            .select(`
                *,
                category:fomi_categories(id, nome, cor)
            `)
            .single();

        if (error) {
            throw new Error(`Erro ao atualizar produto: ${error.message}`);
        }

        return data;
    }

    /**
     * Desativa produto (soft delete)
     * @param {string} id - ID do produto
     * @returns {Promise<void>}
     */
    async deactivate(id) {
        const { error } = await supabase
            .from('fomi_products')
            .update({ ativo: false })
            .eq('id', id);

        if (error) {
            throw new Error(`Erro ao desativar produto: ${error.message}`);
        }
    }
}

module.exports = ProductRepository;