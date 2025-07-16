// Middleware para whitelist de IPs
const { shouldBypassRateLimit } = require('../config/rate-limit');

/**
 * Middleware para verificar se IP deve ser ignorado
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 */
const ipWhitelistMiddleware = (req, res, next) => {
    // Obtém IP real considerando proxies
    const clientIP = getClientIP(req);
    
    // Adiciona informação ao request
    req.clientIP = clientIP;
    req.shouldBypassRateLimit = shouldBypassRateLimit(clientIP);
    
    // Log para debug em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
        console.log(`🌐 Request de IP: ${clientIP} | Bypass: ${req.shouldBypassRateLimit}`);
    }
    
    next();
};

/**
 * Obtém IP real do cliente considerando proxies
 * @param {Object} req - Request object
 * @returns {string} IP do cliente
 */
const getClientIP = (req) => {
    // Verifica headers de proxy em ordem de prioridade
    const xForwardedFor = req.headers['x-forwarded-for'];
    const xRealIP = req.headers['x-real-ip'];
    const cfConnectingIP = req.headers['cf-connecting-ip'];
    
    if (xForwardedFor) {
        return xForwardedFor.split(',')[0].trim();
    }
    
    if (xRealIP) {
        return xRealIP.trim();
    }
    
    if (cfConnectingIP) {
        return cfConnectingIP.trim();
    }
    
    // Fallback para IP direto
    return req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
};

module.exports = {
    ipWhitelistMiddleware,
    getClientIP
};