// Serviço de pedidos (área pública/cliente)
const OrderRepository = require('../repositories/order-repository');
const OrderItemRepository = require('../repositories/order-item-repository');
const CustomerService = require('../../customers/services/customer-service');
const CouponService = require('../../coupons/services/coupon-service');
const ProductRepository = require('../../products/repositories/product-repository');
const StoreRepository = require('../../stores/repositories/store-repository');

class PublicOrderService {
    constructor() {
        this.orderRepository = new OrderRepository();
        this.orderItemRepository = new OrderItemRepository();
        this.customerService = new CustomerService();
        this.couponService = new CouponService();
        this.productRepository = new ProductRepository();
        this.storeRepository = new StoreRepository();
    }

    /**
     * Cria novo pedido
     * @param {string} storeId - ID da loja
     * @param {Object} orderData - Dados do pedido
     * @returns {Promise<Object>} Pedido criado
     */
    async createOrder(storeId, orderData) {
        // Verifica se loja existe e está ativa
        const store = await this.storeRepository.findById(storeId);
        if (!store) {
            throw new Error('Loja não encontrada');
        }

        // Verifica se loja aceita pedidos
        const config = store.configuracoes || {};
        if (!config.aceita_pedidos) {
            throw new Error('Loja não está aceitando pedidos no momento');
        }

        // Busca ou cria cliente
        const customer = await this.customerService.findOrCreateByPhone(orderData.customer);

        // Valida e calcula itens do pedido
        const { items, subtotal } = await this.validateAndCalculateItems(storeId, orderData.items);

        // Verifica valor mínimo do pedido
        if (config.valor_minimo_pedido && subtotal < config.valor_minimo_pedido) {
            throw new Error(`Valor mínimo do pedido é R$ ${config.valor_minimo_pedido.toFixed(2)}`);
        }

        // Aplica cupom se fornecido
        let couponDiscount = 0;
        let couponCode = null;
        if (orderData.cupom_codigo) {
            try {
                const coupon = await this.couponService.validateCoupon(orderData.cupom_codigo, storeId, subtotal);
                couponDiscount = this.calculateCouponDiscount(coupon, subtotal);
                couponCode = coupon.codigo;
            } catch (error) {
                throw new Error(`Erro no cupom: ${error.message}`);
            }
        }

        // Calcula taxa de entrega
        const taxaEntrega = orderData.tipo_entrega === 'entrega' ? (config.taxa_entrega || 0) : 0;

        // Calcula total
        const total = subtotal - couponDiscount + taxaEntrega;

        // Valida troco se método for dinheiro
        if (orderData.metodo_pagamento === 'dinheiro' && orderData.troco_para) {
            if (orderData.troco_para < total) {
                throw new Error('Valor para troco deve ser maior que o total do pedido');
            }
        }

        // Prepara dados do pedido
        const orderPayload = {
            store_id: storeId,
            customer_id: customer.id,
            
            // Snapshot dos dados do cliente
            cliente_nome: customer.nome,
            cliente_telefone: customer.telefone,
            cliente_email: customer.email,
            
            // Endereço de entrega
            endereco_cep: customer.endereco_cep,
            endereco_rua: customer.endereco_rua,
            endereco_numero: customer.endereco_numero,
            endereco_complemento: customer.endereco_complemento,
            endereco_bairro: customer.endereco_bairro,
            endereco_cidade: customer.endereco_cidade,
            endereco_estado: customer.endereco_estado,
            endereco_referencia: customer.endereco_referencia,
            
            // Valores
            subtotal: subtotal,
            desconto: couponDiscount,
            taxa_entrega: taxaEntrega,
            total: total,
            
            // Cupom
            cupom_codigo: couponCode,
            cupom_desconto: couponDiscount,
            
            // Pagamento e entrega
            metodo_pagamento: orderData.metodo_pagamento,
            troco_para: orderData.troco_para || null,
            tipo_entrega: orderData.tipo_entrega,
            
            // Observações e tempo
            observacoes: orderData.observacoes,
            tempo_estimado_min: config.tempo_preparo_min || 30,
            
            // Status inicial
            status: 'pendente'
        };

        // Cria pedido
        const order = await this.orderRepository.create(orderPayload);

        // Cria itens do pedido
        const orderItems = items.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            produto_nome: item.produto_nome,
            produto_descricao: item.produto_descricao,
            produto_preco: item.produto_preco,
            produto_preco_promocional: item.produto_preco_promocional,
            quantidade: item.quantidade,
            preco_unitario: item.preco_unitario,
            subtotal: item.subtotal,
            observacoes: item.observacoes
        }));

        await this.orderItemRepository.createMany(orderItems);

        // Usa cupom se aplicado
        if (couponCode) {
            try {
                await this.couponService.useCoupon(orderData.cupom_codigo);
            } catch (error) {
                console.error('Erro ao usar cupom:', error);
                // Não falha o pedido por erro no cupom
            }
        }

        // Busca pedido completo para retornar
        const fullOrder = await this.orderRepository.findById(order.id);

        // TODO: Notificar loja sobre novo pedido
        // await this.notifyStore(fullOrder);

        return fullOrder;
    }

    /**
     * Busca pedido por número
     * @param {string} numeroPedido - Número do pedido
     * @returns {Promise<Object>} Pedido
     */
    async getOrderByNumber(numeroPedido) {
        const order = await this.orderRepository.findByNumber(numeroPedido);
        
        if (!order) {
            throw new Error('Pedido não encontrado');
        }

        return order;
    }

    /**
     * Valida e calcula itens do pedido
     * @private
     * @param {string} storeId - ID da loja
     * @param {Array} items - Itens do carrinho
     * @returns {Promise<Object>} Itens validados e subtotal
     */
    async validateAndCalculateItems(storeId, items) {
        if (!items || items.length === 0) {
            throw new Error('Pedido deve ter pelo menos 1 item');
        }

        const validatedItems = [];
        let subtotal = 0;

        for (const item of items) {
            // Busca produto
            const product = await this.productRepository.findById(item.product_id);
            
            if (!product) {
                throw new Error(`Produto não encontrado: ${item.product_id}`);
            }

            if (product.store_id !== storeId) {
                throw new Error(`Produto não pertence à loja: ${item.product_id}`);
            }

            if (!product.disponivel) {
                throw new Error(`Produto indisponível: ${product.nome}`);
            }

            // Determina preço (promocional ou normal)
            const precoUnitario = product.preco_promocional || product.preco;
            const itemSubtotal = precoUnitario * item.quantidade;

            validatedItems.push({
                product_id: product.id,
                produto_nome: product.nome,
                produto_descricao: product.descricao,
                produto_preco: product.preco,
                produto_preco_promocional: product.preco_promocional,
                quantidade: item.quantidade,
                preco_unitario: precoUnitario,
                subtotal: itemSubtotal,
                observacoes: item.observacoes
            });

            subtotal += itemSubtotal;
        }

        return { items: validatedItems, subtotal };
    }

    /**
     * Calcula desconto do cupom
     * @private
     * @param {Object} coupon - Dados do cupom
     * @param {number} subtotal - Subtotal do pedido
     * @returns {number} Valor do desconto
     */
    calculateCouponDiscount(coupon, subtotal) {
        let discount = 0;

        switch (coupon.tipo) {
            case 'desconto_percentual':
                discount = subtotal * (coupon.valor / 100);
                break;
            case 'desconto_fixo':
                discount = coupon.valor;
                break;
            case 'frete_gratis':
                // Será aplicado na taxa de entrega
                discount = 0;
                break;
        }

        // Garante que desconto não seja maior que subtotal
        return Math.min(discount, subtotal);
    }

    // TODO: Implementar notificações
    /**
     * Notifica loja sobre novo pedido
     * @private
     * @param {Object} order - Dados do pedido
     */
    async notifyStore(order) {
        // TODO: Implementar notificação para loja (WhatsApp, email, etc.)
        console.log(`TODO: Notificar loja ${order.store.nome} sobre novo pedido ${order.numero_pedido}`);
    }
}

module.exports = PublicOrderService;