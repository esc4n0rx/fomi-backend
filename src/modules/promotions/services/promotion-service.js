// Serviço de promoções (ATUALIZADO com validação de planos)
const PromotionRepository = require('../repositories/promotion-repository');
const SubscriptionRepository = require('../../billing/repositories/subscription-repository');
const { hasReachedLimit } = require('../../../utils/plan-limits');

class PromotionService {
    constructor() {
        this.promotionRepository = new PromotionRepository();
        this.subscriptionRepository = new SubscriptionRepository();
    }

    /**
     * Lista promoções da loja
     * @param {string} storeId - ID da loja
     * @param {boolean} onlyActive - Buscar apenas ativas
     * @returns {Promise<Array>} Lista de promoções
     */
    async getStorePromotions(storeId, onlyActive = false) {
        return await this.promotionRepository.findByStoreId(storeId, onlyActive);
    }

    /**
     * Busca promoção por ID
     * @param {string} promotionId - ID da promoção
     * @param {string} storeId - ID da loja
     * @returns {Promise<Object>} Promoção
     */
    async getPromotionById(promotionId, storeId) {
        const promotion = await this.promotionRepository.findById(promotionId);
        
        if (!promotion) {
            throw new Error('Promoção não encontrada');
        }

        if (promotion.store_id !== storeId) {
            throw new Error('Acesso negado');
        }

        return promotion;
    }

    /**
     * Cria nova promoção
     * @param {string} storeId - ID da loja
     * @param {string} userId - ID do usuário (para buscar plano)
     * @param {Object} promotionData - Dados da promoção
     * @returns {Promise<Object>} Promoção criada
     */
    async createPromotion(storeId, userId, promotionData) {
        // Busca assinatura ativa do usuário para verificar plano
        const subscription = await this.subscriptionRepository.findActiveByUserId(userId);
        const userPlan = subscription?.plano || 'fomi_simples';

        // Verifica limite de promoções ativas para o plano
        const activePromotions = await this.promotionRepository.countActiveByStoreId(storeId);
        if (hasReachedLimit(userPlan, 'promotions_active', activePromotions)) {
            const limits = require('../../../utils/plan-limits').getPlanLimits(userPlan);
            const maxPromotions = limits.promotions_active;
            throw new Error(`Limite de promoções ativas atingido para o plano ${userPlan} (máximo ${maxPromotions})`);
        }

        // Verifica se produto grátis pertence à loja (se informado)
        if (promotionData.produto_gratis_id) {
            const productBelongs = await this.promotionRepository.productBelongsToStore(
                promotionData.produto_gratis_id,
                storeId
            );
            if (!productBelongs) {
                throw new Error('Produto grátis não encontrado ou não pertence à loja');
            }
        }

        const promotion = await this.promotionRepository.create({
            store_id: storeId,
            ...promotionData
        });

        return promotion;
    }

    /**
     * Atualiza promoção
     * @param {string} promotionId - ID da promoção
     * @param {string} storeId - ID da loja
     * @param {Object} promotionData - Dados para atualizar
     * @returns {Promise<Object>} Promoção atualizada
     */
    async updatePromotion(promotionId, storeId, promotionData) {
        // Verifica se promoção existe e pertence à loja
        await this.getPromotionById(promotionId, storeId);

        // Verifica se produto grátis pertence à loja (se informado)
        if (promotionData.produto_gratis_id) {
            const productBelongs = await this.promotionRepository.productBelongsToStore(
                promotionData.produto_gratis_id,
                storeId
            );
            if (!productBelongs) {
                throw new Error('Produto grátis não encontrado ou não pertence à loja');
            }
        }

        const updatedPromotion = await this.promotionRepository.update(promotionId, promotionData);
        return updatedPromotion;
    }

    /**
     * Desativa promoção
     * @param {string} promotionId - ID da promoção
     * @param {string} storeId - ID da loja
     * @returns {Promise<void>}
     */
    async deactivatePromotion(promotionId, storeId) {
        // Verifica se promoção existe e pertence à loja
        await this.getPromotionById(promotionId, storeId);

        await this.promotionRepository.deactivate(promotionId);
    }
}

module.exports = PromotionService;