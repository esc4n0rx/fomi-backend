// Controller de pedidos (área administrativa)
const OrderService = require('../services/order-service');

class OrderController {
    constructor() {
        this.orderService = new OrderService();
    }

    /**
     * Lista pedidos da loja
     */
    getStoreOrders = async (req, res, next) => {
        try {
            const filters = {
                status: req.query.status,
                data_inicio: req.query.data_inicio,
                data_fim: req.query.data_fim
            };

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;

            const result = await this.orderService.getStoreOrders(
                req.store.id,
                filters,
                page,
                limit
            );
            
            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Busca pedido específico
     */
    getStoreOrder = async (req, res, next) => {
        try {
            const order = await this.orderService.getStoreOrder(
                req.params.id,
                req.store.id
            );
            
            res.json({
                success: true,
                data: { order }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Atualiza status do pedido
     */
    updateOrderStatus = async (req, res, next) => {
        try {
            const { status, motivo_cancelamento } = req.body;
            
            const order = await this.orderService.updateOrderStatus(
                req.params.id,
                req.store.id,
                status,
                motivo_cancelamento
            );
            
            res.json({
                success: true,
                message: 'Status do pedido atualizado com sucesso',
                data: { order }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Adiciona observação ao pedido
     */
    addOrderNote = async (req, res, next) => {
        try {
            const { observacao } = req.body;
            
            if (!observacao || observacao.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Observação é obrigatória'
                });
            }

            const order = await this.orderService.addOrderNote(
                req.params.id,
                req.store.id,
                observacao.trim()
            );
            
            res.json({
                success: true,
                message: 'Observação adicionada com sucesso',
                data: { order }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Busca estatísticas da loja
     */
    getStoreStatistics = async (req, res, next) => {
        try {
            const dateRange = {};
            
            if (req.query.data_inicio) {
                dateRange.start = req.query.data_inicio;
            }
            
            if (req.query.data_fim) {
                dateRange.end = req.query.data_fim;
            }

            const statistics = await this.orderService.getStoreStatistics(
                req.store.id,
                dateRange
            );
            
            res.json({
                success: true,
                data: { statistics }
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = OrderController;