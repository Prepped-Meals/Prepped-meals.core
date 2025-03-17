import Customer from "../Models/customerModel.js";

// Get all customers
export async function getCustomers(req, res) {
    try {
        const customers = await find();
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ message: "Error fetching customers" });
    }
}

// Create a new customer
export async function createCustomer(req, res) {
    const { cus_id, username, f_name, l_name, email, password, contact_no } = req.body;

    try {
        const newCustomer = new Customer({ cus_id, username, f_name, l_name, email, password, contact_no });
        await newCustomer.save();
        res.status(201).json(newCustomer);
    } catch (error) {
        res.status(500).json({ message: "Error creating customer" });
    }
}