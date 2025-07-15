// Rotas de lojas (ADICIONADA rota para configurações de personalização)
const express = require('express');
const StoreController = require('../controllers/store-controller');
const validateRequest = require('../../../middleware/validation');
const authMiddleware = require('../../../middleware/auth');
const { checkUploadPermission } = require('../../../middleware/feature-validator');
const { uploadImage } = require('../../../middleware/upload');
const { createStoreSchema, updateStoreSchema, updateStoreCustomizationSchema } = require('../../../schemas/store-schemas');

const router = express.Router();
const storeController = new StoreController();

// Rotas básicas de loja
router.post('/', authMiddleware, validateRequest(createStoreSchema), storeController.createStore);
router.get('/', authMiddleware, storeController.getUserStores);
router.get('/:id', authMiddleware, storeController.getUserStore);
router.put('/:id', authMiddleware, validateRequest(updateStoreSchema), storeController.updateStore);
router.delete('/:id', authMiddleware, storeController.deactivateStore);

// 🆕 NOVA ROTA: Configurações de personalização
router.get('/:id/customization-settings', authMiddleware, storeController.getCustomizationSettings);

// Rotas de upload de imagens
router.post('/:id/logo', 
    authMiddleware, 
    checkUploadPermission('logo'),
    uploadImage('logo', 'logo'), 
    storeController.uploadLogo
);

router.post('/:id/banner', 
    authMiddleware, 
    checkUploadPermission('banner'),
    uploadImage('banner', 'banner'), 
    storeController.uploadBanner
);

// Rotas para remover imagens
router.delete('/:id/logo', authMiddleware, storeController.removeLogo);
router.delete('/:id/banner', authMiddleware, storeController.removeBanner);

// Rota para personalização visual (SEGUNDA ETAPA)
router.patch('/:id/customization', 
    authMiddleware, 
    validateRequest(updateStoreCustomizationSchema), 
    storeController.updateCustomization
);

// Rota pública
router.get('/public/:slug', storeController.getPublicStore);

module.exports = router;