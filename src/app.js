const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const errorHandler = require('./middleware/error-handler');
const { ipWhitelistMiddleware } = require('./middleware/ip-whitelist');
const { rateLimiters } = require('./middleware/rate-limiter');


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

app.set('trust proxy', 1);

app.use(helmet());

app.use(ipWhitelistMiddleware);

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

app.use('/webhooks', webhookLogger, stripeWebhook);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.use('/api/v1/auth', rateLimiters.auth, authRoutes);

app.use('/api/v1/stores', rateLimiters.admin, storeRoutes);
app.use('/api/v1/categories', rateLimiters.admin, categoryRoutes);
app.use('/api/v1/products', rateLimiters.admin, productRoutes);
app.use('/api/v1/promotions', rateLimiters.admin, promotionRoutes);
app.use('/api/v1/coupons', rateLimiters.admin, couponRoutes);
app.use('/api/v1/billing', rateLimiters.admin, billingRoutes);


app.use('/api/v1/orders', rateLimiters.polling, orderRoutes);
app.use('/api/v1/customers', rateLimiters.polling, customerRoutes);

app.use('/api/v1/public', rateLimiters.public, publicStoreRoutes);
app.use('/api/v1/public/orders', rateLimiters.public, publicOrderRoutes);

app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Fomi API está rodando',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        rate_limiting: process.env.NODE_ENV !== 'development'
    });
});

app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint não encontrado'
    });
});

app.use(errorHandler);

module.exports = app;