// Repositório de itens do pedido
const { supabase } = require('../../../config/database');

class OrderItemRepository {
    /**
     * Cria itens do pedido em lote
     * @param {Array} items - Array de itens
     * @returns {Promise<Array>} Itens criados
     */
    async createMany(items) {
        const { data, error } = await supabase
            .from('fomi_order_items')
            .insert(items)
            .select(`
                *,
                product:fomi_products(id, nome, disponivel)
            `);

        if (error) {
            throw new Error(`Erro ao criar itens do pedido: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Busca itens por pedido
     * @param {string} orderId - ID do pedido
     * @returns {Promise<Array>} Lista de itens
     */
    async findByOrderId(orderId) {
        const { data, error } = await supabase
            .from('fomi_order_items')
            .select(`
                *,
                product:fomi_products(id, nome, disponivel, imagem_url)
            `)
            .eq('order_id', orderId)
            .order('created_at', { ascending: true });

        if (error) {
            throw new Error(`Erro ao buscar itens do pedido: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Atualiza item do pedido
     * @param {string} id - ID do item
     * @param {Object} itemData - Dados para atualizar
     * @returns {Promise<Object>} Item atualizado
     */
    async update(id, itemData) {
        const { data, error } = await supabase
            .from('fomi_order_items')
            .update(itemData)
            .eq('id', id)
            .select(`
                *,
                product:fomi_products(id, nome, disponivel)
            `)
            .single();

        if (error) {
            throw new Error(`Erro ao atualizar item: ${error.message}`);
        }

        return data;
    }

    /**
     * Remove item do pedido
     * @param {string} id - ID do item
     * @returns {Promise<void>}
     */
    async delete(id) {
        const { error } = await supabase
            .from('fomi_order_items')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Erro ao remover item: ${error.message}`);
        }
    }
}

module.exports = OrderItemRepository;