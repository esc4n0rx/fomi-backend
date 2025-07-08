// Controller de billing
const BillingService = require('../services/billing-service');

class BillingController {
    constructor() {
        this.billingService = new BillingService();
    }

    /**
     * Cria nova assinatura
     */
    createSubscription = async (req, res, next) => {
        try {
            const { plan, success_url, cancel_url } = req.body;
            
            if (!plan || !success_url || !cancel_url) {
                return res.status(400).json({
                    success: false,
                    message: 'Plan, success_url e cancel_url são obrigatórios'
                });
            }

            const result = await this.billingService.createSubscription(
                req.user.id,
                plan,
                success_url,
                cancel_url
            );
            
            res.json({
                success: true,
                message: 'Checkout criado com sucesso',
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Busca assinatura atual
     */
    getSubscription = async (req, res, next) => {
        try {
            const subscription = await this.billingService.getUserSubscription(req.user.id);
            
            res.json({
                success: true,
                data: { subscription }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Cria portal de billing
     */
    createBillingPortal = async (req, res, next) => {
        try {
            const { return_url } = req.body;
            
            if (!return_url) {
                return res.status(400).json({
                    success: false,
                    message: 'return_url é obrigatório'
                });
            }

            const result = await this.billingService.createBillingPortal(
                req.user.id,
                return_url
            );
            
            res.json({
                success: true,
                message: 'Portal criado com sucesso',
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Lista faturas do usuário
     */
    getInvoices = async (req, res, next) => {
        try {
            const invoices = await this.billingService.getUserInvoices(req.user.id);
            
            res.json({
                success: true,
                data: { invoices }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Cancela assinatura
     */
    cancelSubscription = async (req, res, next) => {
        try {
            await this.billingService.cancelSubscription(req.user.id);
            
            res.json({
                success: true,
                message: 'Assinatura cancelada com sucesso'
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = BillingController;