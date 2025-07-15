// Middleware para validação de features por plano (ATUALIZADO)
const { getPlanLimits, hasReachedLimit, planHasFeature } = require('../utils/plan-limits');

/**
 * Middleware para verificar limite de recursos por plano
 * @param {string} resource - Nome do recurso (stores, products_per_store, etc.)
 * @param {Function} countFunction - Função para contar recursos atuais
 * @returns {Function} Middleware function
 */
const checkPlanLimit = (resource, countFunction) => {
    return async (req, res, next) => {
        try {
            const userPlan = req.user.plano || 'fomi_simples';
            
            // Para plano supremo com recursos ilimitados, pula a verificação
            const limits = getPlanLimits(userPlan);
            if (limits[resource] === -1) {
                return next();
            }

            const currentCount = await countFunction(req);
            
            if (hasReachedLimit(userPlan, resource, currentCount)) {
                const limitValue = limits[resource];
                return res.status(403).json({
                    success: false,
                    message: `Limite de ${resource} atingido para o plano ${userPlan}`,
                    limit: limitValue,
                    current: currentCount,
                    upgrade_required: true
                });
            }

            next();
        } catch (error) {
            console.error('Erro no middleware de validação de plano:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    };
};

/**
 * Middleware para verificar feature por plano
 * @param {string} featureName - Nome da feature
 * @returns {Function} Middleware function
 */
const checkPlanFeature = (featureName) => {
    return (req, res, next) => {
        try {
            const userPlan = req.user.plano || 'fomi_simples';
            
            if (!planHasFeature(userPlan, featureName)) {
                return res.status(403).json({
                    success: false,
                    message: `Feature ${featureName} não disponível no plano ${userPlan}`,
                    upgrade_required: true
                });
            }

            next();
        } catch (error) {
            console.error('Erro no middleware de feature por plano:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    };
};

/**
 * Middleware para verificar permissão de upload por plano
 * @param {string} uploadType - Tipo de upload (logo, banner, product_image, category_image)
 * @returns {Function} Middleware function
 */
const checkUploadPermission = (uploadType) => {
    return (req, res, next) => {
        try {
            const userPlan = req.user.plano || 'fomi_simples';
            
            // Plano gratuito só pode fazer upload de logo
            if (userPlan === 'fomi_simples' && uploadType !== 'logo') {
                return res.status(403).json({
                    success: false,
                    message: `Upload de ${uploadType} não disponível no plano gratuito`,
                    upgrade_required: true,
                    allowed_uploads: ['logo']
                });
            }

            // Outros planos podem fazer qualquer upload
            next();
        } catch (error) {
            console.error('Erro no middleware de permissão de upload:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    };
};

module.exports = {
    checkPlanLimit,
    checkPlanFeature,
    checkUploadPermission
};