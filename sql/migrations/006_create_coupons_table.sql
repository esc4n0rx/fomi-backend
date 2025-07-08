-- Tabela de cupons
CREATE TABLE IF NOT EXISTS fomi_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES fomi_stores(id) ON DELETE CASCADE,
    codigo VARCHAR(50) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('desconto_percentual', 'desconto_fixo', 'frete_gratis')),
    valor DECIMAL(10,2) NOT NULL,
    valor_minimo_pedido DECIMAL(10,2) DEFAULT 0,
    limite_uso INTEGER,
    total_usado INTEGER DEFAULT 0,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_fomi_coupons_store_id ON fomi_coupons(store_id);
CREATE INDEX IF NOT EXISTS idx_fomi_coupons_codigo ON fomi_coupons(codigo);
CREATE INDEX IF NOT EXISTS idx_fomi_coupons_ativo ON fomi_coupons(ativo);
CREATE INDEX IF NOT EXISTS idx_fomi_coupons_datas ON fomi_coupons(data_inicio, data_fim);

-- Trigger para updated_at
CREATE TRIGGER update_fomi_coupons_updated_at 
    BEFORE UPDATE ON fomi_coupons 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Constraint para garantir código único por loja
CREATE UNIQUE INDEX idx_fomi_coupons_store_codigo 
    ON fomi_coupons(store_id, UPPER(codigo)) 
    WHERE ativo = true;

-- Constraint para garantir datas válidas
ALTER TABLE fomi_coupons ADD CONSTRAINT chk_data_cupom_valida 
    CHECK (data_fim >= data_inicio);