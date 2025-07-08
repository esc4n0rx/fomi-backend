// Schemas para clientes
const { z } = require('zod');

// Schema para criar/atualizar cliente
const customerSchema = z.object({
    nome: z.string()
        .min(2, 'Nome deve ter no mínimo 2 caracteres')
        .max(255, 'Nome deve ter no máximo 255 caracteres')
        .trim(),
    
    telefone: z.string()
        .regex(/^\(?[1-9]{2}\)?\s?9?[0-9]{4}-?[0-9]{4}$/, 'Telefone deve ter formato válido')
        .transform(phone => phone.replace(/\D/g, '')), // Remove formatação
    
    email: z.string()
        .email('Email inválido')
        .max(255, 'Email deve ter no máximo 255 caracteres')
        .toLowerCase()
        .trim()
        .optional(),
    
    endereco_cep: z.string()
        .regex(/^\d{5}-?\d{3}$/, 'CEP deve ter formato 00000-000')
        .optional(),
    
    endereco_rua: z.string()
        .max(500, 'Rua deve ter no máximo 500 caracteres')
        .trim()
        .optional(),
    
    endereco_numero: z.string()
        .max(20, 'Número deve ter no máximo 20 caracteres')
        .trim()
        .optional(),
    
    endereco_complemento: z.string()
        .max(255, 'Complemento deve ter no máximo 255 caracteres')
        .trim()
        .optional(),
    
    endereco_bairro: z.string()
        .max(255, 'Bairro deve ter no máximo 255 caracteres')
        .trim()
        .optional(),
    
    endereco_cidade: z.string()
        .max(255, 'Cidade deve ter no máximo 255 caracteres')
        .trim()
        .optional(),
    
    endereco_estado: z.string()
        .length(2, 'Estado deve ter 2 caracteres')
        .toUpperCase()
        .optional(),
    
    endereco_referencia: z.string()
        .max(1000, 'Referência deve ter no máximo 1000 caracteres')
        .trim()
        .optional(),
    
    observacoes: z.string()
        .max(1000, 'Observações deve ter no máximo 1000 caracteres')
        .trim()
        .optional()
});

module.exports = {
    customerSchema
};