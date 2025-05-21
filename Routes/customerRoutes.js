import { loginCustomer } from "../Controllers/authController.js";
import { Router } from "express";
import {
    getCustomers,
    createCustomer,
    logoutCustomer,
    getLoggedInCustomer,
    updateCustomer,
    deleteCustomer,
    updateProfilePicture,
    resetPassword 
} from "../Controllers/customerController.js";
import Order from "../Models/orderModel.js";


const router = Router();

router.get('/', getCustomers);
router.post("/register", createCustomer);
router.post("/login", loginCustomer);
router.post("/logout", logoutCustomer);
router.get("/me", getLoggedInCustomer);
router.put("/me", updateCustomer);
router.delete("/me", deleteCustomer);
router.put("/me/profile-pic", updateProfilePicture);
router.post("/reset-password", resetPassword); 
router.get('/me/pending-orders', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: "Not authenticated" });

    try {
        const customerId = req.session.user._id;
        const pendingOrders = await Order.find({ 
            customer: customerId, 
            order_status: { $in: ['Pending'] } 
        });

        res.status(200).json({ 
            hasPendingOrders: pendingOrders.length > 0,
            count: pendingOrders.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


export default router;
