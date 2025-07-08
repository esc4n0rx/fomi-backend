// Controller de cupons
const CouponService = require('../services/coupon-service');

class CouponController {
    constructor() {
        this.couponService = new CouponService();
    }

    /**
     * Lista cupons da loja
     */
    getStoreCoupons = async (req, res, next) => {
        try {
            const onlyActive = req.query.active === 'true';
            const coupons = await this.couponService.getStoreCoupons(
                req.store.id,
                onlyActive
            );
            
            res.json({
                success: true,
                data: { coupons }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Busca cupom específico
     */
    getCouponById = async (req, res, next) => {
        try {
            const coupon = await this.couponService.getCouponById(
                req.params.id,
                req.store.id
            );
            
            res.json({
                success: true,
                data: { coupon }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Valida cupom por código
     */
    validateCoupon = async (req, res, next) => {
        try {
            const { codigo, valor_pedido } = req.body;
            
            if (!codigo || valor_pedido === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Código e valor do pedido são obrigatórios'
                });
            }

            const coupon = await this.couponService.validateCoupon(
                codigo,
                req.store.id,
                valor_pedido
            );
            
            res.json({
                success: true,
                message: 'Cupom válido',
                data: { coupon }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Cria novo cupom
     */
    createCoupon = async (req, res, next) => {
        try {
            const coupon = await this.couponService.createCoupon(
                req.store.id,
                req.body
            );
            
            res.status(201).json({
                success: true,
                message: 'Cupom criado com sucesso',
                data: { coupon }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Atualiza cupom
     */
    updateCoupon = async (req, res, next) => {
        try {
            const coupon = await this.couponService.updateCoupon(
                req.params.id,
                req.store.id,
                req.body
            );
            
            res.json({
                success: true,
                message: 'Cupom atualizado com sucesso',
                data: { coupon }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Desativa cupom
     */
    deactivateCoupon = async (req, res, next) => {
        try {
            await this.couponService.deactivateCoupon(
                req.params.id,
                req.store.id
            );
            
            res.json({
                success: true,
                message: 'Cupom desativado com sucesso'
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = CouponController;