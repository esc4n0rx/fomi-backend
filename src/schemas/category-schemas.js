// Schemas para categorias (ATUALIZADO)
const { z } = require('zod');

// Schema para criar categoria
const createCategorySchema = z.object({
    nome: z.string()
        .min(2, 'Nome deve ter no mínimo 2 caracteres')
        .max(255, 'Nome deve ter no máximo 255 caracteres')
        .trim(),
    
    descricao: z.string()
        .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
        .trim()
        .optional(),
    
    cor: z.string()
        .regex(/^#[0-9A-F]{6}$/i, 'Cor deve ser hex válida')
        .optional(),
    
    ordem: z.number()
        .int('Ordem deve ser um número inteiro')
        .min(0, 'Ordem não pode ser negativa')
        .optional()
});

// Schema para atualizar categoria
const updateCategorySchema = z.object({
    nome: z.string()
        .min(2, 'Nome deve ter no mínimo 2 caracteres')
        .max(255, 'Nome deve ter no máximo 255 caracteres')
        .trim()
        .optional(),
    
    descricao: z.string()
        .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
        .trim()
        .optional(),
    
    cor: z.string()
        .regex(/^#[0-9A-F]{6}$/i, 'Cor deve ser hex válida')
        .optional(),
    
    ordem: z.number()
        .int('Ordem deve ser um número inteiro')
        .min(0, 'Ordem não pode ser negativa')
        .optional()
});

module.exports = {
    createCategorySchema,
    updateCategorySchema
};