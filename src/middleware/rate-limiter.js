// Middleware inteligente de rate limiting
const rateLimit = require('express-rate-limit');
const { getRateLimitConfig } = require('../config/rate-limit');

/**
 * Cria middleware de rate limiting por categoria
 * @param {string} category - Categoria do endpoint
 * @returns {Function} Middleware de rate limiting
 */
const createRateLimiter = (category = 'admin') => {
    const config = getRateLimitConfig(category);
    
    // Se rate limiting está desabilitado, retorna middleware vazio
    if (!config.enabled) {
        return (req, res, next) => {
            console.log(`⏭️  Rate limiting desabilitado para ${category}`);
            next();
        };
    }

    return rateLimit({
        windowMs: config.windowMs,
        max: config.max,
        message: {
            success: false,
            message: config.message,
            retry_after: config.windowMs / 1000
        },
        standardHeaders: true,
        legacyHeaders: false,
        
        // Função customizada para pular rate limiting
        skip: (req) => {
            // Se IP deve ser ignorado, pula rate limiting
            if (req.shouldBypassRateLimit) {
                console.log(`⏭️  Bypass rate limiting para IP: ${req.clientIP}`);
                return true;
            }
            return false;
        },
        
        // Key generator personalizado
        keyGenerator: (req) => {
            // Usa IP real do cliente
            return req.clientIP || req.ip;
        },
        
        // Handler personalizado para quando limite é atingido
        handler: (req, res) => {
            console.log(`🚫 Rate limit atingido para IP: ${req.clientIP} | Categoria: ${category}`);
            
            res.status(429).json({
                success: false,
                message: config.message,
                retry_after: config.windowMs / 1000,
                limit: config.max,
                window: `${config.windowMs / 1000 / 60} minutos`
            });
        },
        
        // Callback para requests bem-sucedidos
        onLimitReached: (req, res, options) => {
            console.log(`⚠️  Rate limit quase atingido para IP: ${req.clientIP} | Categoria: ${category}`);
        }
    });
};

/**
 * Rate limiters pré-configurados por categoria
 */
const rateLimiters = {
    auth: createRateLimiter('auth'),
    admin: createRateLimiter('admin'),
    public: createRateLimiter('public'),
    polling: createRateLimiter('polling'),
    webhook: createRateLimiter('webhook'),
    upload: createRateLimiter('upload')
};

module.exports = {
    createRateLimiter,
    rateLimiters
};