-- Adiciona valores padrão para personalização de lojas
-- Atualiza lojas existentes sem personalização

UPDATE fomi_stores 
SET 
    cor_primaria = COALESCE(cor_primaria, '#FF6B35'),
    cor_secundaria = COALESCE(cor_secundaria, '#F7931E'),
    cor_texto = COALESCE(cor_texto, '#333333'),
    cor_fundo = COALESCE(cor_fundo, '#FFFFFF'),
    fonte_titulo = COALESCE(fonte_titulo, 'Roboto'),
    fonte_texto = COALESCE(fonte_texto, 'Roboto')
WHERE 
    cor_primaria IS NULL 
    OR cor_secundaria IS NULL 
    OR cor_texto IS NULL 
    OR cor_fundo IS NULL 
    OR fonte_titulo IS NULL 
    OR fonte_texto IS NULL;

-- Atualiza valores padrão das colunas para novas lojas
ALTER TABLE fomi_stores 
ALTER COLUMN cor_primaria SET DEFAULT '#FF6B35',
ALTER COLUMN cor_secundaria SET DEFAULT '#F7931E',
ALTER COLUMN cor_texto SET DEFAULT '#333333',
ALTER COLUMN cor_fundo SET DEFAULT '#FFFFFF',
ALTER COLUMN fonte_titulo SET DEFAULT 'Roboto',
ALTER COLUMN fonte_texto SET DEFAULT 'Roboto';