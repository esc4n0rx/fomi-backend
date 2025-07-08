// Schemas para cupons
const { z } = require('zod');

// Schema base para cupom
const baseCouponSchema = z.object({
    codigo: z.string()
        .min(3, 'Código deve ter no mínimo 3 caracteres')
        .max(50, 'Código deve ter no máximo 50 caracteres')
        .regex(/^[A-Z0-9]+$/, 'Código deve conter apenas letras maiúsculas e números')
        .trim(),
    
    nome: z.string()
        .min(2, 'Nome deve ter no mínimo 2 caracteres')
        .max(255, 'Nome deve ter no máximo 255 caracteres')
        .trim(),
    
    descricao: z.string()
        .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
        .trim()
        .optional(),
    
    tipo: z.enum(['desconto_percentual', 'desconto_fixo', 'frete_gratis'], {
        errorMap: () => ({ message: 'Tipo deve ser: desconto_percentual, desconto_fixo ou frete_gratis' })
    }),
    
    valor: z.number()
        .positive('Valor deve ser positivo')
        .max(9999.99, 'Valor máximo é R$ 9.999,99'),
    
    valor_minimo_pedido: z.number()
        .min(0, 'Valor mínimo não pode ser negativo')
        .max(9999.99, 'Valor mínimo máximo é R$ 9.999,99')
        .optional(),
    
    limite_uso: z.number()
        .int('Limite de uso deve ser número inteiro')
        .min(1, 'Limite de uso deve ser no mínimo 1')
        .optional(),
    
    data_inicio: z.string()
        .refine((date) => !isNaN(Date.parse(date)), 'Data de início inválida'),
    
    data_fim: z.string()
        .refine((date) => !isNaN(Date.parse(date)), 'Data de fim inválida')
});

// Schema para criar cupom
const createCouponSchema = baseCouponSchema
    .refine((data) => {
        const inicio = new Date(data.data_inicio);
        const fim = new Date(data.data_fim);
        return fim >= inicio;
    }, {
        message: 'Data de fim deve ser posterior à data de início',
        path: ['data_fim']
    });

// Schema para atualizar cupom (todos os campos opcionais)
const updateCouponSchema = z.object({
    codigo: z.string()
        .min(3, 'Código deve ter no mínimo 3 caracteres')
        .max(50, 'Código deve ter no máximo 50 caracteres')
        .regex(/^[A-Z0-9]+$/, 'Código deve conter apenas letras maiúsculas e números')
        .trim()
        .optional(),
    
    nome: z.string()
        .min(2, 'Nome deve ter no mínimo 2 caracteres')
        .max(255, 'Nome deve ter no máximo 255 caracteres')
        .trim()
        .optional(),
    
    descricao: z.string()
        .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
        .trim()
        .optional(),
    
    tipo: z.enum(['desconto_percentual', 'desconto_fixo', 'frete_gratis'], {
        errorMap: () => ({ message: 'Tipo deve ser: desconto_percentual, desconto_fixo ou frete_gratis' })
    }).optional(),
    
    valor: z.number()
        .positive('Valor deve ser positivo')
        .max(9999.99, 'Valor máximo é R$ 9.999,99')
        .optional(),
    
    valor_minimo_pedido: z.number()
        .min(0, 'Valor mínimo não pode ser negativo')
        .max(9999.99, 'Valor mínimo máximo é R$ 9.999,99')
        .optional(),
    
    limite_uso: z.number()
        .int('Limite de uso deve ser número inteiro')
        .min(1, 'Limite de uso deve ser no mínimo 1')
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
});

module.exports = {
    createCouponSchema,
    updateCouponSchema
};