// Configuração centralizada de rate limiting
const RATE_LIMIT_CONFIG = {
    // Configuração por ambiente
    development: {
        enabled: false, // Desabilitado em desenvolvimento
        bypassLocalhost: true
    },
    production: {
        enabled: true,
        bypassLocalhost: false
    },

    // Limites por categoria de endpoint
    limits: {
        // Autenticação - mais restritivo
        auth: {
            windowMs: 15 * 60 * 1000, // 15 minutos
            max: 20, // 20 tentativas por IP
            message: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.'
        },

        // APIs privadas administrativas - moderado
        admin: {
            windowMs: 15 * 60 * 1000, // 15 minutos
            max: 200, // 200 requests por IP
            message: 'Limite de requests administrativos atingido. Tente novamente em 15 minutos.'
        },

        // APIs públicas (lojas, produtos) - mais permissivo
        public: {
            windowMs: 15 * 60 * 1000, // 15 minutos
            max: 500, // 500 requests por IP
            message: 'Muitas consultas públicas. Tente novamente em 15 minutos.'
        },

        // Polling/monitoramento - muito permissivo
        polling: {
            windowMs: 5 * 60 * 1000, // 5 minutos
            max: 100, // 100 requests por IP a cada 5 min
            message: 'Limite de polling atingido. Aguarde alguns minutos.'
        },

        // Webhooks - sem limite (ou muito alto)
        webhook: {
            windowMs: 15 * 60 * 1000,
            max: 1000,
            message: 'Limite de webhooks atingido.'
        },

        // Upload de arquivos - mais restritivo
        upload: {
            windowMs: 15 * 60 * 1000,
            max: 30, // 30 uploads por 15 min
            message: 'Muitos uploads. Tente novamente em 15 minutos.'
        }
    },

    // IPs que nunca são limitados (servidores, CDNs, etc.)
    whitelist: [
        '127.0.0.1',
        '::1',
        'localhost'
    ]
};

/**
 * Obtém configuração de rate limit por categoria
 * @param {string} category - Categoria do endpoint
 * @returns {Object} Configuração de rate limit
 */
const getRateLimitConfig = (category = 'admin') => {
    const env = process.env.NODE_ENV || 'development';
    const envConfig = RATE_LIMIT_CONFIG[env];
    const limitConfig = RATE_LIMIT_CONFIG.limits[category] || RATE_LIMIT_CONFIG.limits.admin;

    return {
        ...envConfig,
        ...limitConfig
    };
};

/**
 * Verifica se IP deve ser ignorado pelo rate limiting
 * @param {string} ip - IP do cliente
 * @returns {boolean} True se deve pular rate limiting
 */
const shouldBypassRateLimit = (ip) => {
    const env = process.env.NODE_ENV || 'development';
    
    // Em desenvolvimento, bypassa localhost
    if (env === 'development' && isLocalhost(ip)) {
        return true;
    }

    // Verifica whitelist
    return RATE_LIMIT_CONFIG.whitelist.includes(ip);
};

/**
 * Verifica se IP é localhost
 * @param {string} ip - IP do cliente
 * @returns {boolean} True se é localhost
 */
const isLocalhost = (ip) => {
    const localhostIPs = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];
    return localhostIPs.includes(ip) || ip.includes('localhost');
};

module.exports = {
    RATE_LIMIT_CONFIG,
    getRateLimitConfig,
    shouldBypassRateLimit,
    isLocalhost
};