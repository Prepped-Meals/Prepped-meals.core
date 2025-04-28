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


export default router;
