// Routes/authRoutes.js
import express from "express";
import { loginCustomer } from "../Controllers/authController.js";

const router = express.Router();

router.post("/login", loginCustomer);

export default router;
