-- Tabela de assinaturas
CREATE TABLE IF NOT EXISTS fomi_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES fomi_users(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255) NOT NULL,
    plano VARCHAR(20) NOT NULL DEFAULT 'fomi_simples',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_fomi_subscriptions_user_id ON fomi_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_fomi_subscriptions_stripe_subscription_id ON fomi_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_fomi_subscriptions_stripe_customer_id ON fomi_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_fomi_subscriptions_status ON fomi_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_fomi_subscriptions_plano ON fomi_subscriptions(plano);

-- Trigger para updated_at
CREATE TRIGGER update_fomi_subscriptions_updated_at 
    BEFORE UPDATE ON fomi_subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Constraint para garantir apenas uma assinatura ativa por usuário
CREATE UNIQUE INDEX idx_fomi_subscriptions_user_active 
    ON fomi_subscriptions(user_id) 
    WHERE status IN ('active', 'trialing', 'past_due');