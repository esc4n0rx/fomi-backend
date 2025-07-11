// Configuração do Stripe
const Stripe = require('stripe');

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY não configurado');
}

if (!STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET não configurado');
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16'
});

// IDs dos preços do Stripe (CORRIGIDO: usar price_id, não product_id)
const STRIPE_PRICE_IDS = {
    fomi_simples: null, // Gratuito - sem price_id
    fomi_duplo: process.env.STRIPE_PRICE_FOMI_DUPLO,
    fomi_supremo: process.env.STRIPE_PRICE_FOMI_SUPREMO
};

// Valida se price IDs estão configurados
const validatePriceIds = () => {
    const missingPrices = [];
    
    if (!STRIPE_PRICE_IDS.fomi_duplo) {
        missingPrices.push('STRIPE_PRICE_FOMI_DUPLO');
    }
    
    if (!STRIPE_PRICE_IDS.fomi_supremo) {
        missingPrices.push('STRIPE_PRICE_FOMI_SUPREMO');
    }
    
    if (missingPrices.length > 0) {
        console.warn(`⚠️  Variáveis de ambiente não configuradas: ${missingPrices.join(', ')}`);
        console.warn('⚠️  Billing do Stripe não funcionará corretamente');
    }
};

// Valida na inicialização
validatePriceIds();

module.exports = {
    stripe,
    STRIPE_WEBHOOK_SECRET,
    STRIPE_PRICE_IDS
};