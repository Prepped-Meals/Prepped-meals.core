import express from "express";
import { createCardDetails } from "../Controllers/paymentCardController.js";
 
const router = express.Router();
 
router.post("/add-payment-card", createCardDetails); // Store card details
 
export default router;