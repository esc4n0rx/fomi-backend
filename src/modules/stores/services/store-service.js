// Serviço de lojas
const StoreRepository = require('../repositories/store-repository');
const { generateSlug, generateUniqueSlug } = require('../../../utils/slug-generator');

class StoreService {
    constructor() {
        this.storeRepository = new StoreRepository();
    }

    /**
     * Cria nova loja
     * @param {string} userId - ID do usuário
     * @param {Object} storeData - Dados da loja
     * @returns {Promise<Object>} Loja criada
     */
    async createStore(userId, storeData) {
        // Verifica limite de lojas para plano gratuito
        const storeCount = await this.storeRepository.countByUserAndPlan(userId, 'gratuito');
        if (storeCount >= 1) {
            throw new Error('Limite de lojas atingido para o plano gratuito');
        }

        // Gera slug único
        const baseSlug = generateSlug(storeData.nome);
        const uniqueSlug = await generateUniqueSlug(
            baseSlug,
            (slug) => this.storeRepository.slugExists(slug)
        );

        // Formata CEP se fornecido
        let formattedCep = storeData.endereco_cep;
        if (formattedCep) {
            formattedCep = formattedCep.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2');
        }

        // Cria loja
        const store = await this.storeRepository.create({
            user_id: userId,
            slug: uniqueSlug,
            endereco_cep: formattedCep,
            plano: 'gratuito',
            ...storeData
        });

        return store;
    }

    /**
     * Busca lojas do usuário
     * @param {string} userId - ID do usuário
     * @returns {Promise<Array>} Lista de lojas
     */
    async getUserStores(userId) {
        return await this.storeRepository.findByUserId(userId);
    }

    /**
     * Busca loja por ID (verificando propriedade)
     * @param {string} storeId - ID da loja
     * @param {string} userId - ID do usuário
     * @returns {Promise<Object>} Loja
     */
    async getUserStore(storeId, userId) {
        const store = await this.storeRepository.findById(storeId);
        
        if (!store) {
            throw new Error('Loja não encontrada');
        }

        if (store.user_id !== userId) {
            throw new Error('Acesso negado');
        }

        return store;
    }

    /**
     * Busca loja pública por slug
     * @param {string} slug - Slug da loja
     * @returns {Promise<Object>} Loja pública
     */
    async getPublicStore(slug) {
        const store = await this.storeRepository.findBySlug(slug);
        
        if (!store) {
            throw new Error('Loja não encontrada');
        }

        // Remove dados sensíveis para visualização pública
        const { user_id, plano, ...publicStore } = store;
        return publicStore;
    }

    /**
     * Atualiza loja
     * @param {string} storeId - ID da loja
     * @param {string} userId - ID do usuário
     * @param {Object} storeData - Dados para atualizar
     * @returns {Promise<Object>} Loja atualizada
     */
    async updateStore(storeId, userId, storeData) {
        // Verifica se loja existe e pertence ao usuário
        await this.getUserStore(storeId, userId);

        // Formata CEP se fornecido
        if (storeData.endereco_cep) {
            storeData.endereco_cep = storeData.endereco_cep
                .replace(/\D/g, '')
                .replace(/(\d{5})(\d{3})/, '$1-$2');
        }

        // Atualiza loja
        const updatedStore = await this.storeRepository.update(storeId, storeData);
        return updatedStore;
    }

    /**
     * Desativa loja
     * @param {string} storeId - ID da loja
     * @param {string} userId - ID do usuário
     * @returns {Promise<void>}
     */
    async deactivateStore(storeId, userId) {
        // Verifica se loja existe e pertence ao usuário
        await this.getUserStore(storeId, userId);

        // Desativa loja
        await this.storeRepository.deactivate(storeId);
    }
}

module.exports = StoreService;