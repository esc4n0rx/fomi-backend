// Serviço de pedidos (área administrativa)
const OrderRepository = require('../repositories/order-repository');
const OrderItemRepository = require('../repositories/order-item-repository');
const { ORDER_STATUS, isValidTransition, getTimestampField } = require('../../../utils/order-status');

class OrderService {
    constructor() {
        this.orderRepository = new OrderRepository();
        this.orderItemRepository = new OrderItemRepository();
    }

    /**
     * Lista pedidos da loja
     * @param {string} storeId - ID da loja
     * @param {Object} filters - Filtros de busca
     * @param {number} page - Página
     * @param {number} limit - Limite por página
     * @returns {Promise<Object>} Pedidos paginados
     */
    async getStoreOrders(storeId, filters = {}, page = 1, limit = 20) {
        return await this.orderRepository.findByStoreId(storeId, filters, page, limit);
    }

    /**
     * Busca pedido específico da loja
     * @param {string} orderId - ID do pedido
     * @param {string} storeId - ID da loja
     * @returns {Promise<Object>} Pedido completo
     */
    async getStoreOrder(orderId, storeId) {
        const order = await this.orderRepository.findById(orderId);
        
        if (!order) {
            throw new Error('Pedido não encontrado');
        }

        if (order.store_id !== storeId) {
            throw new Error('Acesso negado');
        }

        return order;
    }

    /**
     * Atualiza status do pedido
     * @param {string} orderId - ID do pedido
     * @param {string} storeId - ID da loja
     * @param {string} newStatus - Novo status
     * @param {string} motivoCancelamento - Motivo do cancelamento (se aplicável)
     * @returns {Promise<Object>} Pedido atualizado
     */
    async updateOrderStatus(orderId, storeId, newStatus, motivoCancelamento = null) {
        // Verifica se pedido existe e pertence à loja
        const order = await this.getStoreOrder(orderId, storeId);

        // Verifica se transição é válida
        if (!isValidTransition(order.status, newStatus)) {
            throw new Error(`Transição de status inválida: ${order.status} -> ${newStatus}`);
        }

        // Prepara dados para atualização
        const updateData = {
            status: newStatus
        };

        // Adiciona timestamp específico do status
        const timestampField = getTimestampField(newStatus);
        if (timestampField) {
            updateData[timestampField] = new Date().toISOString();
        }

        // Adiciona motivo de cancelamento se necessário
        if (newStatus === ORDER_STATUS.CANCELADO && motivoCancelamento) {
            updateData.motivo_cancelamento = motivoCancelamento;
        }

        // Atualiza pedido
        const updatedOrder = await this.orderRepository.update(orderId, updateData);

        // TODO: Implementar notificação por WhatsApp
        // await this.notifyCustomer(updatedOrder);

        return updatedOrder;
    }

    /**
     * Busca estatísticas da loja
     * @param {string} storeId - ID da loja
     * @param {Object} dateRange - Range de datas
     * @returns {Promise<Object>} Estatísticas
     */
    async getStoreStatistics(storeId, dateRange = {}) {
        return await this.orderRepository.getStatistics(storeId, dateRange);
    }

    /**
     * Adiciona observação ao pedido
     * @param {string} orderId - ID do pedido
     * @param {string} storeId - ID da loja
     * @param {string} observacao - Nova observação
     * @returns {Promise<Object>} Pedido atualizado
     */
    async addOrderNote(orderId, storeId, observacao) {
        const order = await this.getStoreOrder(orderId, storeId);
        
        const currentNotes = order.observacoes || '';
        const timestamp = new Date().toLocaleString('pt-BR');
        const newNote = `[${timestamp}] ${observacao}`;
        const updatedNotes = currentNotes ? `${currentNotes}\n${newNote}` : newNote;

        return await this.orderRepository.update(orderId, {
            observacoes: updatedNotes
        });
    }

    // TODO: Implementar notificações
    /**
     * Notifica cliente sobre mudança de status
     * @private
     * @param {Object} order - Dados do pedido
     */
    async notifyCustomer(order) {
        // TODO: Implementar integração com WhatsApp
        console.log(`TODO: Notificar cliente ${order.cliente_telefone} sobre pedido ${order.numero_pedido} - Status: ${order.status}`);
    }
}

module.exports = OrderService;