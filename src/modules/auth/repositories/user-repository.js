// Repositório de usuários
const { supabase } = require('../../../config/database');
const { formatCPF } = require('../../../utils/cpf-validator');

class UserRepository {
    /**
     * Busca usuário por email
     * @param {string} email - Email do usuário
     * @returns {Promise<Object|null>} Usuário ou null
     */
    async findByEmail(email) {
        const { data, error } = await supabase
            .from('fomi_users')
            .select('*')
            .eq('email', email)
            .eq('ativo', true)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error(`Erro ao buscar usuário: ${error.message}`);
        }

        return data;
    }

    /**
     * Busca usuário por CPF
     * @param {string} cpf - CPF do usuário
     * @returns {Promise<Object|null>} Usuário ou null
     */
    async findByCPF(cpf) {
        const { data, error } = await supabase
            .from('fomi_users')
            .select('*')
            .eq('cpf', formatCPF(cpf))
            .eq('ativo', true)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error(`Erro ao buscar usuário: ${error.message}`);
        }

        return data;
    }

    /**
     * Busca usuário por ID
     * @param {string} id - ID do usuário
     * @returns {Promise<Object|null>} Usuário ou null
     */
    async findById(id) {
        const { data, error } = await supabase
            .from('fomi_users')
            .select('*')
            .eq('id', id)
            .eq('ativo', true)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error(`Erro ao buscar usuário: ${error.message}`);
        }

        return data;
    }

    /**
     * Cria novo usuário
     * @param {Object} userData - Dados do usuário
     * @returns {Promise<Object>} Usuário criado
     */
    async create(userData) {
        const { data, error } = await supabase
            .from('fomi_users')
            .insert([{
                ...userData,
                cpf: formatCPF(userData.cpf),
                endereco_cep: userData.endereco_cep.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2')
            }])
            .select('id, nome, email, data_nascimento, cpf, endereco_cep, endereco_rua, endereco_numero, endereco_complemento, endereco_bairro, endereco_cidade, endereco_estado, codigo_convite, email_verificado, created_at')
            .single();

        if (error) {
            throw new Error(`Erro ao criar usuário: ${error.message}`);
        }

        return data;
    }
}

module.exports = UserRepository;