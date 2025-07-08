-- SQL para criar tabela de usuários
-- Tabela de usuários (lojistas)
CREATE TABLE IF NOT EXISTS fomi_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    data_nascimento DATE NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    endereco_cep VARCHAR(9) NOT NULL,
    endereco_rua VARCHAR(500) NOT NULL,
    endereco_numero VARCHAR(20) NOT NULL,
    endereco_complemento VARCHAR(255),
    endereco_bairro VARCHAR(255) NOT NULL,
    endereco_cidade VARCHAR(255) NOT NULL,
    endereco_estado VARCHAR(2) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    codigo_convite VARCHAR(50),
    email_verificado BOOLEAN DEFAULT FALSE,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_fomi_users_email ON fomi_users(email);
CREATE INDEX IF NOT EXISTS idx_fomi_users_cpf ON fomi_users(cpf);
CREATE INDEX IF NOT EXISTS idx_fomi_users_codigo_convite ON fomi_users(codigo_convite);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_fomi_users_updated_at 
    BEFORE UPDATE ON fomi_users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();