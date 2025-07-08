// Serviço de categorias (ATUALIZADO com validação de planos)
const CategoryRepository = require('../repositories/category-repository');
const SubscriptionRepository = require('../../billing/repositories/subscription-repository');
const { hasReachedLimit } = require('../../../utils/plan-limits');

class CategoryService {
    constructor() {
        this.categoryRepository = new CategoryRepository();
        this.subscriptionRepository = new SubscriptionRepository();
    }

    /**
     * Lista categorias da loja
     * @param {string} storeId - ID da loja
     * @returns {Promise<Array>} Lista de categorias
     */
    async getStoreCategories(storeId) {
        return await this.categoryRepository.findByStoreId(storeId);
    }

    /**
     * Busca categoria por ID
     * @param {string} categoryId - ID da categoria
     * @param {string} storeId - ID da loja
     * @returns {Promise<Object>} Categoria
     */
    async getCategoryById(categoryId, storeId) {
        const category = await this.categoryRepository.findById(categoryId);
        
        if (!category) {
            throw new Error('Categoria não encontrada');
        }

        if (category.store_id !== storeId) {
            throw new Error('Acesso negado');
        }

        return category;
    }

    /**
     * Cria nova categoria
     * @param {string} storeId - ID da loja
     * @param {string} userId - ID do usuário (para buscar plano)
     * @param {Object} categoryData - Dados da categoria
     * @returns {Promise<Object>} Categoria criada
     */
    async createCategory(storeId, userId, categoryData) {
        // Busca assinatura ativa do usuário para verificar plano
        const subscription = await this.subscriptionRepository.findActiveByUserId(userId);
        const userPlan = subscription?.plano || 'fomi_simples';

        // Verifica limite de categorias para o plano
        const categoryCount = await this.categoryRepository.countByStoreId(storeId);
        if (hasReachedLimit(userPlan, 'categories_per_store', categoryCount)) {
            const limits = require('../../../utils/plan-limits').getPlanLimits(userPlan);
            throw new Error(`Limite de categorias atingido para o plano ${userPlan} (máximo ${limits.categories_per_store})`);
        }

        const category = await this.categoryRepository.create({
            store_id: storeId,
            ...categoryData
        });

        return category;
    }

    /**
     * Atualiza categoria
     * @param {string} categoryId - ID da categoria
     * @param {string} storeId - ID da loja
     * @param {Object} categoryData - Dados para atualizar
     * @returns {Promise<Object>} Categoria atualizada
     */
    async updateCategory(categoryId, storeId, categoryData) {
        // Verifica se categoria existe e pertence à loja
        await this.getCategoryById(categoryId, storeId);

        const updatedCategory = await this.categoryRepository.update(categoryId, categoryData);
        return updatedCategory;
    }

    /**
     * Desativa categoria
     * @param {string} categoryId - ID da categoria
     * @param {string} storeId - ID da loja
     * @returns {Promise<void>}
     */
    async deactivateCategory(categoryId, storeId) {
        // Verifica se categoria existe e pertence à loja
        await this.getCategoryById(categoryId, storeId);

        await this.categoryRepository.deactivate(categoryId);
    }
}

module.exports = CategoryService;