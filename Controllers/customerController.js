import { customerDTO } from "../Dto/customerDTOs/customerDTOs.js";
import Customer from "../Models/customerModel.js";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";
import Order from "../Models/orderModel.js";
import Payment from "../Models/paymentModel.js";
import CardDetails from "../Models/paymentcardModel.js";
import Cart from "../Models/cartModel.js";
import Feedback from "../Models/feedbackModel.js"; 



// Password hashing
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

// Multer config for profile picture uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage }).single('profile_pic');

// Register
export const createCustomer = async (req, res) => {
    try {
        const { error, value } = customerDTO.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { confirmPassword, ...customerData } = value;
        customerData.password = await hashPassword(customerData.password);

        // Default profile pic if not provided
        if (!customerData.profile_pic || customerData.profile_pic.trim() === "") {
            customerData.profile_pic = "uploads/user.png";
        }

        const customer = new Customer(customerData);
        await customer.save();

        req.session.user = {
            _id: customer._id,
            cus_id: customer.cus_id,
            username: customer.username,
            f_name: customer.f_name,
            l_name: customer.l_name,
            email: customer.email,
            profile_pic: customer.profile_pic
        };

         
        res.status(201).json({ message: "Customer registered and logged in", customer: req.session.user });
    } catch (error) {
        if (error.code === 11000) {
            res.status(409).json({ error: "Username or email already exists" });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};



// Logout
export const logoutCustomer = (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: "Logout failed" });
        res.status(200).json({ message: "Logged out successfully" });
    });
};

// Get logged-in customer
export const getLoggedInCustomer = async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Not authenticated" });
    }

    try {
        const customer = await Customer.findOne({ cus_id: req.session.user.cus_id }).lean();
        if (!customer) return res.status(404).json({ error: "Customer not found" });

        if (!customer.profile_pic || customer.profile_pic.trim() === "") {
            customer.profile_pic = "uploads/user.png";
        }

        res.status(200).json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//update customer details

export const updateCustomer = async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Not authenticated" });
    }

    const { f_name, l_name, contact_no, email, username } = req.body;

    try {
        const existingUser = await Customer.findOne({ username });
        if (existingUser && existingUser.cus_id !== req.session.user.cus_id) {
            return res.status(409).json({ error: "Username already taken" });
        }

        const customer = await Customer.findOneAndUpdate(
            { cus_id: req.session.user.cus_id },
            { f_name, l_name, contact_no, email, username },
            { new: true }
        );

        if (!customer) return res.status(404).json({ error: "Customer not found" });

        // Update session if username is changed
        req.session.user.username = customer.username;

        res.status(200).json({ message: "Profile updated", customer });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


//  Update profile picture
export const updateProfilePicture = async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Not authenticated" });
    }

    upload(req, res, async (err) => {
        if (err || !req.file) {
            return res.status(500).json({ error: "Error uploading file" });
        }

        try {
            const profilePath = "/" + req.file.path.replace(/\\/g, "/");

            const customer = await Customer.findOneAndUpdate(
                { cus_id: req.session.user.cus_id },
                { profile_pic: profilePath },
                { new: true }
            );

            if (!customer) {
                return res.status(404).json({ error: "Customer not found" });
            }

            //  Update session with new profile picture
            req.session.user.profile_pic = profilePath;

            res.status(200).json({ message: "Profile picture updated", customer });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
};

// Delete customer
export const deleteCustomer = async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: "Not authenticated" });

    try {
        const customerId = req.session.user._id;

        // Find orders and extract payment IDs
        const orders = await Order.find({ customer: customerId });
        const paymentIds = orders.map(order => order.payment);

        // Delete all related documents
        await Order.deleteMany({ customer: customerId });
        await Payment.deleteMany({
            $or: [
                { _id: { $in: paymentIds } },
                { customer: customerId }
            ]
        });
        await CardDetails.deleteMany({ customer: customerId });
        await Cart.deleteMany({ customer: customerId });
        await Feedback.deleteMany({ customer: customerId }); 

        // Delete the customer
        const result = await Customer.findOneAndDelete({ _id: customerId });
        if (!result) return res.status(404).json({ error: "Customer not found" });

        req.session.destroy(() => {
            res.status(200).json({ message: "Customer account and all related data deleted successfully." });
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Reset password
export const resetPassword = async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Not authenticated" });
    }

    const { currentPassword, newPassword } = req.body;

    try {
        const customer = await Customer.findOne({ cus_id: req.session.user.cus_id });

        if (!customer) {
            return res.status(404).json({ error: "Customer not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, customer.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Current password is incorrect" });
        }

        const hashedNewPassword = await hashPassword(newPassword);
        customer.password = hashedNewPassword;
        await customer.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all customers (admin use)

export const getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find({}, 'f_name l_name email username');
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
