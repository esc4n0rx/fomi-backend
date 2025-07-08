// Serviço de autenticação
const UserRepository = require('../repositories/user-repository');
const { hashPassword, verifyPassword } = require('../../../utils/password-hash');
const { generateToken } = require('../../../config/jwt');

class AuthService {
    constructor() {
        this.userRepository = new UserRepository();
    }

    /**
     * Registra novo usuário
     * @param {Object} userData - Dados do usuário
     * @returns {Promise<Object>} Usuário criado e token
     */
    async register(userData) {
        // Verifica se email já existe
        const existingUserByEmail = await this.userRepository.findByEmail(userData.email);
        if (existingUserByEmail) {
            throw new Error('Email já está em uso');
        }

        // Verifica se CPF já existe
        const existingUserByCPF = await this.userRepository.findByCPF(userData.cpf);
        if (existingUserByCPF) {
            throw new Error('CPF já está em uso');
        }

        // Cria hash da senha
        const passwordHash = await hashPassword(userData.password);

        // Cria usuário
        const user = await this.userRepository.create({
            ...userData,
            password_hash: passwordHash
        });

        // Gera token JWT
        const token = generateToken({
            id: user.id,
            email: user.email,
            nome: user.nome
        });

        return {
            user,
            token
        };
    }

    /**
     * Autentica usuário
     * @param {string} email - Email do usuário
     * @param {string} password - Senha do usuário
     * @returns {Promise<Object>} Usuário e token
     */
    async login(email, password) {
        // Busca usuário por email
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Credenciais inválidas');
        }

        // Verifica senha
        const isPasswordValid = await verifyPassword(password, user.password_hash);
        if (!isPasswordValid) {
            throw new Error('Credenciais inválidas');
        }

        // Gera token JWT
        const token = generateToken({
            id: user.id,
            email: user.email,
            nome: user.nome
        });

        // Remove senha do retorno
        const { password_hash, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            token
        };
    }

    /**
     * Busca usuário por ID
     * @param {string} id - ID do usuário
     * @returns {Promise<Object>} Usuário sem senha
     */
    async getUserById(id) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}

module.exports = AuthService;