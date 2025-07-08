-- Adiciona referência à assinatura na tabela de lojas
ALTER TABLE fomi_stores 
ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES fomi_subscriptions(id) ON DELETE SET NULL;

-- Adiciona índice
CREATE INDEX IF NOT EXISTS idx_fomi_stores_subscription_id ON fomi_stores(subscription_id);

-- Remove a constraint antiga de uma loja por usuário no plano gratuito
DROP INDEX IF EXISTS idx_fomi_stores_user_gratuito;

-- Adiciona nova constraint baseada na assinatura
-- Usuários podem ter múltiplas lojas se o plano permitir