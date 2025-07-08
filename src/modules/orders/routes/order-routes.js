// Rotas de pedidos (área administrativa)
const express = require('express');
const OrderController = require('../controllers/order-controller');
const validateRequest = require('../../../middleware/validation');
const authMiddleware = require('../../../middleware/auth');
const storeAccessMiddleware = require('../../../middleware/store-access');
const { updateOrderStatusSchema, getOrdersSchema } = require('../../../schemas/order-schemas');

const router = express.Router();
const orderController = new OrderController();

// Middleware de autenticação aplicado globalmente
router.use(authMiddleware);

// Rotas de pedidos
router.get('/:storeId', storeAccessMiddleware('storeId'), orderController.getStoreOrders);
router.get('/:storeId/statistics', storeAccessMiddleware('storeId'), orderController.getStoreStatistics);
router.get('/:storeId/:id', storeAccessMiddleware('storeId'), orderController.getStoreOrder);
router.patch('/:storeId/:id/status', storeAccessMiddleware('storeId'), validateRequest(updateOrderStatusSchema), orderController.updateOrderStatus);
router.post('/:storeId/:id/notes', storeAccessMiddleware('storeId'), orderController.addOrderNote);

module.exports = router;