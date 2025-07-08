// Controller de clientes
const CustomerService = require('../services/customer-service');

class CustomerController {
    constructor() {
        this.customerService = new CustomerService();
    }

    /**
     * Busca cliente por ID
     */
    getCustomerById = async (req, res, next) => {
        try {
            const customer = await this.customerService.getCustomerById(req.params.id);
            
            res.json({
                success: true,
                data: { customer }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Atualiza dados do cliente
     */
    updateCustomer = async (req, res, next) => {
        try {
            const customer = await this.customerService.updateCustomer(
                req.params.id,
                req.body
            );
            
            res.json({
                success: true,
                message: 'Cliente atualizado com sucesso',
                data: { customer }
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = CustomerController;