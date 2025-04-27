import express from "express";
import {
  addMealToCart,
  updateCart,
  deleteCart
} from "../Controllers/cartController.js";

const router = express.Router();

// Create or replace cart
router.post("/add-to-cart", addMealToCart);

// Update existing cart
router.put("/update-cart/:cart_id", updateCart);

// Delete cart
router.delete("/delete-cart/:cart_id", deleteCart);

export default router;
