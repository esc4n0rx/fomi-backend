-- Atualiza tabela de lojas com campos de personalização
ALTER TABLE fomi_stores 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS cor_texto VARCHAR(7) DEFAULT '#333333',
ADD COLUMN IF NOT EXISTS cor_fundo VARCHAR(7) DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS fonte_titulo VARCHAR(50) DEFAULT 'Roboto',
ADD COLUMN IF NOT EXISTS fonte_texto VARCHAR(50) DEFAULT 'Roboto';

-- Atualiza tabela de produtos para suportar múltiplas imagens
ALTER TABLE fomi_products 
ADD COLUMN IF NOT EXISTS imagens_extras TEXT[];

-- Atualiza tabela de categorias para suportar imagem
ALTER TABLE fomi_categories 
ADD COLUMN IF NOT EXISTS imagem_url TEXT;

-- Comentários para documentar as colunas
COMMENT ON COLUMN fomi_stores.logo_url IS 'URL do logo da loja no Cloudinary';
COMMENT ON COLUMN fomi_stores.banner_url IS 'URL do banner da loja no Cloudinary';
COMMENT ON COLUMN fomi_stores.cor_texto IS 'Cor do texto principal em hex';
COMMENT ON COLUMN fomi_stores.cor_fundo IS 'Cor de fundo principal em hex';
COMMENT ON COLUMN fomi_stores.fonte_titulo IS 'Fonte para títulos';
COMMENT ON COLUMN fomi_stores.fonte_texto IS 'Fonte para textos';
COMMENT ON COLUMN fomi_products.imagens_extras IS 'Array de URLs de imagens extras do produto';
COMMENT ON COLUMN fomi_categories.imagem_url IS 'URL da imagem da categoria no Cloudinary';