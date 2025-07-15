// Serviço de categorias (ATUALIZADO com upload de imagens)
const CategoryRepository = require('../repositories/category-repository');
const SubscriptionRepository = require('../../billing/repositories/subscription-repository');
const { hasReachedLimit, planHasFeature } = require('../../../utils/plan-limits');
const { uploadImage, deleteImage, extractPublicId } = require('../../../config/cloudinary');

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
     * Faz upload da imagem da categoria
     * @param {string} categoryId - ID da categoria
     * @param {string} storeId - ID da loja
     * @param {string} userId - ID do usuário
     * @param {Buffer} imageBuffer - Buffer da imagem
     * @returns {Promise<Object>} Categoria atualizada
     */
    async uploadCategoryImage(categoryId, storeId, userId, imageBuffer) {
        // Verifica se categoria existe e pertence à loja
        const category = await this.getCategoryById(categoryId, storeId);

        // Verifica se usuário tem permissão para upload de imagens de categorias
        const subscription = await this.subscriptionRepository.findActiveByUserId(userId);
        const userPlan = subscription?.plano || 'fomi_simples';
        
        if (!planHasFeature(userPlan, 'category_images')) {
            throw new Error('Upload de imagens de categorias não disponível no seu plano');
        }

        try {
            // Remove imagem anterior se existir
            if (category.imagem_url) {
                const oldPublicId = extractPublicId(category.imagem_url);
                if (oldPublicId) {
                    await deleteImage(oldPublicId);
                }
            }

            // Faz upload da nova imagem
            const result = await uploadImage(imageBuffer, {
                folder: `stores/${storeId}/categories`,
                public_id: `category_${categoryId}_${Date.now()}`,
                transformation: [
                    { width: 300, height: 300, crop: 'fit' },
                    { quality: 'auto:good' }
                ]
            });

            // Atualiza categoria com nova URL
            const updatedCategory = await this.categoryRepository.update(categoryId, {
                imagem_url: result.secure_url
            });

            return updatedCategory;
        } catch (error) {
            console.error('Erro no upload da imagem da categoria:', error);
            throw new Error(`Erro ao fazer upload da imagem: ${error.message}`);
        }
    }

    /**
     * Remove imagem da categoria
     * @param {string} categoryId - ID da categoria
     * @param {string} storeId - ID da loja
     * @returns {Promise<Object>} Categoria atualizada
     */
    async removeCategoryImage(categoryId, storeId) {
        const category = await this.getCategoryById(categoryId, storeId);

        if (category.imagem_url) {
            const publicId = extractPublicId(category.imagem_url);
            if (publicId) {
                await deleteImage(publicId);
            }
        }

        return await this.categoryRepository.update(categoryId, { imagem_url: null });
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