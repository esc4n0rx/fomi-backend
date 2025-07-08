// Rotas de categorias
const express = require('express');
const CategoryController = require('../controllers/category-controller');
const validateRequest = require('../../../middleware/validation');
const authMiddleware = require('../../../middleware/auth');
const storeAccessMiddleware = require('../../../middleware/store-access');
const { createCategorySchema, updateCategorySchema } = require('../../../schemas/category-schemas');

const router = express.Router();
const categoryController = new CategoryController();

// Middleware de autenticação aplicado globalmente
router.use(authMiddleware);

// Rotas de categorias
router.get('/:storeId', storeAccessMiddleware('storeId'), categoryController.getStoreCategories);
router.post('/:storeId', storeAccessMiddleware('storeId'), validateRequest(createCategorySchema), categoryController.createCategory);
router.get('/:storeId/:id', storeAccessMiddleware('storeId'), categoryController.getCategoryById);
router.put('/:storeId/:id', storeAccessMiddleware('storeId'), validateRequest(updateCategorySchema), categoryController.updateCategory);
router.delete('/:storeId/:id', storeAccessMiddleware('storeId'), categoryController.deactivateCategory);

module.exports = router;