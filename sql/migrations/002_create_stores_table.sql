-- Tabela de lojas
CREATE TABLE IF NOT EXISTS fomi_stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES fomi_users(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    descricao TEXT,
    logo_url TEXT,
    banner_url TEXT,
    cor_primaria VARCHAR(7) DEFAULT '#FF6B35',
    cor_secundaria VARCHAR(7) DEFAULT '#F7931E',
    whatsapp VARCHAR(20),
    instagram VARCHAR(100),
    facebook VARCHAR(100),
    endereco_cep VARCHAR(9),
    endereco_rua VARCHAR(500),
    endereco_numero VARCHAR(20),
    endereco_complemento VARCHAR(255),
    endereco_bairro VARCHAR(255),
    endereco_cidade VARCHAR(255),
    endereco_estado VARCHAR(2),
    horario_funcionamento JSONB DEFAULT '{"segunda": {"aberto": true, "abertura": "08:00", "fechamento": "18:00"}, "terca": {"aberto": true, "abertura": "08:00", "fechamento": "18:00"}, "quarta": {"aberto": true, "abertura": "08:00", "fechamento": "18:00"}, "quinta": {"aberto": true, "abertura": "08:00", "fechamento": "18:00"}, "sexta": {"aberto": true, "abertura": "08:00", "fechamento": "18:00"}, "sabado": {"aberto": true, "abertura": "08:00", "fechamento": "18:00"}, "domingo": {"aberto": false, "abertura": "08:00", "fechamento": "18:00"}}',
    configuracoes JSONB DEFAULT '{"aceita_pedidos": true, "tempo_preparo_min": 30, "valor_minimo_pedido": 0, "taxa_entrega": 0, "raio_entrega_km": 5}',
    plano VARCHAR(20) DEFAULT 'gratuito',
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_fomi_stores_user_id ON fomi_stores(user_id);
CREATE INDEX IF NOT EXISTS idx_fomi_stores_slug ON fomi_stores(slug);
CREATE INDEX IF NOT EXISTS idx_fomi_stores_ativo ON fomi_stores(ativo);

-- Trigger para updated_at
CREATE TRIGGER update_fomi_stores_updated_at 
    BEFORE UPDATE ON fomi_stores 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Constraint para garantir 1 loja por usuário no plano gratuito
CREATE UNIQUE INDEX idx_fomi_stores_user_gratuito 
    ON fomi_stores(user_id) 
    WHERE plano = 'gratuito' AND ativo = true;