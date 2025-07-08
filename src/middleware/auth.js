// Middleware de autenticação
const { verifyToken } = require('../config/jwt');

/**
 * Middleware de autenticação JWT
 */
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token de acesso não fornecido'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer '
        
        const decoded = verifyToken(token);
        
        // Adiciona dados do usuário ao request
        req.user = decoded;
        
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

module.exports = authMiddleware;