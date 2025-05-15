import express from "express";
import {
  addMealToCart,
  updateCart,
  deleteCart,
  deleteMealFromCart,
  getCartByCustomer,
} from "../Controllers/cartController.js";

const router = express.Router();

// Create or replace cart
router.post("/add-to-cart", addMealToCart);

// Update existing cart
router.put("/update-cart/:cart_id", updateCart);

// Delete entire cart
router.delete("/delete-cart/:cart_id", deleteCart);

// Delete specific meal from cart
router.delete("/:cart_id/meal/:meal_id", deleteMealFromCart);

// Get cart by customer ID
router.get("/customer/:customer_id", getCartByCustomer);

export default router;