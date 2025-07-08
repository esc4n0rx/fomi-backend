// Middleware para verificar acesso à loja
const { supabase } = require('../config/database');

/**
 * Middleware para verificar se usuário tem acesso à loja
 * @param {string} storeIdParam - Nome do parâmetro que contém o store_id
 * @returns {Function} Middleware function
 */
const storeAccessMiddleware = (storeIdParam = 'storeId') => {
    return async (req, res, next) => {
        try {
            const storeId = req.params[storeIdParam];
            const userId = req.user.id;

            if (!storeId) {
                return res.status(400).json({
                    success: false,
                    message: 'ID da loja é obrigatório'
                });
            }

            // Busca a loja e verifica propriedade
            const { data: store, error } = await supabase
                .from('fomi_stores')
                .select('id, user_id, ativo, plano')
                .eq('id', storeId)
                .eq('user_id', userId)
                .eq('ativo', true)
                .single();

            if (error || !store) {
                return res.status(404).json({
                    success: false,
                    message: 'Loja não encontrada ou acesso negado'
                });
            }

            // Adiciona dados da loja ao request
            req.store = store;
            
            next();
        } catch (error) {
            console.error('Erro no middleware de acesso à loja:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    };
};

module.exports = storeAccessMiddleware;