// Serviço de lojas (ATUALIZADO com upload de imagens)
const StoreRepository = require('../repositories/store-repository');
const SubscriptionRepository = require('../../billing/repositories/subscription-repository');
const { generateSlug, generateUniqueSlug } = require('../../../utils/slug-generator');
const { hasReachedLimit, planHasFeature } = require('../../../utils/plan-limits');
const { uploadImage, deleteImage, extractPublicId } = require('../../../config/cloudinary');

class StoreService {
    constructor() {
        this.storeRepository = new StoreRepository();
        this.subscriptionRepository = new SubscriptionRepository();
    }

    /**
     * Cria nova loja
     * @param {string} userId - ID do usuário
     * @param {Object} storeData - Dados da loja
     * @returns {Promise<Object>} Loja criada
     */
    async createStore(userId, storeData) {
        // Busca assinatura ativa do usuário
        const subscription = await this.subscriptionRepository.findActiveByUserId(userId);
        const userPlan = subscription?.plano || 'fomi_simples';

        // Verifica limite de lojas para o plano
        const storeCount = await this.storeRepository.countByUserId(userId);
        if (hasReachedLimit(userPlan, 'stores', storeCount)) {
            throw new Error(`Limite de lojas atingido para o plano ${userPlan}`);
        }

        // Gera slug único
        const baseSlug = generateSlug(storeData.nome);
        const uniqueSlug = await generateUniqueSlug(
            baseSlug,
            (slug) => this.storeRepository.slugExists(slug)
        );

        // Formata CEP se fornecido
        let formattedCep = storeData.endereco_cep;
        if (formattedCep) {
            formattedCep = formattedCep.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2');
        }

        // Cria loja
        const store = await this.storeRepository.create({
            user_id: userId,
            subscription_id: subscription?.id || null,
            slug: uniqueSlug,
            endereco_cep: formattedCep,
            plano: userPlan,
            ...storeData
        });

        return store;
    }

    /**
     * Faz upload de logo da loja
     * @param {string} storeId - ID da loja
     * @param {string} userId - ID do usuário
     * @param {Buffer} imageBuffer - Buffer da imagem
     * @returns {Promise<Object>} Loja atualizada
     */
    async uploadLogo(storeId, userId, imageBuffer) {
        // Verifica se loja existe e pertence ao usuário
        const store = await this.getUserStore(storeId, userId);

        try {
            // Remove logo anterior se existir
            if (store.logo_url) {
                const oldPublicId = extractPublicId(store.logo_url);
                if (oldPublicId) {
                    await deleteImage(oldPublicId);
                }
            }

            // Faz upload da nova imagem
            const result = await uploadImage(imageBuffer, {
                folder: `stores/${storeId}/logo`,
                public_id: `logo_${Date.now()}`,
                transformation: [
                    { width: 300, height: 300, crop: 'fit' },
                    { quality: 'auto:good' }
                ]
            });

            // Atualiza loja com nova URL
            const updatedStore = await this.storeRepository.update(storeId, {
                logo_url: result.secure_url
            });

            return updatedStore;
        } catch (error) {
            console.error('Erro no upload do logo:', error);
            throw new Error(`Erro ao fazer upload do logo: ${error.message}`);
        }
    }

    /**
     * Faz upload de banner da loja
     * @param {string} storeId - ID da loja
     * @param {string} userId - ID do usuário
     * @param {Buffer} imageBuffer - Buffer da imagem
     * @returns {Promise<Object>} Loja atualizada
     */
    async uploadBanner(storeId, userId, imageBuffer) {
        // Verifica se loja existe e pertence ao usuário
        const store = await this.getUserStore(storeId, userId);

        // Verifica se usuário tem permissão para upload de banner
        const subscription = await this.subscriptionRepository.findActiveByUserId(userId);
        const userPlan = subscription?.plano || 'fomi_simples';
        
        if (!planHasFeature(userPlan, 'banner_upload')) {
            throw new Error('Upload de banner não disponível no seu plano');
        }

        try {
            // Remove banner anterior se existir
            if (store.banner_url) {
                const oldPublicId = extractPublicId(store.banner_url);
                if (oldPublicId) {
                    await deleteImage(oldPublicId);
                }
            }

            // Faz upload da nova imagem
            const result = await uploadImage(imageBuffer, {
                folder: `stores/${storeId}/banner`,
                public_id: `banner_${Date.now()}`,
                transformation: [
                    { width: 1200, height: 400, crop: 'fill', gravity: 'center' },
                    { quality: 'auto:good' }
                ]
            });

            // Atualiza loja com nova URL
            const updatedStore = await this.storeRepository.update(storeId, {
                banner_url: result.secure_url
            });

            return updatedStore;
        } catch (error) {
            console.error('Erro no upload do banner:', error);
            throw new Error(`Erro ao fazer upload do banner: ${error.message}`);
        }
    }

