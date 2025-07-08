// Controller de produtos (ATUALIZADO)
const ProductService = require('../services/product-service');

class ProductController {
    constructor() {
        this.productService = new ProductService();
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
                req.user.id, // Adicionado userId para verificar plano
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