// Rotas de lojas
const express = require('express');
const StoreController = require('../controllers/store-controller');
const validateRequest = require('../../../middleware/validation');
const authMiddleware = require('../../../middleware/auth');
const { createStoreSchema, updateStoreSchema } = require('../../../schemas/store-schemas');

const router = express.Router();
const storeController = new StoreController();

router.post('/', authMiddleware, validateRequest(createStoreSchema), storeController.createStore);
router.get('/', authMiddleware, storeController.getUserStores);
router.get('/:id', authMiddleware, storeController.getUserStore);
router.put('/:id', authMiddleware, validateRequest(updateStoreSchema), storeController.updateStore);
router.delete('/:id', authMiddleware, storeController.deactivateStore);

router.get('/public/:slug', storeController.getPublicStore);

module.exports = router;