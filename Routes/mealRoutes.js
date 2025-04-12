import express from "express";
import { createMeal } from "../Controllers/mealController.js";

const router = express.Router();

router.post("/", createMeal);

export default router;