// Serviço de produtos (ATUALIZADO com upload de imagens)
const ProductRepository = require('../repositories/product-repository');
const SubscriptionRepository = require('../../billing/repositories/subscription-repository');
const { hasReachedLimit, planHasFeature } = require('../../../utils/plan-limits');
const { uploadImage, deleteImage, extractPublicId } = require('../../../config/cloudinary');

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
     * Faz upload da imagem principal do produto
     * @param {string} productId - ID do produto
     * @param {string} storeId - ID da loja
     * @param {string} userId - ID do usuário
     * @param {Buffer} imageBuffer - Buffer da imagem
     * @returns {Promise<Object>} Produto atualizado
     */
    async uploadProductImage(productId, storeId, userId, imageBuffer) {
        // Verifica se produto existe e pertence à loja
        const product = await this.getProductById(productId, storeId);

        // Verifica se usuário tem permissão para upload de imagens de produtos
        const subscription = await this.subscriptionRepository.findActiveByUserId(userId);
        const userPlan = subscription?.plano || 'fomi_simples';
        
        if (!planHasFeature(userPlan, 'product_images')) {
            throw new Error('Upload de imagens de produtos não disponível no seu plano');
        }

        try {
            // Remove imagem anterior se existir
            if (product.imagem_url) {
                const oldPublicId = extractPublicId(product.imagem_url);
                if (oldPublicId) {
                    await deleteImage(oldPublicId);
                }
            }

            // Faz upload da nova imagem
            const result = await uploadImage(imageBuffer, {
                folder: `stores/${storeId}/products`,
                public_id: `product_${productId}_${Date.now()}`,
                transformation: [
                    { width: 600, height: 600, crop: 'fit' },
                    { quality: 'auto:good' }
                ]
            });

            // Atualiza produto com nova URL
            const updatedProduct = await this.productRepository.update(productId, {
                imagem_url: result.secure_url
            });

            return updatedProduct;
        } catch (error) {
            console.error('Erro no upload da imagem do produto:', error);
            throw new Error(`Erro ao fazer upload da imagem: ${error.message}`);
        }
    }

    /**
     * Adiciona imagem extra ao produto
     * @param {string} productId - ID do produto
     * @param {string} storeId - ID da loja
     * @param {string} userId - ID do usuário
     * @param {Buffer} imageBuffer - Buffer da imagem
     * @returns {Promise<Object>} Produto atualizado
     */
    async addProductExtraImage(productId, storeId, userId, imageBuffer) {
        // Verifica se produto existe e pertence à loja
        const product = await this.getProductById(productId, storeId);

        // Verifica se usuário tem permissão
        const subscription = await this.subscriptionRepository.findActiveByUserId(userId);
        const userPlan = subscription?.plano || 'fomi_simples';
        
        if (!planHasFeature(userPlan, 'product_images')) {
            throw new Error('Upload de imagens de produtos não disponível no seu plano');
        }

        // Verifica limite de imagens extras (máximo 5)
        const currentExtras = product.imagens_extras || [];
        if (currentExtras.length >= 5) {
            throw new Error('Máximo de 5 imagens extras por produto');
        }

        try {
            // Faz upload da imagem
            const result = await uploadImage(imageBuffer, {
                folder: `stores/${storeId}/products/extras`,
                public_id: `product_${productId}_extra_${currentExtras.length + 1}_${Date.now()}`,
                transformation: [
                    { width: 600, height: 600, crop: 'fit' },
                    { quality: 'auto:good' }
                ]
            });

            // Atualiza produto adicionando nova URL às imagens extras
            const updatedExtras = [...currentExtras, result.secure_url];
            const updatedProduct = await this.productRepository.update(productId, {
                imagens_extras: updatedExtras
            });

            return updatedProduct;
        } catch (error) {
            console.error('Erro no upload da imagem extra do produto:', error);
            throw new Error(`Erro ao fazer upload da imagem extra: ${error.message}`);
        }
    }

    /**
     * Remove imagem extra do produto
     * @param {string} productId - ID do produto
     * @param {string} storeId - ID da loja
     * @param {number} imageIndex - Índice da imagem a ser removida
     * @returns {Promise<Object>} Produto atualizado
     */
    async removeProductExtraImage(productId, storeId, imageIndex) {
        const product = await this.getProductById(productId, storeId);
        const currentExtras = product.imagens_extras || [];

        if (imageIndex < 0 || imageIndex >= currentExtras.length) {
            throw new Error('Índice de imagem inválido');
        }

        try {
            // Remove imagem do Cloudinary
            const imageUrl = currentExtras[imageIndex];
            const publicId = extractPublicId(imageUrl);
            if (publicId) {
                await deleteImage(publicId);
            }

            // Remove URL do array
            const updatedExtras = currentExtras.filter((_, index) => index !== imageIndex);
            const updatedProduct = await this.productRepository.update(productId, {
                imagens_extras: updatedExtras
            });

            return updatedProduct;
        } catch (error) {
            console.error('Erro ao remover imagem extra:', error);
            throw new Error(`Erro ao remover imagem: ${error.message}`);
        }
    }

    /**
     * Remove imagem principal do produto
     * @param {string} productId - ID do produto
     * @param {string} storeId - ID da loja
     * @returns {Promise<Object>} Produto atualizado
     */
    async removeProductImage(productId, storeId) {
        const product = await this.getProductById(productId, storeId);

        if (product.imagem_url) {
            const publicId = extractPublicId(product.imagem_url);
            if (publicId) {
                await deleteImage(publicId);
            }
        }

        return await this.productRepository.update(productId, { imagem_url: null });
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