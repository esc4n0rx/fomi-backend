// Serviço de clientes
const CustomerRepository = require('../repositories/customer-repository');

class CustomerService {
    constructor() {
        this.customerRepository = new CustomerRepository();
    }

    /**
     * Busca ou cria cliente por telefone
     * @param {Object} customerData - Dados do cliente
     * @returns {Promise<Object>} Cliente
     */
    async findOrCreateByPhone(customerData) {
        // Remove formatação do telefone
        const cleanPhone = customerData.telefone.replace(/\D/g, '');
        
        // Busca cliente existente
        let customer = await this.customerRepository.findByPhone(cleanPhone);
        
        if (!customer) {
            // Cria novo cliente
            customer = await this.customerRepository.create({
                ...customerData,
                telefone: cleanPhone
            });
        } else {
            // Atualiza dados do cliente com as informações mais recentes
            customer = await this.customerRepository.update(customer.id, {
                nome: customerData.nome,
                email: customerData.email || customer.email,
                endereco_cep: customerData.endereco_cep || customer.endereco_cep,
                endereco_rua: customerData.endereco_rua || customer.endereco_rua,
                endereco_numero: customerData.endereco_numero || customer.endereco_numero,
                endereco_complemento: customerData.endereco_complemento || customer.endereco_complemento,
                endereco_bairro: customerData.endereco_bairro || customer.endereco_bairro,
                endereco_cidade: customerData.endereco_cidade || customer.endereco_cidade,
                endereco_estado: customerData.endereco_estado || customer.endereco_estado,
                endereco_referencia: customerData.endereco_referencia || customer.endereco_referencia
            });
        }

        return customer;
    }

    /**
     * Busca cliente por ID
     * @param {string} customerId - ID do cliente
     * @returns {Promise<Object>} Cliente
     */
    async getCustomerById(customerId) {
        const customer = await this.customerRepository.findById(customerId);
        
        if (!customer) {
            throw new Error('Cliente não encontrado');
        }

        return customer;
    }

    /**
     * Atualiza dados do cliente
     * @param {string} customerId - ID do cliente
     * @param {Object} customerData - Dados para atualizar
     * @returns {Promise<Object>} Cliente atualizado
     */
    async updateCustomer(customerId, customerData) {
        const customer = await this.getCustomerById(customerId);
        
        const updatedCustomer = await this.customerRepository.update(customerId, {
            ...customerData,
            telefone: customerData.telefone ? customerData.telefone.replace(/\D/g, '') : customer.telefone
        });

        return updatedCustomer;
    }
}

module.exports = CustomerService;