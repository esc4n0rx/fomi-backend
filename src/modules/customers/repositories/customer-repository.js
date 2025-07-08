// Repositório de clientes
const { supabase } = require('../../../config/database');

class CustomerRepository {
    /**
     * Busca cliente por telefone
     * @param {string} telefone - Telefone do cliente
     * @returns {Promise<Object|null>} Cliente ou null
     */
    async findByPhone(telefone) {
        const { data, error } = await supabase
            .from('fomi_customers')
            .select('*')
            .eq('telefone', telefone)
            .eq('ativo', true)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error(`Erro ao buscar cliente: ${error.message}`);
        }

        return data;
    }

    /**
     * Busca cliente por ID
     * @param {string} id - ID do cliente
     * @returns {Promise<Object|null>} Cliente ou null
     */
    async findById(id) {
        const { data, error } = await supabase
            .from('fomi_customers')
            .select('*')
            .eq('id', id)
            .eq('ativo', true)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error(`Erro ao buscar cliente: ${error.message}`);
        }

        return data;
    }

    /**
     * Cria novo cliente
     * @param {Object} customerData - Dados do cliente
     * @returns {Promise<Object>} Cliente criado
     */
    async create(customerData) {
        const { data, error } = await supabase
            .from('fomi_customers')
            .insert([{
                ...customerData,
                endereco_cep: customerData.endereco_cep ? 
                    customerData.endereco_cep.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2') : null
            }])
            .select('*')
            .single();

        if (error) {
            throw new Error(`Erro ao criar cliente: ${error.message}`);
        }

        return data;
    }

    /**
     * Atualiza cliente
     * @param {string} id - ID do cliente
     * @param {Object} customerData - Dados para atualizar
     * @returns {Promise<Object>} Cliente atualizado
     */
    async update(id, customerData) {
        const updateData = { ...customerData };
        
        // Formata CEP se fornecido
        if (updateData.endereco_cep) {
            updateData.endereco_cep = updateData.endereco_cep
                .replace(/\D/g, '')
                .replace(/(\d{5})(\d{3})/, '$1-$2');
        }

        const { data, error } = await supabase
            .from('fomi_customers')
            .update(updateData)
            .eq('id', id)
            .eq('ativo', true)
            .select('*')
            .single();

        if (error) {
            throw new Error(`Erro ao atualizar cliente: ${error.message}`);
        }

        return data;
    }
}

module.exports = CustomerRepository;