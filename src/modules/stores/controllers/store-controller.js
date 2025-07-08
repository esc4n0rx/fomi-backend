// Controller de lojas
const StoreService = require('../services/store-service');

class StoreController {
    constructor() {
        this.storeService = new StoreService();
    }

    /**
     * Cria nova loja
     */
    createStore = async (req, res, next) => {
        try {
            const store = await this.storeService.createStore(req.user.id, req.body);
            
            res.status(201).json({
                success: true,
                message: 'Loja criada com sucesso',
                data: { store }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Lista lojas do usuário
     */
    getUserStores = async (req, res, next) => {
        try {
            const stores = await this.storeService.getUserStores(req.user.id);
            
            res.json({
                success: true,
                data: { stores }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Busca loja específica do usuário
     */
    getUserStore = async (req, res, next) => {
        try {
            const store = await this.storeService.getUserStore(req.params.id, req.user.id);
            
            res.json({
                success: true,
                data: { store }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Busca loja pública por slug
     */
    getPublicStore = async (req, res, next) => {
        try {
            const store = await this.storeService.getPublicStore(req.params.slug);
            
            res.json({
                success: true,
                data: { store }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Atualiza loja
     */
    updateStore = async (req, res, next) => {
        try {
            const store = await this.storeService.updateStore(
                req.params.id,
                req.user.id,
                req.body
            );
            
            res.json({
                success: true,
                message: 'Loja atualizada com sucesso',
                data: { store }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Desativa loja
     */
    deactivateStore = async (req, res, next) => {
        try {
            await this.storeService.deactivateStore(req.params.id, req.user.id);
            
            res.json({
                success: true,
                message: 'Loja desativada com sucesso'
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = StoreController;