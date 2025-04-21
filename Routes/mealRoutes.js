import express from "express";
import { createMeal } from "../Controllers/mealController.js";
import { getMeals } from "../Controllers/mealController.js";

const router = express.Router();

router.post("/", createMeal);
router.get ('/get', getMeals);

export default router;