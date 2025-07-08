// Rotas de billing
const express = require('express');
const BillingController = require('../controllers/billing-controller');
const authMiddleware = require('../../../middleware/auth');

const router = express.Router();
const billingController = new BillingController();

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

// Rotas de assinatura
router.post('/subscription', billingController.createSubscription);
router.get('/subscription', billingController.getSubscription);
router.delete('/subscription', billingController.cancelSubscription);

// Portal de billing
router.post('/portal', billingController.createBillingPortal);

// Faturas
router.get('/invoices', billingController.getInvoices);

module.exports = router;