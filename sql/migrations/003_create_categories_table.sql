-- Tabela de categorias
CREATE TABLE IF NOT EXISTS fomi_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES fomi_stores(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    cor VARCHAR(7) DEFAULT '#FF6B35',
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_fomi_categories_store_id ON fomi_categories(store_id);
CREATE INDEX IF NOT EXISTS idx_fomi_categories_ativo ON fomi_categories(ativo);
CREATE INDEX IF NOT EXISTS idx_fomi_categories_ordem ON fomi_categories(ordem);

-- Trigger para updated_at
CREATE TRIGGER update_fomi_categories_updated_at 
    BEFORE UPDATE ON fomi_categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Constraint para garantir nomes únicos por loja
CREATE UNIQUE INDEX idx_fomi_categories_store_nome 
    ON fomi_categories(store_id, LOWER(nome)) 
    WHERE ativo = true;