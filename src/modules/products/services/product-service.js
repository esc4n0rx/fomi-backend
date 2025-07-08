// Serviço de produtos (ATUALIZADO com validação de planos)
const ProductRepository = require('../repositories/product-repository');
const SubscriptionRepository = require('../../billing/repositories/subscription-repository');
const { hasReachedLimit } = require('../../../utils/plan-limits');

class ProductService {
    constructor() {
        this.productRepository = new ProductRepository();
        this.subscriptionRepository = new SubscriptionRepository();
    }

    /**
     * Lista produtos da loja
     * @param {string} storeId - ID da loja
     * @param {Object} filters - Filtros opcionais
     * @returns {Promise<Array>} Lista de produtos
     */
    async getStoreProducts(storeId, filters = {}) {
        return await this.productRepository.findByStoreId(storeId, filters);
    }

    /**
     * Busca produto por ID
     * @param {string} productId - ID do produto
     * @param {string} storeId - ID da loja
     * @returns {Promise<Object>} Produto
     */
    async getProductById(productId, storeId) {
        const product = await this.productRepository.findById(productId);
        
        if (!product) {
            throw new Error('Produto não encontrado');
        }

        if (product.store_id !== storeId) {
            throw new Error('Acesso negado');
        }

        return product;
    }

    /**
     * Cria novo produto
     * @param {string} storeId - ID da loja
     * @param {string} userId - ID do usuário (para buscar plano)
     * @param {Object} productData - Dados do produto
     * @returns {Promise<Object>} Produto criado
     */
    async createProduct(storeId, userId, productData) {
        // Busca assinatura ativa do usuário para verificar plano
        const subscription = await this.subscriptionRepository.findActiveByUserId(userId);
        const userPlan = subscription?.plano || 'fomi_simples';

        // Verifica limite de produtos para o plano
        const productCount = await this.productRepository.countByStoreId(storeId);
        if (hasReachedLimit(userPlan, 'products_per_store', productCount)) {
            const limits = require('../../../utils/plan-limits').getPlanLimits(userPlan);
            throw new Error(`Limite de produtos atingido para o plano ${userPlan} (máximo ${limits.products_per_store})`);
        }

        // Verifica se categoria pertence à loja (se informada)
        if (productData.category_id) {
            const categoryBelongs = await this.productRepository.categoryBelongsToStore(
                productData.category_id,
                storeId
            );
            if (!categoryBelongs) {
                throw new Error('Categoria não encontrada ou não pertence à loja');
            }
        }

        const product = await this.productRepository.create({
            store_id: storeId,
            ...productData
        });

        return product;
    }

    /**
     * Atualiza produto
     * @param {string} productId - ID do produto
     * @param {string} storeId - ID da loja
     * @param {Object} productData - Dados para atualizar
     * @returns {Promise<Object>} Produto atualizado
     */
    async updateProduct(productId, storeId, productData) {
        // Verifica se produto existe e pertence à loja
        await this.getProductById(productId, storeId);

        // Verifica se categoria pertence à loja (se informada)
        if (productData.category_id) {
            const categoryBelongs = await this.productRepository.categoryBelongsToStore(
                productData.category_id,
                storeId
            );
            if (!categoryBelongs) {
                throw new Error('Categoria não encontrada ou não pertence à loja');
            }
        }

        const updatedProduct = await this.productRepository.update(productId, productData);
        return updatedProduct;
    }

    /**
     * Desativa produto
     * @param {string} productId - ID do produto
     * @param {string} storeId - ID da loja
     * @returns {Promise<void>}
     */
    async deactivateProduct(productId, storeId) {
        // Verifica se produto existe e pertence à loja
        await this.getProductById(productId, storeId);

        await this.productRepository.deactivate(productId);
    }
}

module.exports = ProductService;