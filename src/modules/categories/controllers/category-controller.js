// Controller de categorias (CORRIGIDO com validações de plano)
const CategoryService = require('../services/category-service');
const SubscriptionRepository = require('../../billing/repositories/subscription-repository');
const { planHasFeature } = require('../../../utils/plan-limits');

class CategoryController {
    constructor() {
        this.categoryService = new CategoryService();
        this.subscriptionRepository = new SubscriptionRepository();
    }

    /**
     * Lista categorias da loja
     */
    getStoreCategories = async (req, res, next) => {
        try {
            const categories = await this.categoryService.getStoreCategories(req.store.id);
            
            res.json({
                success: true,
                data: { categories }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Busca categoria específica
     */
    getCategoryById = async (req, res, next) => {
        try {
            const category = await this.categoryService.getCategoryById(
                req.params.id,
                req.store.id
            );
            
            res.json({
                success: true,
                data: { category }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Cria nova categoria
     */
    createCategory = async (req, res, next) => {
        try {
            const category = await this.categoryService.createCategory(
                req.store.id,
                req.user.id,
                req.body
            );
            
            res.status(201).json({
                success: true,
                message: 'Categoria criada com sucesso',
                data: { category }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * 🆕 Busca configurações de upload de imagem para categorias
     */
    getImageUploadSettings = async (req, res, next) => {
        try {
            // Busca plano do usuário
            const subscription = await this.subscriptionRepository.findActiveByUserId(req.user.id);
            const userPlan = subscription?.plano || 'fomi_simples';
            
            const canUploadImages = planHasFeature(userPlan, 'category_images');
            
            res.json({
                success: true,
                data: {
                    can_upload_images: canUploadImages,
                    user_plan: userPlan,
                    specifications: canUploadImages ? {
                        dimensions: '100x100 até 512x512px',
                        formats: ['JPEG', 'PNG', 'WebP'],
                        max_size: '2MB',
                        aspect_ratio: 'Quadrado ou próximo (0.5 - 2.0)'
                    } : null,
                    upgrade_message: !canUploadImages ? 
                        'Faça upgrade para o plano Duplo ou Supremo para adicionar imagens às categorias' : null
                }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Faz upload da imagem da categoria (COM VALIDAÇÃO DE PLANO)
     */
    uploadCategoryImage = async (req, res, next) => {
        try {
            // ✅ VALIDAÇÃO DE PLANO NO CONTROLLER
            const subscription = await this.subscriptionRepository.findActiveByUserId(req.user.id);
            const userPlan = subscription?.plano || 'fomi_simples';
            
            if (!planHasFeature(userPlan, 'category_images')) {
                return res.status(403).json({
                    success: false,
                    message: 'Upload de imagens de categorias não disponível no seu plano',
                    upgrade_required: true,
                    current_plan: userPlan,
                    required_plans: ['fomi_duplo', 'fomi_supremo']
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Imagem da categoria é obrigatória'
                });
            }

            const category = await this.categoryService.uploadCategoryImage(
                req.params.id,
                req.store.id,
                req.user.id,
                req.file.buffer
            );
            
            res.json({
                success: true,
                message: 'Imagem da categoria atualizada com sucesso',
                data: { 
                    category,
                    imagem_url: category.imagem_url
                }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Remove imagem da categoria
     */
    removeCategoryImage = async (req, res, next) => {
        try {
            const category = await this.categoryService.removeCategoryImage(
                req.params.id,
                req.store.id
            );
            
            res.json({
                success: true,
                message: 'Imagem da categoria removida com sucesso',
                data: { category }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Atualiza categoria
     */
    updateCategory = async (req, res, next) => {
        try {
            const category = await this.categoryService.updateCategory(
                req.params.id,
                req.store.id,
                req.body
            );
            
            res.json({
                success: true,
                message: 'Categoria atualizada com sucesso',
                data: { category }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Desativa categoria
     */
    deactivateCategory = async (req, res, next) => {
        try {
            await this.categoryService.deactivateCategory(
                req.params.id,
                req.store.id
            );
            
            res.json({
                success: true,
                message: 'Categoria desativada com sucesso'
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = CategoryController;