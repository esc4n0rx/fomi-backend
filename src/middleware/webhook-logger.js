// Middleware para log detalhado de webhooks
const webhookLogger = (req, res, next) => {
    console.log(`🌐 Webhook Request - ${new Date().toISOString()}`);
    console.log(`🌐 Method: ${req.method}`);
    console.log(`🌐 URL: ${req.url}`);
    console.log(`🌐 Headers:`, JSON.stringify(req.headers, null, 2));
    console.log(`🌐 Origin IP: ${req.ip || req.connection.remoteAddress}`);
    console.log(`🌐 User-Agent: ${req.headers['user-agent']}`);
    
    next();
};

module.exports = webhookLogger;