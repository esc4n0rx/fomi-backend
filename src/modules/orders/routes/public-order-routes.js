// Rotas de pedidos (área pública)
const express = require('express');
const PublicOrderController = require('../controllers/public-order-controller');
const validateRequest = require('../../../middleware/validation');
const { createOrderSchema } = require('../../../schemas/order-schemas');

const router = express.Router();
const publicOrderController = new PublicOrderController();

// Rotas públicas de pedidos
router.post('/:storeId', validateRequest(createOrderSchema), publicOrderController.createOrder);
router.get('/tracking/:numeroPedido', publicOrderController.getOrderByNumber);

module.exports = router;