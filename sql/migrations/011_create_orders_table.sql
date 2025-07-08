-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS fomi_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES fomi_stores(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES fomi_customers(id) ON DELETE CASCADE,
    numero_pedido VARCHAR(20) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pendente',
    
    -- Dados do cliente (snapshot para histórico)
    cliente_nome VARCHAR(255) NOT NULL,
    cliente_telefone VARCHAR(20) NOT NULL,
    cliente_email VARCHAR(255),
    
    -- Endereço de entrega
    endereco_cep VARCHAR(9),
    endereco_rua VARCHAR(500),
    endereco_numero VARCHAR(20),
    endereco_complemento VARCHAR(255),
    endereco_bairro VARCHAR(255),
    endereco_cidade VARCHAR(255),
    endereco_estado VARCHAR(2),
    endereco_referencia TEXT,
    
    -- Valores
    subtotal DECIMAL(10,2) NOT NULL,
    desconto DECIMAL(10,2) DEFAULT 0,
    taxa_entrega DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    
    -- Cupom aplicado (snapshot)
    cupom_codigo VARCHAR(50),
    cupom_desconto DECIMAL(10,2) DEFAULT 0,
    
    -- Método de pagamento e entrega
    metodo_pagamento VARCHAR(20) DEFAULT 'dinheiro',
    troco_para DECIMAL(10,2),
    tipo_entrega VARCHAR(20) DEFAULT 'entrega', -- entrega, retirada
    
    -- Observações e tempo
    observacoes TEXT,
    tempo_estimado_min INTEGER DEFAULT 30,
    
    -- Timestamps importantes
    pedido_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmado_em TIMESTAMP WITH TIME ZONE,
    preparando_em TIMESTAMP WITH TIME ZONE,
    saiu_entrega_em TIMESTAMP WITH TIME ZONE,
    entregue_em TIMESTAMP WITH TIME ZONE,
    cancelado_em TIMESTAMP WITH TIME ZONE,
    motivo_cancelamento TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_fomi_orders_store_id ON fomi_orders(store_id);
CREATE INDEX IF NOT EXISTS idx_fomi_orders_customer_id ON fomi_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_fomi_orders_status ON fomi_orders(status);
CREATE INDEX IF NOT EXISTS idx_fomi_orders_numero_pedido ON fomi_orders(numero_pedido);
CREATE INDEX IF NOT EXISTS idx_fomi_orders_pedido_em ON fomi_orders(pedido_em);

-- Trigger para updated_at
CREATE TRIGGER update_fomi_orders_updated_at 
    BEFORE UPDATE ON fomi_orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Função para gerar número de pedido
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
BEGIN
    -- Gera número baseado na data + contador sequencial
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_pedido FROM 9) AS INTEGER)), 0) + 1
    INTO counter
    FROM fomi_orders 
    WHERE numero_pedido LIKE TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '%';
    
    new_number := TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || LPAD(counter::TEXT, 4, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar número automático
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numero_pedido IS NULL OR NEW.numero_pedido = '' THEN
        NEW.numero_pedido := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_fomi_orders_number
    BEFORE INSERT ON fomi_orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_number();