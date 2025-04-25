import express from "express";
import { createMeal, updateMeal} from "../Controllers/mealController.js";
import { getMeals, deleteMeal } from "../Controllers/mealController.js";

const router = express.Router();

router.post("/", createMeal); // for creating meals
router.get ('/get', getMeals); // for viewing meals
router.put ("/:id", updateMeal); // updating meals
router.delete ("/:id", deleteMeal); // for deleting meals

export default router;