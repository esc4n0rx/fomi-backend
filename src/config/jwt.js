// Configuração do JWT
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET não configurado');
}

/**
 * Gera token JWT para o usuário
 * @param {Object} payload - Dados do usuário
 * @returns {string} Token JWT
 */
const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verifica e decodifica token JWT
 * @param {string} token - Token JWT
 * @returns {Object} Payload decodificado
 */
const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

module.exports = {
    generateToken,
    verifyToken
};