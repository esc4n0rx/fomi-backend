-- Tabela de promoções
CREATE TABLE IF NOT EXISTS fomi_promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES fomi_stores(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('desconto_percentual', 'desconto_fixo', 'produto_gratis')),
    valor DECIMAL(10,2) NOT NULL,
    produto_gratis_id UUID REFERENCES fomi_products(id) ON DELETE SET NULL,
    valor_minimo_pedido DECIMAL(10,2) DEFAULT 0,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_fomi_promotions_store_id ON fomi_promotions(store_id);
CREATE INDEX IF NOT EXISTS idx_fomi_promotions_ativo ON fomi_promotions(ativo);
CREATE INDEX IF NOT EXISTS idx_fomi_promotions_datas ON fomi_promotions(data_inicio, data_fim);

-- Trigger para updated_at
CREATE TRIGGER update_fomi_promotions_updated_at 
    BEFORE UPDATE ON fomi_promotions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Constraint para garantir datas válidas
ALTER TABLE fomi_promotions ADD CONSTRAINT chk_data_promocao_valida 
    CHECK (data_fim >= data_inicio);