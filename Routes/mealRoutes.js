import express from "express";
import { createMeal, updateMeal } from "../Controllers/mealController.js";
import { getMeals } from "../Controllers/mealController.js";

const router = express.Router();

router.post("/", createMeal); // for creating meals
router.get ('/get', getMeals); // for viewing meals
router.put ("/:id", updateMeal);

export default router;