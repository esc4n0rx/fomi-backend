// Rotas de produtos (ADICIONADA rota para configurações)
const express = require('express');
const ProductController = require('../controllers/product-controller');
const validateRequest = require('../../../middleware/validation');
const authMiddleware = require('../../../middleware/auth');
const storeAccessMiddleware = require('../../../middleware/store-access');
const { checkUploadPermission } = require('../../../middleware/feature-validator');
const { uploadImage } = require('../../../middleware/upload');
const { createProductSchema, updateProductSchema } = require('../../../schemas/product-schemas');

const router = express.Router();
const productController = new ProductController();

// Middleware de autenticação aplicado globalmente
router.use(authMiddleware);

// Rotas básicas de produtos
router.get('/:storeId', storeAccessMiddleware('storeId'), productController.getStoreProducts);
router.post('/:storeId', storeAccessMiddleware('storeId'), validateRequest(createProductSchema), productController.createProduct);
router.get('/:storeId/:id', storeAccessMiddleware('storeId'), productController.getProductById);
router.put('/:storeId/:id', storeAccessMiddleware('storeId'), validateRequest(updateProductSchema), productController.updateProduct);
router.delete('/:storeId/:id', storeAccessMiddleware('storeId'), productController.deactivateProduct);

// 🆕 NOVA ROTA: Configurações de upload
router.get('/:storeId/image-settings', storeAccessMiddleware('storeId'), productController.getImageUploadSettings);

// Rotas de upload de imagens
router.post('/:storeId/:id/image', 
    storeAccessMiddleware('storeId'),
    checkUploadPermission('product_image'),
    uploadImage('image', 'product'), 
    productController.uploadProductImage
);

router.post('/:storeId/:id/extra-image', 
    storeAccessMiddleware('storeId'),
    checkUploadPermission('product_image'),
    uploadImage('image', 'product'), 
    productController.addProductExtraImage
);

// Rotas para remover imagens
router.delete('/:storeId/:id/image', storeAccessMiddleware('storeId'), productController.removeProductImage);
router.delete('/:storeId/:id/extra-image/:imageIndex', storeAccessMiddleware('storeId'), productController.removeProductExtraImage);

module.exports = router;