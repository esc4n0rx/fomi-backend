// Arquivo principal da aplicação (ATUALIZADO)
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Middleware
const errorHandler = require('./middleware/error-handler');

// Routes
const authRoutes = require('./modules/auth/routes/auth-routes');
const storeRoutes = require('./modules/stores/routes/store-routes');
const categoryRoutes = require('./modules/categories/routes/category-routes');
const productRoutes = require('./modules/products/routes/product-routes');
const promotionRoutes = require('./modules/promotions/routes/promotion-routes');
const couponRoutes = require('./modules/coupons/routes/coupon-routes');
const billingRoutes = require('./modules/billing/routes/billing-routes');

// Webhooks
const stripeWebhook = require('./webhooks/stripe-webhook');

const app = express();

// Segurança
app.use(helmet());
app.use(cors());

// Rate limiting - 100 requests por 15 minutos
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por IP
    message: {
        success: false,
        message: 'Muitas tentativas. Tente novamente em 15 minutos.'
    }
});
app.use(limiter);

// Webhook do Stripe (antes do body parser JSON)
app.use('/webhooks', stripeWebhook);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/stores', storeRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/promotions', promotionRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/billing', billingRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Fomi API está rodando',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint não encontrado'
    });
});

// Error handler
app.use(errorHandler);

module.exports = app;