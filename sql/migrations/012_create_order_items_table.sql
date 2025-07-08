-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS fomi_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES fomi_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES fomi_products(id) ON DELETE CASCADE,
    
    -- Dados do produto (snapshot para histórico)
    produto_nome VARCHAR(255) NOT NULL,
    produto_descricao TEXT,
    produto_preco DECIMAL(10,2) NOT NULL,
    produto_preco_promocional DECIMAL(10,2),
    
    -- Quantidade e valores
    quantidade INTEGER NOT NULL DEFAULT 1,
    preco_unitario DECIMAL(10,2) NOT NULL, -- Preço no momento do pedido
    subtotal DECIMAL(10,2) NOT NULL, -- quantidade * preco_unitario
    
    -- Observações específicas do item
    observacoes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_fomi_order_items_order_id ON fomi_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_fomi_order_items_product_id ON fomi_order_items(product_id);

-- Constraint para garantir valores positivos
ALTER TABLE fomi_order_items ADD CONSTRAINT chk_quantidade_positiva 
    CHECK (quantidade > 0);
ALTER TABLE fomi_order_items ADD CONSTRAINT chk_preco_unitario_positivo 
    CHECK (preco_unitario > 0);
ALTER TABLE fomi_order_items ADD CONSTRAINT chk_subtotal_positivo 
    CHECK (subtotal > 0);