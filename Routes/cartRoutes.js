import express from "express";
import { addMealToCart } from "../Controllers/cartController.js";

const router = express.Router();

router.post("/add-to-cart", addMealToCart);

export default router;
