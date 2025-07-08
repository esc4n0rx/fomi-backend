// Rotas públicas da loja
const express = require('express');
const PublicStoreController = require('../controllers/public-store-controller');

const router = express.Router();
const publicStoreController = new PublicStoreController();

// Rotas públicas
router.get('/store/:slug', publicStoreController.getPublicStore);
router.get('/store/:storeId/products', publicStoreController.getPublicProducts);
router.get('/store/:storeId/products/:productId', publicStoreController.getPublicProduct);
router.get('/store/:storeId/categories', publicStoreController.getPublicCategories);
router.get('/store/:storeId/promotions', publicStoreController.getActivePromotions);
router.get('/store/:storeId/status', publicStoreController.getStoreStatus);

module.exports = router;