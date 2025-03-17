import { Router } from "express";
import { getCustomers, createCustomer } from "../Controllers/customerController.js";

const router = Router();

router.get("/", getCustomers);
router.post("/", createCustomer);

export default router;