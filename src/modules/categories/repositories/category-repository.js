// Repositório de categorias
const { supabase } = require('../../../config/database');

class CategoryRepository {
    /**
     * Busca categorias por loja
     * @param {string} storeId - ID da loja
     * @returns {Promise<Array>} Lista de categorias
     */
    async findByStoreId(storeId) {
        const { data, error } = await supabase
            .from('fomi_categories')
            .select('*')
            .eq('store_id', storeId)
            .eq('ativo', true)
            .order('ordem', { ascending: true });

        if (error) {
            console.error('Erro ao buscar categorias:', error);
            throw new Error(`Erro ao buscar categorias: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Conta categorias ativas por loja
     * @param {string} storeId - ID da loja
     * @returns {Promise<number>} Número de categorias
     */
    async countByStoreId(storeId) {
        const { count, error } = await supabase
            .from('fomi_categories')
            .select('*', { count: 'exact', head: true })
            .eq('store_id', storeId)
            .eq('ativo', true);

        if (error) {
            console.error('Erro ao contar categorias:', error);
            throw new Error(`Erro ao contar categorias: ${error.message}`);
        }

        return count || 0;
    }

    /**
     * Busca categoria por ID
     * @param {string} id - ID da categoria
     * @returns {Promise<Object|null>} Categoria ou null
     */
    async findById(id) {
        const { data, error } = await supabase
            .from('fomi_categories')
            .select('*')
            .eq('id', id)
            .eq('ativo', true)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Erro ao buscar categoria:', error);
            throw new Error(`Erro ao buscar categoria: ${error.message}`);
        }

        return data;
    }

    /**
     * Cria nova categoria
     * @param {Object} categoryData - Dados da categoria
     * @returns {Promise<Object>} Categoria criada
     */
    async create(categoryData) {
        console.log('Dados da categoria a serem inseridos:', categoryData);
        
        const { data, error } = await supabase
            .from('fomi_categories')
            .insert([categoryData])
            .select('*')
            .single();

        console.log('Resposta do Supabase - data:', data);
        console.log('Resposta do Supabase - error:', error);

        if (error) {
            console.error('Erro detalhado ao criar categoria:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            throw new Error(`Erro ao criar categoria: ${error.message}`);
        }

        if (!data) {
            console.error('Nenhum dado retornado após inserção');
            throw new Error('Erro ao criar categoria: Nenhum dado retornado');
        }

        return data;
    }

    /**
     * Atualiza categoria
     * @param {string} id - ID da categoria
     * @param {Object} categoryData - Dados para atualizar
     * @returns {Promise<Object>} Categoria atualizada
     */
    async update(id, categoryData) {
        const { data, error } = await supabase
            .from('fomi_categories')
            .update(categoryData)
            .eq('id', id)
            .eq('ativo', true)
            .select('*')
            .single();

        if (error) {
            console.error('Erro ao atualizar categoria:', error);
            throw new Error(`Erro ao atualizar categoria: ${error.message}`);
        }

        return data;
    }

    /**
     * Desativa categoria (soft delete)
     * @param {string} id - ID da categoria
     * @returns {Promise<void>}
     */
    async deactivate(id) {
        const { error } = await supabase
            .from('fomi_categories')
            .update({ ativo: false })
            .eq('id', id);

        if (error) {
            console.error('Erro ao desativar categoria:', error);
            throw new Error(`Erro ao desativar categoria: ${error.message}`);
        }
    }
}

module.exports = CategoryRepository;