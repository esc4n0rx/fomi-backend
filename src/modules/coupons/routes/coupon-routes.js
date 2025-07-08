// Rotas de cupons
const express = require('express');
const CouponController = require('../controllers/coupon-controller');
const validateRequest = require('../../../middleware/validation');
const authMiddleware = require('../../../middleware/auth');
const storeAccessMiddleware = require('../../../middleware/store-access');
const { createCouponSchema, updateCouponSchema } = require('../../../schemas/coupon-schemas');

const router = express.Router();
const couponController = new CouponController();

// Middleware de autenticação aplicado globalmente
router.use(authMiddleware);

// Rotas de cupons
router.get('/:storeId', storeAccessMiddleware('storeId'), couponController.getStoreCoupons);
router.post('/:storeId', storeAccessMiddleware('storeId'), validateRequest(createCouponSchema), couponController.createCoupon);
router.post('/:storeId/validate', storeAccessMiddleware('storeId'), couponController.validateCoupon);
router.get('/:storeId/:id', storeAccessMiddleware('storeId'), couponController.getCouponById);
router.put('/:storeId/:id', storeAccessMiddleware('storeId'), validateRequest(updateCouponSchema), couponController.updateCoupon);
router.delete('/:storeId/:id', storeAccessMiddleware('storeId'), couponController.deactivateCoupon);

module.exports = router;