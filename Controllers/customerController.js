import { customerDTO } from "../Dto/customerDTOs/customerDTOs.js";
import Customer from '../Models/customerModel.js';
import bcrypt from 'bcrypt';

// Function to hash passwords
const hashPassword = async (password) => {
    const saltRounds = 10; // Number of salt rounds
    return await bcrypt.hash(password, saltRounds); // Hash the password
};

// Customer registration
export const createCustomer = async (req, res) => {
    try {
        const { error, value } = customerDTO.validate(req.body);
        if (error) {
            console.log('Validation error:', error.details);
            return res.status(400).json({ error: error.details[0].message });
        }

        const { confirmPassword, ...customerData } = value;

        // Hash the password before saving
        const hashedPassword = await hashPassword(customerData.password);
        customerData.password = hashedPassword;

        const customer = new Customer(customerData);
        await customer.save();

        res.status(201).json({ message: "Customer details saved successfully", customer });
    } catch (error) {
        if (error.code === 11000) {
            res.status(500).json({ error: error.message });
        }
    }
};

// Login customer
export const loginCustomer = async (req, res) => {
    const { username, password } = req.body;
    try {
        const customer = await Customer.findOne({ username });
        if (!customer) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        // Compare the password
        const isMatch = await bcrypt.compare(password, customer.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        // Set session data after successful login
        req.session.user = {
            cus_id: customer.cus_id,
            username: customer.username,
            f_name: customer.f_name,
            l_name: customer.l_name,
            email: customer.email,
        };

        res.status(200).json({
            message: "Login successful",
            customer: {
                cus_id: customer.cus_id,
                username: customer.username,
                f_name: customer.f_name,
                l_name: customer.l_name,
                email: customer.email,
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Logout function
export const logoutCustomer = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Logout failed" });
        }
        res.status(200).json({ message: "Logged out successfully" });
    });
};

// Get all customers
export const getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find(); // Fetch all customers from the database
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
