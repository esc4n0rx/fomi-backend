// Middleware de tratamento de erros
/**
 * Middleware global para tratamento de erros
 */
const errorHandler = (error, req, res, next) => {
    console.error('Erro capturado:', error);

    // Erro de validação personalizado
    if (error.message.includes('já está em uso') || 
        error.message === 'Credenciais inválidas' || 
        error.message === 'Usuário não encontrado') {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }

    // Erro do banco de dados
    if (error.message.includes('Erro ao')) {
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }

    // Erro genérico
    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
    });
};

module.exports = errorHandler;