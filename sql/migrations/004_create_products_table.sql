-- Tabela de produtos
CREATE TABLE IF NOT EXISTS fomi_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES fomi_stores(id) ON DELETE CASCADE,
    category_id UUID REFERENCES fomi_categories(id) ON DELETE SET NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    preco_promocional DECIMAL(10,2),
    ingredientes TEXT[],
    alergicos TEXT[],
    tempo_preparo_min INTEGER DEFAULT 15,
    disponivel BOOLEAN DEFAULT TRUE,
    destaque BOOLEAN DEFAULT FALSE,
    imagem_url TEXT,
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_fomi_products_store_id ON fomi_products(store_id);
CREATE INDEX IF NOT EXISTS idx_fomi_products_category_id ON fomi_products(category_id);
CREATE INDEX IF NOT EXISTS idx_fomi_products_ativo ON fomi_products(ativo);
CREATE INDEX IF NOT EXISTS idx_fomi_products_disponivel ON fomi_products(disponivel);
CREATE INDEX IF NOT EXISTS idx_fomi_products_destaque ON fomi_products(destaque);
CREATE INDEX IF NOT EXISTS idx_fomi_products_ordem ON fomi_products(ordem);

-- Trigger para updated_at
CREATE TRIGGER update_fomi_products_updated_at 
    BEFORE UPDATE ON fomi_products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Constraint para garantir preços válidos
ALTER TABLE fomi_products ADD CONSTRAINT chk_preco_positivo 
    CHECK (preco > 0);
ALTER TABLE fomi_products ADD CONSTRAINT chk_preco_promocional_valido 
    CHECK (preco_promocional IS NULL OR preco_promocional > 0);