// Schemas para lojas (AJUSTADO para criação em etapas)
const { z } = require('zod');

// Schema para criação BÁSICA de loja (primeira etapa)
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

    // Campos básicos opcionais (redes sociais)
    instagram: z.string()
        .max(100, 'Instagram deve ter no máximo 100 caracteres')
        .trim()
        .optional(),
    
    facebook: z.string()
        .max(100, 'Facebook deve ter no máximo 100 caracteres')
        .trim()
        .optional()
    
    // ❌ REMOVIDO: Campos de personalização visual (cores, fontes)
    // Esses ficam apenas no schema de personalização
});

// Schema para atualização básica de dados da loja
const updateStoreSchema = z.object({
    nome: z.string()
        .min(2, 'Nome deve ter no mínimo 2 caracteres')
        .max(255, 'Nome deve ter no máximo 255 caracteres')
        .trim()
        .optional(),
    
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
        .optional()
});

// Schema SEPARADO para personalização visual (segunda etapa)
const updateStoreCustomizationSchema = z.object({
    cor_primaria: z.string()
        .regex(/^#[0-9A-F]{6}$/i, 'Cor primária deve ser hex válida')
        .optional(),
    
    cor_secundaria: z.string()
        .regex(/^#[0-9A-F]{6}$/i, 'Cor secundária deve ser hex válida')
        .optional(),
    
    cor_texto: z.string()
        .regex(/^#[0-9A-F]{6}$/i, 'Cor do texto deve ser hex válida')
        .optional(),
    
    cor_fundo: z.string()
        .regex(/^#[0-9A-F]{6}$/i, 'Cor do fundo deve ser hex válida')
        .optional(),
    
    fonte_titulo: z.enum(['Arial', 'Helvetica', 'Georgia', 'Times', 'Verdana', 'Roboto', 'Open Sans', 'Lato'], {
        errorMap: () => ({ message: 'Fonte do título inválida' })
    }).optional(),
    
    fonte_texto: z.enum(['Arial', 'Helvetica', 'Georgia', 'Times', 'Verdana', 'Roboto', 'Open Sans', 'Lato'], {
        errorMap: () => ({ message: 'Fonte do texto inválida' })
    }).optional()
});

module.exports = {
    createStoreSchema,           // ✅ Criação básica (primeira etapa)
    updateStoreSchema,           // ✅ Atualização de dados básicos
    updateStoreCustomizationSchema // ✅ Personalização visual (segunda etapa)
};