// Repositório de lojas
const { supabase } = require('../../../config/database');

class StoreRepository {
    /**
     * Busca loja por ID
     * @param {string} id - ID da loja
     * @returns {Promise<Object|null>} Loja ou null
     */
    async findById(id) {
        const { data, error } = await supabase
            .from('fomi_stores')
            .select('*')
            .eq('id', id)
            .eq('ativo', true)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error(`Erro ao buscar loja: ${error.message}`);
        }

        return data;
    }

    /**
     * Busca loja por slug
     * @param {string} slug - Slug da loja
     * @returns {Promise<Object|null>} Loja ou null
     */
    async findBySlug(slug) {
        const { data, error } = await supabase
            .from('fomi_stores')
            .select('*')
            .eq('slug', slug)
            .eq('ativo', true)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error(`Erro ao buscar loja: ${error.message}`);
        }

        return data;
    }

    /**
     * Busca lojas por usuário
     * @param {string} userId - ID do usuário
     * @returns {Promise<Array>} Lista de lojas
     */
    async findByUserId(userId) {
        const { data, error } = await supabase
            .from('fomi_stores')
            .select('*')
            .eq('user_id', userId)
            .eq('ativo', true)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Erro ao buscar lojas: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Conta lojas ativas por usuário e plano
     * @param {string} userId - ID do usuário
     * @param {string} plano - Plano do usuário
     * @returns {Promise<number>} Número de lojas
     */
    async countByUserAndPlan(userId, plano) {
        const { count, error } = await supabase
            .from('fomi_stores')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('plano', plano)
            .eq('ativo', true);

        if (error) {
            throw new Error(`Erro ao contar lojas: ${error.message}`);
        }

        return count || 0;
    }

    /**
     * Verifica se slug existe
     * @param {string} slug - Slug para verificar
     * @returns {Promise<boolean>} True se existe
     */
    async slugExists(slug) {
        const { data, error } = await supabase
            .from('fomi_stores')
            .select('id')
            .eq('slug', slug)
            .eq('ativo', true)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error(`Erro ao verificar slug: ${error.message}`);
        }

        return !!data;
    }

    /**
     * Cria nova loja
     * @param {Object} storeData - Dados da loja
     * @returns {Promise<Object>} Loja criada
     */
    async create(storeData) {
        const { data, error } = await supabase
            .from('fomi_stores')
            .insert([storeData])
            .select('*')
            .single();

        if (error) {
            throw new Error(`Erro ao criar loja: ${error.message}`);
        }

        return data;
    }

    /**
     * Atualiza loja
     * @param {string} id - ID da loja
     * @param {Object} storeData - Dados para atualizar
     * @returns {Promise<Object>} Loja atualizada
     */
    async update(id, storeData) {
        const { data, error } = await supabase
            .from('fomi_stores')
            .update(storeData)
            .eq('id', id)
            .eq('ativo', true)
            .select('*')
            .single();

        if (error) {
            throw new Error(`Erro ao atualizar loja: ${error.message}`);
        }

        return data;
    }

    /**
     * Desativa loja (soft delete)
     * @param {string} id - ID da loja
     * @returns {Promise<void>}
     */
    async deactivate(id) {
        const { error } = await supabase
            .from('fomi_stores')
            .update({ ativo: false })
            .eq('id', id);

        if (error) {
            throw new Error(`Erro ao desativar loja: ${error.message}`);
        }
    }
}

module.exports = StoreRepository;