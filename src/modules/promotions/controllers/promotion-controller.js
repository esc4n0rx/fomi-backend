// Controller de promoções
const PromotionService = require('../services/promotion-service');

class PromotionController {
    constructor() {
        this.promotionService = new PromotionService();
    }

    /**
     * Lista promoções da loja
     */
    getStorePromotions = async (req, res, next) => {
        try {
            const onlyActive = req.query.active === 'true';
            const promotions = await this.promotionService.getStorePromotions(
                req.store.id,
                onlyActive
            );
            
            res.json({
                success: true,
                data: { promotions }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Busca promoção específica
     */
    getPromotionById = async (req, res, next) => {
        try {
            const promotion = await this.promotionService.getPromotionById(
                req.params.id,
                req.store.id
            );
            
            res.json({
                success: true,
                data: { promotion }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Cria nova promoção
     */
    createPromotion = async (req, res, next) => {
        try {
            const promotion = await this.promotionService.createPromotion(
                req.store.id,
                req.store.plano,
                req.body
            );
            
            res.status(201).json({
                success: true,
                message: 'Promoção criada com sucesso',
                data: { promotion }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Atualiza promoção
     */
    updatePromotion = async (req, res, next) => {
        try {
            const promotion = await this.promotionService.updatePromotion(
                req.params.id,
                req.store.id,
                req.body
            );
            
            res.json({
                success: true,
                message: 'Promoção atualizada com sucesso',
                data: { promotion }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Desativa promoção
     */
    deactivatePromotion = async (req, res, next) => {
        try {
            await this.promotionService.deactivatePromotion(
                req.params.id,
                req.store.id
            );
            
            res.json({
                success: true,
                message: 'Promoção desativada com sucesso'
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = PromotionController;