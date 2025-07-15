// Validador de imagens
const sharp = require('sharp');

/**
 * Valida se arquivo é uma imagem válida
 * @param {Buffer} buffer - Buffer do arquivo
 * @returns {Promise<Object>} Metadados da imagem
 */
const validateImage = async (buffer) => {
    try {
        const metadata = await sharp(buffer).metadata();
        
        if (!metadata.format) {
            throw new Error('Arquivo não é uma imagem válida');
        }

        const allowedFormats = ['jpeg', 'jpg', 'png', 'webp'];
        if (!allowedFormats.includes(metadata.format)) {
            throw new Error(`Formato não suportado. Use: ${allowedFormats.join(', ')}`);
        }

        return metadata;
    } catch (error) {
        throw new Error(`Imagem inválida: ${error.message}`);
    }
};

/**
 * Valida dimensões de imagem para tipo específico
 * @param {Object} metadata - Metadados da imagem
 * @param {string} type - Tipo da imagem (logo, banner, product, category)
 */
const validateImageDimensions = (metadata, type) => {
    const { width, height } = metadata;
    
    const requirements = {
        logo: {
            minWidth: 100,
            maxWidth: 512,
            minHeight: 100,
            maxHeight: 512,
            aspectRatio: { min: 0.5, max: 2 } // Quadrado ou próximo
        },
        banner: {
            minWidth: 800,
            maxWidth: 1920,
            minHeight: 200,
            maxHeight: 600,
            aspectRatio: { min: 2, max: 6 } // Formato banner
        },
        product: {
            minWidth: 200,
            maxWidth: 1024,
            minHeight: 200,
            maxHeight: 1024,
            aspectRatio: { min: 0.5, max: 2 }
        },
        category: {
            minWidth: 100,
            maxWidth: 512,
            minHeight: 100,
            maxHeight: 512,
            aspectRatio: { min: 0.5, max: 2 }
        }
    };

    const req = requirements[type];
    if (!req) {
        throw new Error(`Tipo de imagem desconhecido: ${type}`);
    }

    if (width < req.minWidth || width > req.maxWidth) {
        throw new Error(`Largura deve estar entre ${req.minWidth}px e ${req.maxWidth}px`);
    }

    if (height < req.minHeight || height > req.maxHeight) {
        throw new Error(`Altura deve estar entre ${req.minHeight}px e ${req.maxHeight}px`);
    }

    const aspectRatio = width / height;
    if (aspectRatio < req.aspectRatio.min || aspectRatio > req.aspectRatio.max) {
        throw new Error(`Proporção da imagem inadequada para ${type}`);
    }
};

/**
 * Valida tamanho do arquivo
 * @param {number} size - Tamanho em bytes
 * @param {string} type - Tipo da imagem
 */
const validateFileSize = (size, type) => {
    const maxSizes = {
        logo: 2 * 1024 * 1024,     // 2MB
        banner: 5 * 1024 * 1024,   // 5MB
        product: 3 * 1024 * 1024,  // 3MB
        category: 2 * 1024 * 1024  // 2MB
    };

    const maxSize = maxSizes[type] || 2 * 1024 * 1024;
    
    if (size > maxSize) {
        const maxMB = Math.round(maxSize / (1024 * 1024));
        throw new Error(`Arquivo muito grande. Máximo ${maxMB}MB para ${type}`);
    }
};

module.exports = {
    validateImage,
    validateImageDimensions,
    validateFileSize
};