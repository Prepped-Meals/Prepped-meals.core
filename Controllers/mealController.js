import { mealDTO } from "../Dto/MealsDTOs/aMeals.js";
import Meal from '../Models/mealModel.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Multer config for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage }).single('meal_image');

//create meal
const createMeal = async (req, res) => {
    upload(req, res, async (err) => {
        if (err || !req.file) {
            return res.status(400).json({ error: "Image upload failed" });
        }

        try {
            //validate meal data from mealDTO
            const { error, value } = mealDTO.validate(req.body);

            if (error) {
                console.log('Validation error:', error.details);
                return res.status(400).json({ error: error.details[0] });
            }

            const { meal_name, meal_description, meal_price, calorie_count, admin } = value;

            //auto generate meal id 
            const meal_id = 'MEAL-' + Date.now();

            const imagePath = '/' + req.file.path.replace(/\\/g, '/');

            //create and save the new meal
            const newMeal = new Meal({
                meal_id,
                meal_name,
                meal_description,
                meal_price,
                calorie_count,
                admin,
                meal_image: imagePath
            });

            await newMeal.save();

            res.status(201).json({ message: 'Meal created successfully', meal: newMeal });

        } catch (error) {
            if (error.code === 11000) {
                return res.status(500).json({ error: 'Meal ID or another field already exists' });
            }

            res.status(500).json({ error: 'Server error', error: error.message });
        }
    });
};

//view all meals
const getMeals = async (req, res) => {
    try {
        const meals = await Meal.find();

        res.status(200).json({ meals });
    } catch (error) {
        console.error("Error fetching meals : ", error);
        res.status(500).json({ error: 'Server error', message: error.message });
    }
};

// Update a meal
const updateMeal = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedMeal = await Meal.findOneAndUpdate(
            { meal_id: req.params.id }, // Match by your custom meal_id
            req.body,         // Data to update
            { new: true }     // Return the updated document
        );

        if (!updatedMeal) {
            return res.status(404).json({ message: "Meal not found" });
        }

        res.status(200).json(updatedMeal);
    } catch (error) {
        console.error("Error updating meal:", error);
        res.status(500).json({ error: "Server error", message: error.message });
    }
};

export { createMeal, getMeals, updateMeal };
