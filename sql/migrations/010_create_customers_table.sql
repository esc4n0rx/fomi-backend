-- Tabela de clientes (cadastro simplificado)
CREATE TABLE IF NOT EXISTS fomi_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    endereco_cep VARCHAR(9),
    endereco_rua VARCHAR(500),
    endereco_numero VARCHAR(20),
    endereco_complemento VARCHAR(255),
    endereco_bairro VARCHAR(255),
    endereco_cidade VARCHAR(255),
    endereco_estado VARCHAR(2),
    endereco_referencia TEXT,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_fomi_customers_telefone ON fomi_customers(telefone);
CREATE INDEX IF NOT EXISTS idx_fomi_customers_email ON fomi_customers(email);
CREATE INDEX IF NOT EXISTS idx_fomi_customers_ativo ON fomi_customers(ativo);

-- Trigger para updated_at
CREATE TRIGGER update_fomi_customers_updated_at 
    BEFORE UPDATE ON fomi_customers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();