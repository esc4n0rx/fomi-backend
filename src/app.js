const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const errorHandler = require('./middleware/error-handler');

const authRoutes = require('./modules/auth/routes/auth-routes');
const webhookLogger = require('./middleware/webhook-logger');
const storeRoutes = require('./modules/stores/routes/store-routes');
const categoryRoutes = require('./modules/categories/routes/category-routes');
const productRoutes = require('./modules/products/routes/product-routes');
const promotionRoutes = require('./modules/promotions/routes/promotion-routes');
const couponRoutes = require('./modules/coupons/routes/coupon-routes');
const billingRoutes = require('./modules/billing/routes/billing-routes');
const orderRoutes = require('./modules/orders/routes/order-routes');
const customerRoutes = require('./modules/customers/routes/customer-routes');

const publicStoreRoutes = require('./modules/public/routes/public-store-routes');
const publicOrderRoutes = require('./modules/orders/routes/public-order-routes');
const stripeWebhook = require('./webhooks/stripe-webhook');

const app = express();

// Configurar trust proxy para resolver o erro do rate limiting
app.set('trust proxy', 1);

app.use(helmet());

// Configurar CORS para aceitar apenas os domínios específicos
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'https://localhost:3000',
        'https://fomi-eats.shop',
        'https://www.fomi-eats.shop'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Rate limiting para rotas privadas
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // limite por IP
    message: {
        success: false,
        message: 'Muitas tentativas. Tente novamente em 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
});

// Rate limiting para rotas públicas (mais permissivo)
const publicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 200, // limite mais alto para rotas públicas
    message: {
        success: false,
        message: 'Muitas tentativas. Tente novamente em 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
});

// Aplicar rate limiting
app.use('/api/v1/auth', limiter);
app.use('/api/v1/stores', limiter);
app.use('/api/v1/categories', limiter);
app.use('/api/v1/products', limiter);
app.use('/api/v1/promotions', limiter);
app.use('/api/v1/coupons', limiter);
app.use('/api/v1/billing', limiter);
app.use('/api/v1/orders', limiter);
app.use('/api/v1/customers', limiter);
app.use('/webhooks', webhookLogger, stripeWebhook);

// Webhook do Stripe (sem rate limiting)
app.use('/webhooks', stripeWebhook);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rotas privadas
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/stores', storeRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/promotions', promotionRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/customers', customerRoutes);

// Rotas públicas com rate limiting específico
app.use('/api/v1/public', publicLimiter, publicStoreRoutes);
app.use('/api/v1/public/orders', publicLimiter, publicOrderRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Fomi API está rodando',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint não encontrado'
    });
});

app.use(errorHandler);

module.exports = app;