// Hash de senha
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

/**
 * Cria hash da senha
 * @param {string} password - Senha em texto plano
 * @returns {Promise<string>} Hash da senha
 */
const hashPassword = async (password) => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Verifica se senha confere com hash
 * @param {string} password - Senha em texto plano
 * @param {string} hash - Hash armazenado
 * @returns {Promise<boolean>} True se senha correta
 */
const verifyPassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

module.exports = {
    hashPassword,
    verifyPassword
};