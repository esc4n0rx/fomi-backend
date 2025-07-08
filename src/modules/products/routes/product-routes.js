// Rotas de produtos
const express = require('express');
const ProductController = require('../controllers/product-controller');
const validateRequest = require('../../../middleware/validation');
const authMiddleware = require('../../../middleware/auth');
const storeAccessMiddleware = require('../../../middleware/store-access');
const { createProductSchema, updateProductSchema } = require('../../../schemas/product-schemas');

const router = express.Router();
const productController = new ProductController();

// Middleware de autenticação aplicado globalmente
router.use(authMiddleware);

// Rotas de produtos
router.get('/:storeId', storeAccessMiddleware('storeId'), productController.getStoreProducts);
router.post('/:storeId', storeAccessMiddleware('storeId'), validateRequest(createProductSchema), productController.createProduct);
router.get('/:storeId/:id', storeAccessMiddleware('storeId'), productController.getProductById);
router.put('/:storeId/:id', storeAccessMiddleware('storeId'), validateRequest(updateProductSchema), productController.updateProduct);
router.delete('/:storeId/:id', storeAccessMiddleware('storeId'), productController.deactivateProduct);

module.exports = router;