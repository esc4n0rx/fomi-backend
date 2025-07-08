// Definição dos status de pedidos e transições válidas
const ORDER_STATUS = {
    PENDENTE: 'pendente',           // Pedido criado, aguardando confirmação
    CONFIRMADO: 'confirmado',       // Lojista confirmou o pedido
    PREPARANDO: 'preparando',       // Pedido sendo preparado
    SAIU_ENTREGA: 'saiu_entrega',   // Saiu para entrega
    ENTREGUE: 'entregue',           // Pedido entregue
    CANCELADO: 'cancelado'          // Pedido cancelado
};

// Transições válidas entre status
const VALID_TRANSITIONS = {
    [ORDER_STATUS.PENDENTE]: [ORDER_STATUS.CONFIRMADO, ORDER_STATUS.CANCELADO],
    [ORDER_STATUS.CONFIRMADO]: [ORDER_STATUS.PREPARANDO, ORDER_STATUS.CANCELADO],
    [ORDER_STATUS.PREPARANDO]: [ORDER_STATUS.SAIU_ENTREGA, ORDER_STATUS.CANCELADO],
    [ORDER_STATUS.SAIU_ENTREGA]: [ORDER_STATUS.ENTREGUE, ORDER_STATUS.CANCELADO],
    [ORDER_STATUS.ENTREGUE]: [], // Status final
    [ORDER_STATUS.CANCELADO]: [] // Status final
};

// Status que permitem cancelamento
const CANCELABLE_STATUS = [
    ORDER_STATUS.PENDENTE,
    ORDER_STATUS.CONFIRMADO,
    ORDER_STATUS.PREPARANDO,
    ORDER_STATUS.SAIU_ENTREGA
];

/**
 * Verifica se transição de status é válida
 * @param {string} currentStatus - Status atual
 * @param {string} newStatus - Novo status
 * @returns {boolean} True se transição é válida
 */
const isValidTransition = (currentStatus, newStatus) => {
    const validNext = VALID_TRANSITIONS[currentStatus] || [];
    return validNext.includes(newStatus);
};

/**
 * Verifica se pedido pode ser cancelado
 * @param {string} status - Status atual do pedido
 * @returns {boolean} True se pode ser cancelado
 */
const canBeCanceled = (status) => {
    return CANCELABLE_STATUS.includes(status);
};

/**
 * Obtém timestamp field baseado no status
 * @param {string} status - Status do pedido
 * @returns {string|null} Nome do campo timestamp
 */
const getTimestampField = (status) => {
    const mapping = {
        [ORDER_STATUS.CONFIRMADO]: 'confirmado_em',
        [ORDER_STATUS.PREPARANDO]: 'preparando_em',
        [ORDER_STATUS.SAIU_ENTREGA]: 'saiu_entrega_em',
        [ORDER_STATUS.ENTREGUE]: 'entregue_em',
        [ORDER_STATUS.CANCELADO]: 'cancelado_em'
    };
    
    return mapping[status] || null;
};

/**
 * Obtém próximos status possíveis
 * @param {string} currentStatus - Status atual
 * @returns {Array} Array de próximos status possíveis
 */
const getNextPossibleStatus = (currentStatus) => {
    return VALID_TRANSITIONS[currentStatus] || [];
};

module.exports = {
    ORDER_STATUS,
    VALID_TRANSITIONS,
    CANCELABLE_STATUS,
    isValidTransition,
    canBeCanceled,
    getTimestampField,
    getNextPossibleStatus
};