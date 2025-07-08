// Rotas de promoções
const express = require('express');
const PromotionController = require('../controllers/promotion-controller');
const validateRequest = require('../../../middleware/validation');
const authMiddleware = require('../../../middleware/auth');
const storeAccessMiddleware = require('../../../middleware/store-access');
const { createPromotionSchema, updatePromotionSchema } = require('../../../schemas/promotion-schemas');

const router = express.Router();
const promotionController = new PromotionController();

// Middleware de autenticação aplicado globalmente
router.use(authMiddleware);

// Rotas de promoções
router.get('/:storeId', storeAccessMiddleware('storeId'), promotionController.getStorePromotions);
router.post('/:storeId', storeAccessMiddleware('storeId'), validateRequest(createPromotionSchema), promotionController.createPromotion);
router.get('/:storeId/:id', storeAccessMiddleware('storeId'), promotionController.getPromotionById);
router.put('/:storeId/:id', storeAccessMiddleware('storeId'), validateRequest(updatePromotionSchema), promotionController.updatePromotion);
router.delete('/:storeId/:id', storeAccessMiddleware('storeId'), promotionController.deactivatePromotion);

module.exports = router;