    /**
     * Atualiza personalização visual da loja
     * @param {string} storeId - ID da loja
     * @param {string} userId - ID do usuário
     * @param {Object} customizationData - Dados de personalização
     * @returns {Promise<Object>} Loja atualizada
     */
    async updateCustomization(storeId, userId, customizationData) {
        // Verifica se loja existe e pertence ao usuário
        await this.getUserStore(storeId, userId);

        // Verifica se usuário tem permissão para personalização
        const subscription = await this.subscriptionRepository.findActiveByUserId(userId);
        const userPlan = subscription?.plano || 'fomi_simples';

        // Verifica permissões específicas
        const allowedUpdates = {};

        if (planHasFeature(userPlan, 'custom_colors')) {
            if (customizationData.cor_primaria) allowedUpdates.cor_primaria = customizationData.cor_primaria;
            if (customizationData.cor_secundaria) allowedUpdates.cor_secundaria = customizationData.cor_secundaria;
            if (customizationData.cor_texto) allowedUpdates.cor_texto = customizationData.cor_texto;
            if (customizationData.cor_fundo) allowedUpdates.cor_fundo = customizationData.cor_fundo;
        }

        if (planHasFeature(userPlan, 'custom_fonts')) {
            if (customizationData.fonte_titulo) allowedUpdates.fonte_titulo = customizationData.fonte_titulo;
            if (customizationData.fonte_texto) allowedUpdates.fonte_texto = customizationData.fonte_texto;
        }

        if (Object.keys(allowedUpdates).length === 0) {
            throw new Error('Nenhuma personalização permitida para seu plano');
        }

        // Atualiza loja
        const updatedStore = await this.storeRepository.update(storeId, allowedUpdates);
        return updatedStore;
    }

    /**
     * Remove logo da loja
     * @param {string} storeId - ID da loja
     * @param {string} userId - ID do usuário
     * @returns {Promise<Object>} Loja atualizada
     */
    async removeLogo(storeId, userId) {
        const store = await this.getUserStore(storeId, userId);

        if (store.logo_url) {
            const publicId = extractPublicId(store.logo_url);
            if (publicId) {
                await deleteImage(publicId);
            }
        }

        return await this.storeRepository.update(storeId, { logo_url: null });
    }

    /**
     * Remove banner da loja
     * @param {string} storeId - ID da loja
     * @param {string} userId - ID do usuário
     * @returns {Promise<Object>} Loja atualizada
     */
    async removeBanner(storeId, userId) {
        const store = await this.getUserStore(storeId, userId);

        if (store.banner_url) {
            const publicId = extractPublicId(store.banner_url);
            if (publicId) {
                await deleteImage(publicId);
            }
        }

        return await this.storeRepository.update(storeId, { banner_url: null });
    }

    /**
     * Busca lojas do usuário
     * @param {string} userId - ID do usuário
     * @returns {Promise<Array>} Lista de lojas
     */
    async getUserStores(userId) {
        return await this.storeRepository.findByUserId(userId);
    }

    /**
     * Busca loja por ID (verificando propriedade)
     * @param {string} storeId - ID da loja
     * @param {string} userId - ID do usuário
     * @returns {Promise<Object>} Loja
     */
    async getUserStore(storeId, userId) {
        const store = await this.storeRepository.findById(storeId);
        
        if (!store) {
            throw new Error('Loja não encontrada');
        }

        if (store.user_id !== userId) {
            throw new Error('Acesso negado');
        }

        return store;
    }

    /**
     * Busca loja pública por slug
     * @param {string} slug - Slug da loja
     * @returns {Promise<Object>} Loja pública
     */
    async getPublicStore(slug) {
        const store = await this.storeRepository.findBySlug(slug);
        
        if (!store) {
            throw new Error('Loja não encontrada');
        }

        // Remove dados sensíveis para visualização pública
        const { user_id, plano, ...publicStore } = store;
        return publicStore;
    }

    /**
     * Atualiza loja
     * @param {string} storeId - ID da loja
     * @param {string} userId - ID do usuário
     * @param {Object} storeData - Dados para atualizar
     * @returns {Promise<Object>} Loja atualizada
     */
    async updateStore(storeId, userId, storeData) {
        // Verifica se loja existe e pertence ao usuário
        await this.getUserStore(storeId, userId);

        // Formata CEP se fornecido
        if (storeData.endereco_cep) {
            storeData.endereco_cep = storeData.endereco_cep
                .replace(/\D/g, '')
                .replace(/(\d{5})(\d{3})/, '$1-$2');
        }

        // Atualiza loja
        const updatedStore = await this.storeRepository.update(storeId, storeData);
        return updatedStore;
    }

    /**
     * Desativa loja
     * @param {string} storeId - ID da loja
     * @param {string} userId - ID do usuário
     * @returns {Promise<void>}
     */
    async deactivateStore(storeId, userId) {
        // Verifica se loja existe e pertence ao usuário
        await this.getUserStore(storeId, userId);

        // Desativa loja
        await this.storeRepository.deactivate(storeId);
    }
}

module.exports = StoreService;