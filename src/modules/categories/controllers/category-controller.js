// Controller de categorias
const CategoryService = require('../services/category-service');

class CategoryController {
    constructor() {
        this.categoryService = new CategoryService();
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
                req.store.plano,
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