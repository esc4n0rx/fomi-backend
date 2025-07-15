// Controller de produtos (CORRIGIDO com validações de plano)
const ProductService = require('../services/product-service');
const SubscriptionRepository = require('../../billing/repositories/subscription-repository');
const { planHasFeature } = require('../../../utils/plan-limits');

class ProductController {
    constructor() {
        this.productService = new ProductService();
        this.subscriptionRepository = new SubscriptionRepository();
    }

    /**
     * Lista produtos da loja
     */
    getStoreProducts = async (req, res, next) => {
        try {
            const filters = {
                category_id: req.query.category_id,
                disponivel: req.query.disponivel === 'true' ? true : 
                           req.query.disponivel === 'false' ? false : undefined,
                destaque: req.query.destaque === 'true' ? true : 
                         req.query.destaque === 'false' ? false : undefined
            };

            const products = await this.productService.getStoreProducts(req.store.id, filters);
            
            res.json({
                success: true,
                data: { products }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Busca produto específico
     */
    getProductById = async (req, res, next) => {
        try {
            const product = await this.productService.getProductById(
                req.params.id,
                req.store.id
            );
            
            res.json({
                success: true,
                data: { product }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Cria novo produto
     */
    createProduct = async (req, res, next) => {
        try {
            const product = await this.productService.createProduct(
                req.store.id,
                req.user.id,
                req.body
            );
            
            res.status(201).json({
                success: true,
                message: 'Produto criado com sucesso',
                data: { product }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * 🆕 Busca configurações de upload de imagem para produtos
     */
    getImageUploadSettings = async (req, res, next) => {
        try {
            // Busca plano do usuário
            const subscription = await this.subscriptionRepository.findActiveByUserId(req.user.id);
            const userPlan = subscription?.plano || 'fomi_simples';
            
            const canUploadImages = planHasFeature(userPlan, 'product_images');
            
            res.json({
                success: true,
                data: {
                    can_upload_images: canUploadImages,
                    user_plan: userPlan,
                    specifications: canUploadImages ? {
                        main_image: {
                            dimensions: '200x200 até 1024x1024px',
                            formats: ['JPEG', 'PNG', 'WebP'],
                            max_size: '3MB',
                            aspect_ratio: 'Flexível (0.5 - 2.0)'
                        },
                        extra_images: {
                            max_count: 5,
                            same_specs: 'Mesmas especificações da imagem principal'
                        }
                    } : null,
                    upgrade_message: !canUploadImages ? 
                        'Faça upgrade para o plano Duplo ou Supremo para adicionar imagens aos produtos' : null
                }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Faz upload da imagem principal do produto (COM VALIDAÇÃO DE PLANO)
     */
    uploadProductImage = async (req, res, next) => {
        try {
            // ✅ VALIDAÇÃO DE PLANO NO CONTROLLER
            const subscription = await this.subscriptionRepository.findActiveByUserId(req.user.id);
            const userPlan = subscription?.plano || 'fomi_simples';
            
            if (!planHasFeature(userPlan, 'product_images')) {
                return res.status(403).json({
                    success: false,
                    message: 'Upload de imagens de produtos não disponível no seu plano',
                    upgrade_required: true,
                    current_plan: userPlan,
                    required_plans: ['fomi_duplo', 'fomi_supremo']
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Imagem do produto é obrigatória'
                });
            }

            const product = await this.productService.uploadProductImage(
                req.params.id,
                req.store.id,
                req.user.id,
                req.file.buffer
            );
            
            res.json({
                success: true,
                message: 'Imagem do produto atualizada com sucesso',
                data: { 
                    product,
                    imagem_url: product.imagem_url
                }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Adiciona imagem extra ao produto (COM VALIDAÇÃO DE PLANO)
     */
    addProductExtraImage = async (req, res, next) => {
        try {
            // ✅ VALIDAÇÃO DE PLANO NO CONTROLLER
            const subscription = await this.subscriptionRepository.findActiveByUserId(req.user.id);
            const userPlan = subscription?.plano || 'fomi_simples';
            
            if (!planHasFeature(userPlan, 'product_images')) {
                return res.status(403).json({
                    success: false,
                    message: 'Upload de imagens extras não disponível no seu plano',
                    upgrade_required: true,
                    current_plan: userPlan,
                    required_plans: ['fomi_duplo', 'fomi_supremo']
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Imagem é obrigatória'
                });
            }

            const product = await this.productService.addProductExtraImage(
                req.params.id,
                req.store.id,
                req.user.id,
                req.file.buffer
            );
            
            res.json({
                success: true,
                message: 'Imagem extra adicionada com sucesso',
                data: { 
                    product,
                    imagens_extras: product.imagens_extras
                }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Remove imagem extra do produto
     */
    removeProductExtraImage = async (req, res, next) => {
        try {
            const imageIndex = parseInt(req.params.imageIndex);
            
            if (isNaN(imageIndex)) {
                return res.status(400).json({
                    success: false,
                    message: 'Índice da imagem deve ser um número'
                });
            }

            const product = await this.productService.removeProductExtraImage(
                req.params.id,
                req.store.id,
                imageIndex
            );
            
            res.json({
                success: true,
                message: 'Imagem extra removida com sucesso',
                data: { product }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Remove imagem principal do produto
     */
    removeProductImage = async (req, res, next) => {
        try {
            const product = await this.productService.removeProductImage(
                req.params.id,
                req.store.id
            );
            
            res.json({
                success: true,
                message: 'Imagem do produto removida com sucesso',
                data: { product }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Atualiza produto
     */
    updateProduct = async (req, res, next) => {
        try {
            const product = await this.productService.updateProduct(
                req.params.id,
                req.store.id,
                req.body
            );
            
            res.json({
                success: true,
                message: 'Produto atualizado com sucesso',
                data: { product }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Desativa produto
     */
    deactivateProduct = async (req, res, next) => {
        try {
            await this.productService.deactivateProduct(
                req.params.id,
                req.store.id
            );
            
            res.json({
                success: true,
                message: 'Produto desativado com sucesso'
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = ProductController;