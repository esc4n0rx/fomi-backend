// Rotas de autenticação
const express = require('express');
const AuthController = require('../controllers/auth-controller');
const validateRequest = require('../../../middleware/validation');
const authMiddleware = require('../../../middleware/auth');
const { registerSchema, loginSchema } = require('../../../schemas/auth-schemas');

const router = express.Router();
const authController = new AuthController();

// Rota de registro
router.post('/register', validateRequest(registerSchema), authController.register);

// Rota de login
router.post('/login', validateRequest(loginSchema), authController.login);

// Rota para obter dados do usuário autenticado
router.get('/me', authMiddleware, authController.me);

module.exports = router;