import Customer from '../Models/customerModel.js';

export const insertCustomerDetails = async (customerData) => {
    const customer = new Customer (customerData);
    await customer.save();
    return customer;
};