// Rotas de cupons
const express = require('express');
const CouponController = require('../controllers/coupon-controller');
const validateRequest = require('../../../middleware/validation');
const authMiddleware = require('../../../middleware/auth');
const storeAccessMiddleware = require('../../../middleware/store-access');
const { createCouponSchema, updateCouponSchema } = require('../../../schemas/coupon-schemas');

const router = express.Router();
const couponController = new CouponController();

// Todas as rotas precisam de autenticação e acesso à loja
router.use(authMiddleware);
router.use('/:storeId/*', storeAccessMiddleware('storeId'));

// Rotas de cupons
router.get('/:storeId', couponController.getStoreCoupons);
router.post('/:storeId', validateRequest(createCouponSchema), couponController.createCoupon);
router.post('/:storeId/validate', couponController.validateCoupon);
router.get('/:storeId/:id', couponController.getCouponById);
router.put('/:storeId/:id', validateRequest(updateCouponSchema), couponController.updateCoupon);
router.delete('/:storeId/:id', couponController.deactivateCoupon);

module.exports = router;