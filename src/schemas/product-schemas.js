// Schemas para produtos
const { z } = require('zod');

// Schema para criar produto
const createProductSchema = z.object({
    nome: z.string()
        .min(2, 'Nome deve ter no mínimo 2 caracteres')
        .max(255, 'Nome deve ter no máximo 255 caracteres')
        .trim(),
    
    descricao: z.string()
        .max(2000, 'Descrição deve ter no máximo 2000 caracteres')
        .trim()
        .optional(),
    
    preco: z.number()
        .positive('Preço deve ser positivo')
        .max(9999.99, 'Preço máximo é R$ 9.999,99'),
    
    preco_promocional: z.number()
        .positive('Preço promocional deve ser positivo')
        .max(9999.99, 'Preço promocional máximo é R$ 9.999,99')
        .optional(),
    
    category_id: z.string()
        .uuid('ID da categoria deve ser UUID válido')
        .optional(),
    
    ingredientes: z.array(z.string().trim())
        .max(50, 'Máximo 50 ingredientes')
        .optional(),
    
    alergicos: z.array(z.string().trim())
        .max(20, 'Máximo 20 alérgicos')
        .optional(),
    
    tempo_preparo_min: z.number()
        .int('Tempo de preparo deve ser número inteiro')
        .min(1, 'Tempo mínimo é 1 minuto')
        .max(180, 'Tempo máximo é 180 minutos')
        .optional(),
    
    disponivel: z.boolean().optional(),
    destaque: z.boolean().optional(),
    imagem_url: z.string().url('URL da imagem inválida').optional(),
    ordem: z.number().int().min(0).optional()
});

// Schema para atualizar produto
const updateProductSchema = z.object({
    nome: z.string()
        .min(2, 'Nome deve ter no mínimo 2 caracteres')
        .max(255, 'Nome deve ter no máximo 255 caracteres')
        .trim()
        .optional(),
    
    descricao: z.string()
        .max(2000, 'Descrição deve ter no máximo 2000 caracteres')
        .trim()
        .optional(),
    
    preco: z.number()
        .positive('Preço deve ser positivo')
        .max(9999.99, 'Preço máximo é R$ 9.999,99')
        .optional(),
    
    preco_promocional: z.number()
        .positive('Preço promocional deve ser positivo')
        .max(9999.99, 'Preço promocional máximo é R$ 9.999,99')
        .optional(),
    
    category_id: z.string()
        .uuid('ID da categoria deve ser UUID válido')
        .optional(),
    
    ingredientes: z.array(z.string().trim())
        .max(50, 'Máximo 50 ingredientes')
        .optional(),
    
    alergicos: z.array(z.string().trim())
        .max(20, 'Máximo 20 alérgicos')
        .optional(),
    
    tempo_preparo_min: z.number()
        .int('Tempo de preparo deve ser número inteiro')
        .min(1, 'Tempo mínimo é 1 minuto')
        .max(180, 'Tempo máximo é 180 minutos')
        .optional(),
    
    disponivel: z.boolean().optional(),
    destaque: z.boolean().optional(),
    imagem_url: z.string().url('URL da imagem inválida').optional(),
    ordem: z.number().int().min(0).optional()
});

module.exports = {
    createProductSchema,
    updateProductSchema
};