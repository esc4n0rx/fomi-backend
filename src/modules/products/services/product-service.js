// Serviço de produtos
const ProductRepository = require('../repositories/product-repository');

class ProductService {
    constructor() {
        this.productRepository = new ProductRepository();
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
     * @param {string} plano - Plano da loja
     * @param {Object} productData - Dados do produto
     * @returns {Promise<Object>} Produto criado
     */
    async createProduct(storeId, plano, productData) {
        // Verifica limite para plano gratuito
        if (plano === 'gratuito') {
            const productCount = await this.productRepository.countByStoreId(storeId);
            if (productCount >= 50) {
                throw new Error('Limite de produtos atingido para o plano gratuito (máximo 50)');
            }
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