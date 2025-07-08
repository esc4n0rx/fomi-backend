// Controller para dados públicos da loja
const PublicStoreService = require('../services/public-store-service');

class PublicStoreController {
    constructor() {
        this.publicStoreService = new PublicStoreService();
    }

    /**
     * Busca dados públicos da loja
     */
    getPublicStore = async (req, res, next) => {
        try {
            const { slug } = req.params;
            const store = await this.publicStoreService.getPublicStore(slug);
            
            res.json({
                success: true,
                data: { store }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Busca produtos públicos da loja
     */
    getPublicProducts = async (req, res, next) => {
        try {
            const { storeId } = req.params;
            const filters = {
                category_id: req.query.category_id,
                destaque: req.query.destaque === 'true' ? true : undefined
            };

            const products = await this.publicStoreService.getPublicProducts(storeId, filters);
            
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
    getPublicProduct = async (req, res, next) => {
        try {
            const { storeId, productId } = req.params;
            const product = await this.publicStoreService.getPublicProduct(productId, storeId);
            
            res.json({
                success: true,
                data: { product }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Busca categorias públicas da loja
     */
    getPublicCategories = async (req, res, next) => {
        try {
            const { storeId } = req.params;
            const categories = await this.publicStoreService.getPublicCategories(storeId);
            
            res.json({
                success: true,
                data: { categories }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Busca promoções ativas da loja
     */
    getActivePromotions = async (req, res, next) => {
        try {
            const { storeId } = req.params;
            const promotions = await this.publicStoreService.getActivePromotions(storeId);
            
            res.json({
                success: true,
                data: { promotions }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Verifica status da loja
     */
    getStoreStatus = async (req, res, next) => {
        try {
            const { storeId } = req.params;
            const status = await this.publicStoreService.getStoreStatus(storeId);
            
            res.json({
                success: true,
                data: { status }
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = PublicStoreController;