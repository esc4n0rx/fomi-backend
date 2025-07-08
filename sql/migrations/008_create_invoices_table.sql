-- Tabela de faturas
CREATE TABLE IF NOT EXISTS fomi_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES fomi_users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES fomi_subscriptions(id) ON DELETE SET NULL,
    stripe_invoice_id VARCHAR(255) UNIQUE NOT NULL,
    numero_fatura VARCHAR(100),
    status VARCHAR(20) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'BRL',
    period_start DATE,
    period_end DATE,
    due_date DATE,
    paid_at TIMESTAMP WITH TIME ZONE,
    hosted_invoice_url TEXT,
    invoice_pdf TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_fomi_invoices_user_id ON fomi_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_fomi_invoices_subscription_id ON fomi_invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_fomi_invoices_stripe_invoice_id ON fomi_invoices(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_fomi_invoices_status ON fomi_invoices(status);
CREATE INDEX IF NOT EXISTS idx_fomi_invoices_due_date ON fomi_invoices(due_date);

-- Trigger para updated_at
CREATE TRIGGER update_fomi_invoices_updated_at 
    BEFORE UPDATE ON fomi_invoices 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();