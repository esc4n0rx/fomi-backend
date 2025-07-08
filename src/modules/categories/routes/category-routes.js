// Rotas de categorias
const express = require('express');
const CategoryController = require('../controllers/category-controller');
const validateRequest = require('../../../middleware/validation');
const authMiddleware = require('../../../middleware/auth');
const storeAccessMiddleware = require('../../../middleware/store-access');
const { createCategorySchema, updateCategorySchema } = require('../../../schemas/category-schemas');

const router = express.Router();
const categoryController = new CategoryController();

// Todas as rotas precisam de autenticação e acesso à loja
router.use(authMiddleware);
router.use('/:storeId/*', storeAccessMiddleware('storeId'));

// Rotas de categorias
router.get('/:storeId', categoryController.getStoreCategories);
router.post('/:storeId', validateRequest(createCategorySchema), categoryController.createCategory);
router.get('/:storeId/:id', categoryController.getCategoryById);
router.put('/:storeId/:id', validateRequest(updateCategorySchema), categoryController.updateCategory);
router.delete('/:storeId/:id', categoryController.deactivateCategory);

module.exports = router;