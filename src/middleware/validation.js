// Middleware de validação
/**
 * Middleware para validação de dados usando Zod
 * @param {Object} schema - Schema Zod para validação
 * @returns {Function} Middleware function
 */
const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            // Valida os dados do body
            const validatedData = schema.parse(req.body);
            
            // Substitui req.body pelos dados validados
            req.body = validatedData;
            
            next();
        } catch (error) {
            if (error.name === 'ZodError') {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
            }
            
            next(error);
        }
    };
};

module.exports = validateRequest;