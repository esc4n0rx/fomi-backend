// Middleware de upload
const multer = require('multer');
const { validateImage, validateImageDimensions, validateFileSize } = require('../utils/image-validator');

// Configuração do multer para armazenar em memória
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limite geral
        files: 1 // 1 arquivo por vez
    },
    fileFilter: (req, file, cb) => {
        // Verifica tipo MIME
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Apenas imagens são permitidas'), false);
        }
        cb(null, true);
    }
});

/**
 * Middleware para upload de imagem específica
 * @param {string} fieldName - Nome do campo no form
 * @param {string} imageType - Tipo da imagem (logo, banner, product, category)
 * @returns {Function} Middleware
 */
const uploadImage = (fieldName, imageType) => {
    return async (req, res, next) => {
        // Primeiro executa o multer
        upload.single(fieldName)(req, res, async (err) => {
            if (err) {
                if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return res.status(400).json({
                            success: false,
                            message: 'Arquivo muito grande'
                        });
                    }
                }
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }

            // Se não há arquivo, continua (pode ser opcional)
            if (!req.file) {
                return next();
            }

            try {
                // Valida tamanho do arquivo
                validateFileSize(req.file.size, imageType);

                // Valida se é imagem válida e obtém metadados
                const metadata = await validateImage(req.file.buffer);

                // Valida dimensões específicas do tipo
                validateImageDimensions(metadata, imageType);

                // Adiciona metadados ao request
                req.imageMetadata = metadata;
                req.imageType = imageType;

                next();
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
        });
    };
};

module.exports = {
    uploadImage
};