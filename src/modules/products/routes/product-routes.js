// Rotas de produtos
const express = require('express');
const ProductController = require('../controllers/product-controller');
const validateRequest = require('../../../middleware/validation');
const authMiddleware = require('../../../middleware/auth');
const storeAccessMiddleware = require('../../../middleware/store-access');
const { createProductSchema, updateProductSchema } = require('../../../schemas/product-schemas');

const router = express.Router();
const productController = new ProductController();

// Todas as rotas precisam de autenticação e acesso à loja
router.use(authMiddleware);
router.use('/:storeId/*', storeAccessMiddleware('storeId'));

// Rotas de produtos
router.get('/:storeId', productController.getStoreProducts);
router.post('/:storeId', validateRequest(createProductSchema), productController.createProduct);
router.get('/:storeId/:id', productController.getProductById);
router.put('/:storeId/:id', validateRequest(updateProductSchema), productController.updateProduct);
router.delete('/:storeId/:id', productController.deactivateProduct);

module.exports = router;