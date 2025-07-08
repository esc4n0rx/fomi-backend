// Repositório de pedidos
const { supabase } = require('../../../config/database');

class OrderRepository {
    /**
     * Busca pedidos por loja com filtros
     * @param {string} storeId - ID da loja
     * @param {Object} filters - Filtros de busca
     * @param {number} page - Página
     * @param {number} limit - Limite por página
     * @returns {Promise<Object>} Resultado paginado
     */
    async findByStoreId(storeId, filters = {}, page = 1, limit = 20) {
        let query = supabase
            .from('fomi_orders')
            .select(`
                *,
                customer:fomi_customers(id, nome, telefone)
            `, { count: 'exact' })
            .eq('store_id', storeId);

        // Aplica filtros
        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        if (filters.data_inicio) {
            query = query.gte('pedido_em', filters.data_inicio);
        }

        if (filters.data_fim) {
            query = query.lte('pedido_em', filters.data_fim);
        }

        // Paginação
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        // Ordenação
        query = query.order('pedido_em', { ascending: false });

        const { data, error, count } = await query;

        if (error) {
            throw new Error(`Erro ao buscar pedidos: ${error.message}`);
        }

        return {
            orders: data || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                pages: Math.ceil((count || 0) / limit)
            }
        };
    }

    /**
     * Busca pedido por ID
     * @param {string} id - ID do pedido
     * @returns {Promise<Object|null>} Pedido ou null
     */
    async findById(id) {
        const { data, error } = await supabase
            .from('fomi_orders')
            .select(`
                *,
                customer:fomi_customers(id, nome, telefone, email),
                store:fomi_stores(id, nome, telefone, whatsapp),
                items:fomi_order_items(
                    *,
                    product:fomi_products(id, nome, disponivel)
                )
            `)
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error(`Erro ao buscar pedido: ${error.message}`);
        }

        return data;
    }

    /**
     * Busca pedido por número
     * @param {string} numerosPedido - Número do pedido
     * @returns {Promise<Object|null>} Pedido ou null
     */
    async findByNumber(numeroPedido) {
        const { data, error } = await supabase
            .from('fomi_orders')
            .select(`
                *,
                customer:fomi_customers(id, nome, telefone),
                store:fomi_stores(id, nome, slug),
                items:fomi_order_items(
                    *,
                    product:fomi_products(id, nome)
                )
            `)
            .eq('numero_pedido', numeroPedido)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error(`Erro ao buscar pedido: ${error.message}`);
        }

        return data;
    }

    /**
     * Cria novo pedido
     * @param {Object} orderData - Dados do pedido
     * @returns {Promise<Object>} Pedido criado
     */
    async create(orderData) {
        const { data, error } = await supabase
            .from('fomi_orders')
            .insert([orderData])
            .select(`
                *,
                customer:fomi_customers(id, nome, telefone),
                store:fomi_stores(id, nome, telefone, whatsapp)
            `)
            .single();

        if (error) {
            throw new Error(`Erro ao criar pedido: ${error.message}`);
        }

        return data;
    }

    /**
     * Atualiza pedido
     * @param {string} id - ID do pedido
     * @param {Object} orderData - Dados para atualizar
     * @returns {Promise<Object>} Pedido atualizado
     */
    async update(id, orderData) {
        const { data, error } = await supabase
            .from('fomi_orders')
            .update(orderData)
            .eq('id', id)
            .select(`
                *,
                customer:fomi_customers(id, nome, telefone),
                store:fomi_stores(id, nome, telefone, whatsapp),
                items:fomi_order_items(
                    *,
                    product:fomi_products(id, nome)
                )
            `)
            .single();

        if (error) {
            throw new Error(`Erro ao atualizar pedido: ${error.message}`);
        }

        return data;
    }

    /**
     * Busca estatísticas de pedidos da loja
     * @param {string} storeId - ID da loja
     * @param {Object} dateRange - Range de datas
     * @returns {Promise<Object>} Estatísticas
     */
    async getStatistics(storeId, dateRange = {}) {
        let query = supabase
            .from('fomi_orders')
            .select('status, total, pedido_em')
            .eq('store_id', storeId);

        if (dateRange.start) {
            query = query.gte('pedido_em', dateRange.start);
        }

        if (dateRange.end) {
            query = query.lte('pedido_em', dateRange.end);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
        }

        return this._calculateStatistics(data || []);
    }

    /**
     * Calcula estatísticas dos pedidos
     * @private
     */
    _calculateStatistics(orders) {
        const stats = {
            total_pedidos: orders.length,
            total_vendas: 0,
            pedidos_por_status: {},
            ticket_medio: 0
        };

        orders.forEach(order => {
            stats.total_vendas += parseFloat(order.total || 0);
            stats.pedidos_por_status[order.status] = (stats.pedidos_por_status[order.status] || 0) + 1;
        });

        stats.ticket_medio = stats.total_pedidos > 0 ? stats.total_vendas / stats.total_pedidos : 0;

        return stats;
    }
}

module.exports = OrderRepository;