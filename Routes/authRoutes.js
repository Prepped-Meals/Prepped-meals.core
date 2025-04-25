// Routes/authRoutes.js
import express from "express";
import { loginCustomer, logoutAdmin } from "../Controllers/authController.js";

const router = express.Router();

router.post("/login", loginCustomer);
router.post("/logout/admin", logoutAdmin);  

export default router;
