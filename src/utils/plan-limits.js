// Limites de planos (ATUALIZADO com features de personalização)
const PLAN_LIMITS = {
    fomi_simples: {
        stores: 1,
        products_per_store: 10,
        categories_per_store: 10,
        promotions_active: 3,
        features: {
            custom_domain: false,
            advanced_reports: false,
            api_access: false,
            priority_support: false,
            custom_colors: false,
            logo_upload: true,        // ✅ Pode fazer upload de logo
            banner_upload: false,     // ❌ Banner é fixo/padrão
            custom_fonts: false,      // ❌ Sem personalização de fonte
            product_images: false,    // ❌ Sem imagens de produtos
            category_images: false    // ❌ Sem imagens de categorias
        }
    },
    fomi_duplo: {
        stores: 1,
        products_per_store: 50,
        categories_per_store: 15,
        promotions_active: 5,
        features: {
            custom_domain: false,
            advanced_reports: true,
            api_access: false,
            priority_support: false,
            custom_colors: true,      // ✅ Pode personalizar cores
            logo_upload: true,        // ✅ Pode fazer upload de logo
            banner_upload: true,      // ✅ Pode fazer upload de banner
            custom_fonts: true,       // ✅ Pode personalizar fontes
            product_images: true,     // ✅ Pode adicionar imagens de produtos
            category_images: true     // ✅ Pode adicionar imagens de categorias
        }
    },
    fomi_supremo: {
        stores: 5,
        products_per_store: -1, 
        categories_per_store: -1, 
        promotions_active: -1,
        features: {
            custom_domain: true,
            advanced_reports: true,
            api_access: true,
            priority_support: true,
            custom_colors: true,      // ✅ Personalização completa
            logo_upload: true,        // ✅ Upload de logo
            banner_upload: true,      // ✅ Upload de banner
            custom_fonts: true,       // ✅ Fontes personalizadas
            product_images: true,     // ✅ Imagens de produtos
            category_images: true     // ✅ Imagens de categorias
        }
    }
};

/**
 * Obtém limites para um plano específico
 * @param {string} planName - Nome do plano
 * @returns {Object} Limites do plano
 */
const getPlanLimits = (planName) => {
    return PLAN_LIMITS[planName] || PLAN_LIMITS.fomi_simples;
};

/**
 * Verifica se plano tem feature específica
 * @param {string} planName - Nome do plano
 * @param {string} featureName - Nome da feature
 * @returns {boolean} True se tem a feature
 */
const planHasFeature = (planName, featureName) => {
    const limits = getPlanLimits(planName);
    return limits.features[featureName] || false;
};

/**
 * Verifica se atingiu limite para um recurso
 * @param {string} planName - Nome do plano
 * @param {string} resource - Nome do recurso
 * @param {number} currentCount - Quantidade atual
 * @returns {boolean} True se atingiu o limite
 */
const hasReachedLimit = (planName, resource, currentCount) => {
    const limits = getPlanLimits(planName);
    const limit = limits[resource];
    
    // -1 significa ilimitado
    if (limit === -1) return false;
    
    return currentCount >= limit;
};

/**
 * Obtém uploads permitidos por plano
 * @param {string} planName - Nome do plano
 * @returns {Array} Lista de uploads permitidos
 */
const getAllowedUploads = (planName) => {
    const limits = getPlanLimits(planName);
    const allowed = [];

    if (limits.features.logo_upload) allowed.push('logo');
    if (limits.features.banner_upload) allowed.push('banner');
    if (limits.features.product_images) allowed.push('product_image');
    if (limits.features.category_images) allowed.push('category_image');

    return allowed;
};

module.exports = {
    PLAN_LIMITS,
    getPlanLimits,
    planHasFeature,
    hasReachedLimit,
    getAllowedUploads
};