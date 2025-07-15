// Rotas de categorias (ADICIONADA rota para configurações)
const express = require('express');
const CategoryController = require('../controllers/category-controller');
const validateRequest = require('../../../middleware/validation');
const authMiddleware = require('../../../middleware/auth');
const storeAccessMiddleware = require('../../../middleware/store-access');
const { checkUploadPermission } = require('../../../middleware/feature-validator');
const { uploadImage } = require('../../../middleware/upload');
const { createCategorySchema, updateCategorySchema } = require('../../../schemas/category-schemas');

const router = express.Router();
const categoryController = new CategoryController();

// Middleware de autenticação aplicado globalmente
router.use(authMiddleware);

// Rotas básicas de categorias
router.get('/:storeId', storeAccessMiddleware('storeId'), categoryController.getStoreCategories);
router.post('/:storeId', storeAccessMiddleware('storeId'), validateRequest(createCategorySchema), categoryController.createCategory);
router.get('/:storeId/:id', storeAccessMiddleware('storeId'), categoryController.getCategoryById);
router.put('/:storeId/:id', storeAccessMiddleware('storeId'), validateRequest(updateCategorySchema), categoryController.updateCategory);
router.delete('/:storeId/:id', storeAccessMiddleware('storeId'), categoryController.deactivateCategory);

// 🆕 NOVA ROTA: Configurações de upload
router.get('/:storeId/image-settings', storeAccessMiddleware('storeId'), categoryController.getImageUploadSettings);

// Rotas de upload de imagens
router.post('/:storeId/:id/image', 
    storeAccessMiddleware('storeId'),
    checkUploadPermission('category_image'),
    uploadImage('image', 'category'), 
    categoryController.uploadCategoryImage
);

// Rotas para remover imagens
router.delete('/:storeId/:id/image', storeAccessMiddleware('storeId'), categoryController.removeCategoryImage);

module.exports = router;