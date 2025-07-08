// Controller de pedidos (área pública)
const PublicOrderService = require('../services/public-order-service');

class PublicOrderController {
    constructor() {
        this.publicOrderService = new PublicOrderService();
    }

    /**
     * Cria novo pedido
     */
    createOrder = async (req, res, next) => {
        try {
            const storeId = req.params.storeId;
            const order = await this.publicOrderService.createOrder(storeId, req.body);
            
            res.status(201).json({
                success: true,
                message: 'Pedido criado com sucesso',
                data: { 
                    order,
                    numero_pedido: order.numero_pedido,
                    total: order.total,
                    tempo_estimado: order.tempo_estimado_min
                }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Busca pedido por número
     */
    getOrderByNumber = async (req, res, next) => {
        try {
            const { numeroPedido } = req.params;
            const order = await this.publicOrderService.getOrderByNumber(numeroPedido);
            
            res.json({
                success: true,
                data: { order }
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = PublicOrderController;