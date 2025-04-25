import express from "express";
import {
  createCardDetails,
  updateCardDetails,
  deleteCardDetails,
  getCardDetailsById 
} from "../Controllers/paymentCardController.js";

const router = express.Router();

// Create
router.post("/add-payment-card", createCardDetails);

// Update
router.put("/update-payment-card/:id", updateCardDetails);

// Delete
router.delete("/delete-payment-card/:id", deleteCardDetails);

//Get
router.get("/get-payment-card/:cardId", getCardDetailsById);

export default router;

