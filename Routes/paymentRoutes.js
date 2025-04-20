import express from "express";
import { addPayment } from "../Controllers/paymentController.js";

const router = express.Router();

router.post("/add-payment", addPayment); // Store card details

export default router;
