// Rotas de promoções
const express = require('express');
const PromotionController = require('../controllers/promotion-controller');
const validateRequest = require('../../../middleware/validation');
const authMiddleware = require('../../../middleware/auth');
const storeAccessMiddleware = require('../../../middleware/store-access');
const { createPromotionSchema, updatePromotionSchema } = require('../../../schemas/promotion-schemas');

const router = express.Router();
const promotionController = new PromotionController();

// Todas as rotas precisam de autenticação e acesso à loja
router.use(authMiddleware);
router.use('/:storeId/*', storeAccessMiddleware('storeId'));

// Rotas de promoções
router.get('/:storeId', promotionController.getStorePromotions);
router.post('/:storeId', validateRequest(createPromotionSchema), promotionController.createPromotion);
router.get('/:storeId/:id', promotionController.getPromotionById);
router.put('/:storeId/:id', validateRequest(updatePromotionSchema), promotionController.updatePromotion);
router.delete('/:storeId/:id', promotionController.deactivatePromotion);

module.exports = router;