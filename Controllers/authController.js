// Controllers/authController.js

import Customer from "../Models/customerModel.js";
import bcrypt from "bcrypt";

export const loginCustomer = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user is admin
        if (username === "admin" && password === "admin@2002") {
            req.session.user = { role: "admin", username: "admin" };
            return res.status(200).json({ message: "Admin login successful", role: "admin" });
        }

        const customer = await Customer.findOne({ username });
        if (!customer) return res.status(401).json({ error: "Invalid username or password" });

        const isMatch = await bcrypt.compare(password, customer.password);
        if (!isMatch) return res.status(401).json({ error: "Invalid username or password" });

        const profilePic = customer.profile_pic && customer.profile_pic.trim() !== ""
            ? customer.profile_pic
            : "uploads/user.png";

        req.session.user = {
            _id: customer._id,
            cus_id: customer.cus_id,
            username: customer.username,
            f_name: customer.f_name,
            l_name: customer.l_name,
            email: customer.email,
            profile_pic: profilePic
        };

        res.status(200).json({ message: "Customer login successful", customer: req.session.user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin logout
export const logoutAdmin = (req, res) => {
    if (req.session.user && req.session.user.role === "admin") {
        req.session.destroy((err) => {
            if (err) return res.status(500).json({ error: "Admin logout failed" });
            res.clearCookie("connect.sid");
            res.status(200).json({ message: "Admin logged out successfully" });
        });
    } else {
        res.status(400).json({ error: "No admin session found" });
    }
};
