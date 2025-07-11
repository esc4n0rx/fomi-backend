const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');


const errorHandler = require('./middleware/error-handler');


const authRoutes = require('./modules/auth/routes/auth-routes');
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

app.use(helmet());
app.use(cors());


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: 'Muitas tentativas. Tente novamente em 15 minutos.'
    }
});
app.use(limiter);


const publicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 200,
    message: {
        success: false,
        message: 'Muitas tentativas. Tente novamente em 15 minutos.'
    }
});


app.use('/webhooks', stripeWebhook);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/stores', storeRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/promotions', promotionRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/customers', customerRoutes);

app.use('/api/v1/public', publicLimiter, publicStoreRoutes);
app.use('/api/v1/public/orders', publicLimiter, publicOrderRoutes);


app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Fomi API está rodando',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
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