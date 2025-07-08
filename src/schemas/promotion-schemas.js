// Schemas para promoções
const { z } = require('zod');

// Schema base para promoção
const basePromotionSchema = z.object({
    nome: z.string()
        .min(2, 'Nome deve ter no mínimo 2 caracteres')
        .max(255, 'Nome deve ter no máximo 255 caracteres')
        .trim(),
    
    descricao: z.string()
        .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
        .trim()
        .optional(),
    
    tipo: z.enum(['desconto_percentual', 'desconto_fixo', 'produto_gratis'], {
        errorMap: () => ({ message: 'Tipo deve ser: desconto_percentual, desconto_fixo ou produto_gratis' })
    }),
    
    valor: z.number()
        .positive('Valor deve ser positivo')
        .max(9999.99, 'Valor máximo é R$ 9.999,99'),
    
    produto_gratis_id: z.string()
        .uuid('ID do produto deve ser UUID válido')
        .optional(),
    
    valor_minimo_pedido: z.number()
        .min(0, 'Valor mínimo não pode ser negativo')
        .max(9999.99, 'Valor mínimo máximo é R$ 9.999,99')
        .optional(),
    
    data_inicio: z.string()
        .refine((date) => !isNaN(Date.parse(date)), 'Data de início inválida'),
    
    data_fim: z.string()
        .refine((date) => !isNaN(Date.parse(date)), 'Data de fim inválida')
});

// Schema para criar promoção
const createPromotionSchema = basePromotionSchema
    .refine((data) => {
        const inicio = new Date(data.data_inicio);
        const fim = new Date(data.data_fim);
        return fim >= inicio;
    }, {
        message: 'Data de fim deve ser posterior à data de início',
        path: ['data_fim']
    })
    .refine((data) => {
        if (data.tipo === 'produto_gratis' && !data.produto_gratis_id) {
            return false;
        }
        return true;
    }, {
        message: 'Produto grátis é obrigatório quando tipo é produto_gratis',
        path: ['produto_gratis_id']
    });

// Schema para atualizar promoção (todos os campos opcionais)
const updatePromotionSchema = z.object({
    nome: z.string()
        .min(2, 'Nome deve ter no mínimo 2 caracteres')
        .max(255, 'Nome deve ter no máximo 255 caracteres')
        .trim()
        .optional(),
    
    descricao: z.string()
        .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
        .trim()
        .optional(),
    
    tipo: z.enum(['desconto_percentual', 'desconto_fixo', 'produto_gratis'], {
        errorMap: () => ({ message: 'Tipo deve ser: desconto_percentual, desconto_fixo ou produto_gratis' })
    }).optional(),
    
    valor: z.number()
        .positive('Valor deve ser positivo')
        .max(9999.99, 'Valor máximo é R$ 9.999,99')
        .optional(),
    
    produto_gratis_id: z.string()
        .uuid('ID do produto deve ser UUID válido')
        .optional(),
    
    valor_minimo_pedido: z.number()
        .min(0, 'Valor mínimo não pode ser negativo')
        .max(9999.99, 'Valor mínimo máximo é R$ 9.999,99')
        .optional(),
    
    data_inicio: z.string()
        .refine((date) => !isNaN(Date.parse(date)), 'Data de início inválida')
        .optional(),
    
    data_fim: z.string()
        .refine((date) => !isNaN(Date.parse(date)), 'Data de fim inválida')
        .optional()
})
.refine((data) => {
    // Só valida datas se ambas estão presentes
    if (data.data_inicio && data.data_fim) {
        const inicio = new Date(data.data_inicio);
        const fim = new Date(data.data_fim);
        return fim >= inicio;
    }
    return true;
}, {
    message: 'Data de fim deve ser posterior à data de início',
    path: ['data_fim']
})
.refine((data) => {
    // Só valida produto grátis se tipo está sendo alterado
    if (data.tipo === 'produto_gratis' && !data.produto_gratis_id) {
        return false;
    }
    return true;
}, {
    message: 'Produto grátis é obrigatório quando tipo é produto_gratis',
    path: ['produto_gratis_id']
});

module.exports = {
    createPromotionSchema,
    updatePromotionSchema
};