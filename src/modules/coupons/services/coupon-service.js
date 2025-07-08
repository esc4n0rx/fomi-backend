// Serviço de cupons
const CouponRepository = require('../repositories/coupon-repository');

class CouponService {
    constructor() {
        this.couponRepository = new CouponRepository();
    }

    /**
     * Lista cupons da loja
     * @param {string} storeId - ID da loja
     * @param {boolean} onlyActive - Buscar apenas ativos
     * @returns {Promise<Array>} Lista de cupons
     */
    async getStoreCoupons(storeId, onlyActive = false) {
        return await this.couponRepository.findByStoreId(storeId, onlyActive);
    }

    /**
     * Busca cupom por ID
     * @param {string} couponId - ID do cupom
     * @param {string} storeId - ID da loja
     * @returns {Promise<Object>} Cupom
     */
    async getCouponById(couponId, storeId) {
        const coupon = await this.couponRepository.findById(couponId);
        
        if (!coupon) {
            throw new Error('Cupom não encontrado');
        }

        if (coupon.store_id !== storeId) {
            throw new Error('Acesso negado');
        }

        return coupon;
    }

    /**
     * Valida cupom por código
     * @param {string} codigo - Código do cupom
     * @param {string} storeId - ID da loja
     * @param {number} valorPedido - Valor do pedido
     * @returns {Promise<Object>} Cupom validado
     */
    async validateCoupon(codigo, storeId, valorPedido) {
        const coupon = await this.couponRepository.findByCode(codigo, storeId);
        
        if (!coupon) {
            throw new Error('Cupom não encontrado');
        }

        const today = new Date().toISOString().split('T')[0];
        
        // Verifica se cupom está ativo
        if (!coupon.ativo) {
            throw new Error('Cupom inativo');
        }

        // Verifica se cupom está no período válido
        if (coupon.data_inicio > today || coupon.data_fim < today) {
            throw new Error('Cupom fora do período válido');
        }

        // Verifica valor mínimo do pedido
        if (valorPedido < coupon.valor_minimo_pedido) {
            throw new Error(`Valor mínimo do pedido é R$ ${coupon.valor_minimo_pedido.toFixed(2)}`);
        }

        // Verifica limite de uso
        if (coupon.limite_uso && coupon.total_usado >= coupon.limite_uso) {
            throw new Error('Limite de uso do cupom atingido');
        }

        return coupon;
    }

    /**
     * Cria novo cupom
     * @param {string} storeId - ID da loja
     * @param {Object} couponData - Dados do cupom
     * @returns {Promise<Object>} Cupom criado
     */
    async createCoupon(storeId, couponData) {
        // Verifica se código já existe na loja
        const existingCoupon = await this.couponRepository.findByCode(couponData.codigo, storeId);
        if (existingCoupon) {
            throw new Error('Código de cupom já existe nesta loja');
        }

        const coupon = await this.couponRepository.create({
            store_id: storeId,
            ...couponData
        });

        return coupon;
    }

    /**
     * Atualiza cupom
     * @param {string} couponId - ID do cupom
     * @param {string} storeId - ID da loja
     * @param {Object} couponData - Dados para atualizar
     * @returns {Promise<Object>} Cupom atualizado
     */
    async updateCoupon(couponId, storeId, couponData) {
        // Verifica se cupom existe e pertence à loja
        const existingCoupon = await this.getCouponById(couponId, storeId);

        // Verifica se novo código já existe (se foi alterado)
        if (couponData.codigo && couponData.codigo.toUpperCase() !== existingCoupon.codigo) {
            const codeExists = await this.couponRepository.findByCode(couponData.codigo, storeId);
            if (codeExists) {
                throw new Error('Código de cupom já existe nesta loja');
            }
        }

        const updatedCoupon = await this.couponRepository.update(couponId, couponData);
        return updatedCoupon;
    }

    /**
     * Desativa cupom
     * @param {string} couponId - ID do cupom
     * @param {string} storeId - ID da loja
     * @returns {Promise<void>}
     */
    async deactivateCoupon(couponId, storeId) {
        // Verifica se cupom existe e pertence à loja
        await this.getCouponById(couponId, storeId);

        await this.couponRepository.deactivate(couponId);
    }

    /**
     * Usar cupom (incrementar contador)
     * @param {string} couponId - ID do cupom
     * @returns {Promise<void>}
     */
    async useCoupon(couponId) {
        await this.couponRepository.incrementUsage(couponId);
    }
}

module.exports = CouponService;