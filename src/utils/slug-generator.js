// Gerador de slugs únicos
/**
 * Gera slug a partir de texto
 * @param {string} text - Texto para gerar slug
 * @returns {string} Slug gerado
 */
const generateSlug = (text) => {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '-') // Substitui espaços por hífens
        .replace(/-+/g, '-') // Remove hífens duplicados
        .replace(/^-|-$/g, ''); // Remove hífens no início e fim
};

/**
 * Gera slug único adicionando número se necessário
 * @param {string} baseSlug - Slug base
 * @param {Function} checkExists - Função para verificar se slug existe
 * @returns {Promise<string>} Slug único
 */
const generateUniqueSlug = async (baseSlug, checkExists) => {
    let slug = baseSlug;
    let counter = 1;
    
    while (await checkExists(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    
    return slug;
};

module.exports = {
    generateSlug,
    generateUniqueSlug
};