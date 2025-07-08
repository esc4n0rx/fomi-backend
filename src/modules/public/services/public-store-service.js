// Serviço para dados públicos da loja
const StoreRepository = require('../../stores/repositories/store-repository');
const ProductRepository = require('../../products/repositories/product-repository');
const CategoryRepository = require('../../categories/repositories/category-repository');
const PromotionRepository = require('../../promotions/repositories/promotion-repository');

class PublicStoreService {
    constructor() {
        this.storeRepository = new StoreRepository();
        this.productRepository = new ProductRepository();
        this.categoryRepository = new CategoryRepository();
        this.promotionRepository = new PromotionRepository();
    }

    /**
     * Busca dados públicos da loja
     * @param {string} slug - Slug da loja
     * @returns {Promise<Object>} Dados públicos da loja
     */
    async getPublicStore(slug) {
        const store = await this.storeRepository.findBySlug(slug);
        
        if (!store) {
            throw new Error('Loja não encontrada');
        }

        // Remove dados sensíveis para visualização pública
        const { user_id, plano, subscription_id, ativo, created_at, updated_at, ...publicStore } = store;
        
        return publicStore;
    }

    /**
     * Busca produtos públicos da loja
     * @param {string} storeId - ID da loja
     * @param {Object} filters - Filtros opcionais
     * @returns {Promise<Array>} Lista de produtos disponíveis
     */
    async getPublicProducts(storeId, filters = {}) {
        // Força filtro para produtos disponíveis
        const publicFilters = {
            ...filters,
            disponivel: true
        };

        const products = await this.productRepository.findByStoreId(storeId, publicFilters);
        
        // Remove dados desnecessários para público
        return products.map(product => {
            const { ativo, created_at, updated_at, ...publicProduct } = product;
            return publicProduct;
        });
    }

    /**
     * Busca categorias públicas da loja
     * @param {string} storeId - ID da loja
     * @returns {Promise<Array>} Lista de categorias
     */
    async getPublicCategories(storeId) {
        const categories = await this.categoryRepository.findByStoreId(storeId);
        
        // Remove dados desnecessários para público
        return categories.map(category => {
            const { ativo, created_at, updated_at, ...publicCategory } = category;
            return publicCategory;
        });
    }

    /**
     * Busca promoções ativas da loja
     * @param {string} storeId - ID da loja
     * @returns {Promise<Array>} Lista de promoções ativas
     */
    async getActivePromotions(storeId) {
        return await this.promotionRepository.findByStoreId(storeId, true);
    }

    /**
     * Busca produto específico
     * @param {string} productId - ID do produto
     * @param {string} storeId - ID da loja
     * @returns {Promise<Object>} Produto
     */
    async getPublicProduct(productId, storeId) {
        const product = await this.productRepository.findById(productId);
        
        if (!product) {
            throw new Error('Produto não encontrado');
        }

        if (product.store_id !== storeId) {
            throw new Error('Produto não pertence à loja');
        }

        if (!product.disponivel) {
            throw new Error('Produto não disponível');
        }

        // Remove dados desnecessários
        const { ativo, created_at, updated_at, ...publicProduct } = product;
        return publicProduct;
    }

    /**
     * Verifica se loja está aceitando pedidos
     * @param {string} storeId - ID da loja
     * @returns {Promise<Object>} Status da loja
     */
    async getStoreStatus(storeId) {
        const store = await this.storeRepository.findById(storeId);
        
        if (!store) {
            throw new Error('Loja não encontrada');
        }

        const config = store.configuracoes || {};
        const horarios = store.horario_funcionamento || {};
        
        // Verifica se está no horário de funcionamento
        const agora = new Date();
        const diaSemana = this.getDayOfWeek(agora);
        const horaAtual = agora.getHours() * 100 + agora.getMinutes(); // HHMM format
        
        const horarioHoje = horarios[diaSemana];
        let dentroHorario = true;
        
        if (horarioHoje && !horarioHoje.aberto) {
            dentroHorario = false;
        } else if (horarioHoje && horarioHoje.aberto) {
            const abertura = this.parseTime(horarioHoje.abertura);
            const fechamento = this.parseTime(horarioHoje.fechamento);
            dentroHorario = horaAtual >= abertura && horaAtual <= fechamento;
        }

        return {
            aceita_pedidos: config.aceita_pedidos && dentroHorario,
            dentro_horario: dentroHorario,
            tempo_preparo_min: config.tempo_preparo_min || 30,
            valor_minimo_pedido: config.valor_minimo_pedido || 0,
            taxa_entrega: config.taxa_entrega || 0,
            raio_entrega_km: config.raio_entrega_km || 5,
            horario_hoje: horarioHoje
        };
    }

    /**
     * Obtém dia da semana em português
     * @private
     */
    getDayOfWeek(date) {
        const days = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
        return days[date.getDay()];
    }

    /**
     * Converte horário string para número
     * @private
     */
    parseTime(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 100 + minutes;
    }
}

module.exports = PublicStoreService;