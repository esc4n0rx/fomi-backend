// Schemas de autenticação
const { z } = require('zod');
const { isValidCPF } = require('../utils/cpf-validator');

// Schema para registro de usuário
const registerSchema = z.object({
    nome: z.string()
        .min(2, 'Nome deve ter no mínimo 2 caracteres')
        .max(255, 'Nome deve ter no máximo 255 caracteres')
        .trim(),
    
    email: z.string()
        .email('Email inválido')
        .max(255, 'Email deve ter no máximo 255 caracteres')
        .toLowerCase()
        .trim(),
    
    data_nascimento: z.string()
        .refine((date) => {
            const nascimento = new Date(date);
            const hoje = new Date();
            const idade = hoje.getFullYear() - nascimento.getFullYear();
            const mesAtual = hoje.getMonth();
            const mesNascimento = nascimento.getMonth();
            
            // Ajusta idade se ainda não fez aniversário este ano
            if (mesAtual < mesNascimento || 
                (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
                return (idade - 1) >= 18;
            }
            
            return idade >= 18;
        }, 'Usuário deve ter no mínimo 18 anos'),
    
    cpf: z.string()
        .refine(isValidCPF, 'CPF inválido'),
    
    endereco_cep: z.string()
        .regex(/^\d{5}-?\d{3}$/, 'CEP deve ter formato 00000-000'),
    
    endereco_rua: z.string()
        .min(1, 'Rua é obrigatória')
        .max(500, 'Rua deve ter no máximo 500 caracteres')
        .trim(),
    
    endereco_numero: z.string()
        .min(1, 'Número é obrigatório')
        .max(20, 'Número deve ter no máximo 20 caracteres')
        .trim(),
    
    endereco_complemento: z.string()
        .max(255, 'Complemento deve ter no máximo 255 caracteres')
        .trim()
        .optional(),
    
    endereco_bairro: z.string()
        .min(1, 'Bairro é obrigatório')
        .max(255, 'Bairro deve ter no máximo 255 caracteres')
        .trim(),
    
    endereco_cidade: z.string()
        .min(1, 'Cidade é obrigatória')
        .max(255, 'Cidade deve ter no máximo 255 caracteres')
        .trim(),
    
    endereco_estado: z.string()
        .length(2, 'Estado deve ter 2 caracteres')
        .toUpperCase(),
    
    password: z.string()
        .min(6, 'Senha deve ter no mínimo 6 caracteres')
        .max(100, 'Senha deve ter no máximo 100 caracteres'),
    
    codigo_convite: z.string()
        .max(50, 'Código de convite deve ter no máximo 50 caracteres')
        .trim()
        .optional()
});

// Schema para login
const loginSchema = z.object({
    email: z.string()
        .email('Email inválido')
        .toLowerCase()
        .trim(),
    
    password: z.string()
        .min(1, 'Senha é obrigatória')
});

module.exports = {
    registerSchema,
    loginSchema
};