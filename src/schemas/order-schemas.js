// Schemas para pedidos
const { z } = require('zod');
const { ORDER_STATUS } = require('../utils/order-status');

// Schema para item do carrinho
const cartItemSchema = z.object({
    product_id: z.string().uuid('ID do produto deve ser UUID válido'),
    quantidade: z.number().int().min(1, 'Quantidade deve ser no mínimo 1'),
    observacoes: z.string().max(500, 'Observações do item deve ter no máximo 500 caracteres').optional()
});

// Schema para criar pedido
const createOrderSchema = z.object({
    // Dados do cliente
    customer: z.object({
        nome: z.string().min(2, 'Nome é obrigatório').max(255),
        telefone: z.string().regex(/^\(?[1-9]{2}\)?\s?9?[0-9]{4}-?[0-9]{4}$/, 'Telefone inválido'),
        email: z.string().email().optional(),
        endereco_cep: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido').optional(),
        endereco_rua: z.string().max(500).optional(),
        endereco_numero: z.string().max(20).optional(),
        endereco_complemento: z.string().max(255).optional(),
        endereco_bairro: z.string().max(255).optional(),
        endereco_cidade: z.string().max(255).optional(),
        endereco_estado: z.string().length(2).optional(),
        endereco_referencia: z.string().max(1000).optional()
    }),
    
    // Itens do pedido
    items: z.array(cartItemSchema).min(1, 'Pedido deve ter pelo menos 1 item'),
    
    // Método de pagamento
    metodo_pagamento: z.enum(['dinheiro', 'cartao', 'pix'], {
        errorMap: () => ({ message: 'Método de pagamento deve ser: dinheiro, cartao ou pix' })
    }),
    
    troco_para: z.number().positive().optional(),
    
    // Tipo de entrega
    tipo_entrega: z.enum(['entrega', 'retirada'], {
        errorMap: () => ({ message: 'Tipo de entrega deve ser: entrega ou retirada' })
    }),
    
    // Cupom (opcional)
    cupom_codigo: z.string().max(50).optional(),
    
    // Observações
    observacoes: z.string().max(1000).optional()
});

// Schema para atualizar status do pedido
const updateOrderStatusSchema = z.object({
    status: z.enum(Object.values(ORDER_STATUS), {
        errorMap: () => ({ message: 'Status inválido' })
    }),
    motivo_cancelamento: z.string().max(500).optional()
});

// Schema para buscar pedidos
const getOrdersSchema = z.object({
    status: z.enum(Object.values(ORDER_STATUS)).optional(),
    data_inicio: z.string().refine(date => !isNaN(Date.parse(date)), 'Data início inválida').optional(),
    data_fim: z.string().refine(date => !isNaN(Date.parse(date)), 'Data fim inválida').optional(),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20)
});

module.exports = {
    createOrderSchema,
    updateOrderStatusSchema,
    getOrdersSchema,
    cartItemSchema
};