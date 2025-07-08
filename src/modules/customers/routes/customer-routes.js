// Rotas de clientes
const express = require('express');
const CustomerController = require('../controllers/customer-controller');
const validateRequest = require('../../../middleware/validation');
const { customerSchema } = require('../../../schemas/customer-schemas');

const router = express.Router();
const customerController = new CustomerController();

// Rotas públicas de clientes (sem autenticação JWT)
router.get('/:id', customerController.getCustomerById);
router.put('/:id', validateRequest(customerSchema), customerController.updateCustomer);

module.exports = router;