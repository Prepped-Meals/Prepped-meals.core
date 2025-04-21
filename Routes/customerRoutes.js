import { Router } from "express";
import { getCustomers, createCustomer, loginCustomer } from "../Controllers/customerController.js";

const router = Router();

// Get all customers
router.get("/", getCustomers);

// Register a new customer
router.post("/register", createCustomer);

// Login a customer
router.post("/login", loginCustomer);

export default router;
