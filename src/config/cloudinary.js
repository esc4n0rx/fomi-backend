// Configuração do Cloudinary
const cloudinary = require('cloudinary').v2;

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error('Variáveis de ambiente do Cloudinary não configuradas');
}

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});

/**
 * Faz upload de imagem para o Cloudinary
 * @param {Buffer} buffer - Buffer da imagem
 * @param {Object} options - Opções de upload
 * @returns {Promise<Object>} Resultado do upload
 */
const uploadImage = async (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const uploadOptions = {
            resource_type: 'image',
            quality: 'auto:good',
            fetch_format: 'auto',
            ...options
        };

        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) {
                    console.error('Erro no upload para Cloudinary:', error);
                    reject(new Error(`Erro no upload: ${error.message}`));
                } else {
                    resolve(result);
                }
            }
        );

        uploadStream.end(buffer);
    });
};

/**
 * Remove imagem do Cloudinary
 * @param {string} publicId - ID público da imagem
 * @returns {Promise<Object>} Resultado da remoção
 */
const deleteImage = async (publicId) => {
    try {
        return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Erro ao deletar imagem:', error);
        throw new Error(`Erro ao deletar imagem: ${error.message}`);
    }
};

/**
 * Extrai public_id de uma URL do Cloudinary
 * @param {string} url - URL da imagem
 * @returns {string|null} Public ID ou null
 */
const extractPublicId = (url) => {
    if (!url || !url.includes('cloudinary.com')) {
        return null;
    }

    try {
        // Exemplo: https://res.cloudinary.com/cloud/image/upload/v123/folder/image.jpg
        const parts = url.split('/');
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex === -1) return null;

        // Pega tudo após /upload/v{version}/
        const pathParts = parts.slice(uploadIndex + 2);
        const filename = pathParts.join('/');
        
        // Remove extensão
        return filename.replace(/\.[^/.]+$/, '');
    } catch (error) {
        console.error('Erro ao extrair public_id:', error);
        return null;
    }
};

module.exports = {
    cloudinary,
    uploadImage,
    deleteImage,
    extractPublicId
};