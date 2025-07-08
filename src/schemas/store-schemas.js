// Schemas para lojas
const { z } = require('zod');

// Schema para criação de loja
const createStoreSchema = z.object({
    nome: z.string()
        .min(2, 'Nome deve ter no mínimo 2 caracteres')
        .max(255, 'Nome deve ter no máximo 255 caracteres')
        .trim(),
    
    descricao: z.string()
        .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
        .trim()
        .optional(),
    
    whatsapp: z.string()
        .regex(/^\(?[1-9]{2}\)?\s?9?[0-9]{4}-?[0-9]{4}$/, 'WhatsApp deve ter formato válido')
        .optional(),
    
    instagram: z.string()
        .max(100, 'Instagram deve ter no máximo 100 caracteres')
        .trim()
        .optional(),
    
    facebook: z.string()
        .max(100, 'Facebook deve ter no máximo 100 caracteres')
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
    
    cor_primaria: z.string()
        .regex(/^#[0-9A-F]{6}$/i, 'Cor primária deve ser hex válida')
        .optional(),
    
    cor_secundaria: z.string()
        .regex(/^#[0-9A-F]{6}$/i, 'Cor secundária deve ser hex válida')
        .optional()
});

// Schema para atualização de loja
const updateStoreSchema = createStoreSchema.partial();

module.exports = {
    createStoreSchema,
    updateStoreSchema
};