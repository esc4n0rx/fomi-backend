// Controller de autenticação
const AuthService = require('../services/auth-service');

class AuthController {
    constructor() {
        this.authService = new AuthService();
    }

    /**
     * Registra novo usuário
     */
    register = async (req, res, next) => {
        try {
            const result = await this.authService.register(req.body);
            
            res.status(201).json({
                success: true,
                message: 'Usuário registrado com sucesso',
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Autentica usuário
     */
    login = async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const result = await this.authService.login(email, password);
            
            res.json({
                success: true,
                message: 'Login realizado com sucesso',
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Retorna dados do usuário autenticado
     */
    me = async (req, res, next) => {
        try {
            const user = await this.authService.getUserById(req.user.id);
            
            res.json({
                success: true,
                data: { user }
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = AuthController;