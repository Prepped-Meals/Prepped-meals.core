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

            const { meal_name, meal_description, meal_price, calorie_count, admin, meal_stock } = value;

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
                meal_image: imagePath,
                meal_stock,
                total_sold:0,
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
    // Upload the image if present (using multer middleware already defined)
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: "Image upload failed", message: err.message });
        }

        try {
            const { id } = req.params; // Extract meal_id from the request params
            const updates = { ...req.body }; // Get meal data from the request body

            // Check if there's a new stock value
            if (updates.meal_stock !== undefined && updates.meal_stock < 0) {
                return res.status(400).json({ error: "Stock cannot be negative" });
            }

            // If a new image is uploaded, update the image path in the meal data
            if (req.file) {
                // Fetch the existing meal to get old image path
                const existingMeal = await Meal.findOne({ meal_id: id });

                // Delete old image if it exists
                if (existingMeal && existingMeal.meal_image) {
                    const oldImagePath = existingMeal.meal_image.startsWith('/')
                        ? existingMeal.meal_image.slice(1)
                        : existingMeal.meal_image;

                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }

                // Set new image path
                updates.meal_image = '/' + req.file.path.replace(/\\/g, '/');
            }

            // If `meal_stock` is provided, include it in the update, otherwise it remains the same
            if (updates.meal_stock === undefined) {
                delete updates.meal_stock; // Remove `meal_stock` from update object if not provided
            }

            // Find the meal by its custom meal_id and update it with the new data
            const updatedMeal = await Meal.findOneAndUpdate(
                { meal_id: id },  // Use the custom meal_id for identifying the meal
                updates,           // Apply the updates (including new image path if applicable)
                { new: true }      // Return the updated meal object
            );

            // If the meal with the given ID is not found, return a 404 error
            if (!updatedMeal) {
                return res.status(404).json({ message: "Meal not found" });
            }

            // Send the updated meal back in the response
            res.status(200).json({ message: 'Meal updated successfully', meal: updatedMeal });
        } catch (error) {
            console.error("Error updating meal:", error);
            res.status(500).json({ error: "Server error", message: error.message });
        }
    });
};





// DELETE a meal
const deleteMeal = async (req, res) => {
    try {
        const { id } = req.params;

        const meal = await Meal.findOne({ meal_id: id });

        if (!meal) {
            return res.status(404).json({ message: "Meal not found" });
        }

        // Delete associated image if exists
        if (meal.meal_image) {
            const imagePath = meal.meal_image.startsWith('/')
                ? meal.meal_image.slice(1)
                : meal.meal_image;

            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Meal.deleteOne({ meal_id: id });

        res.status(200).json({ message: "Meal deleted successfully" });
    } catch (error) {
        console.error("Error deleting meal:", error);
        res.status(500).json({ error: "Server error", message: error.message });
    }
}


export const updateMealStockAfterOrder = async (order) => {
  try {
    // Loop through the cart items of the order and update the meal stock
    for (let item of order.cart_items) {
      const meal = await Meal.findOne({ _id: item.meal_id });

      if (meal) {
        // Check if there is enough stock
        if (meal.meal_stock >= item.quantity) {
          // Update the stock and total sold
          meal.total_sold += item.quantity;
          meal.meal_stock -= item.quantity;

          // Save the updated meal data
          await meal.save();
        } else {
          throw new Error(`Not enough stock for meal: ${item.meal_name}`);
        }
      } else {
        throw new Error(`Meal not found for ID: ${item.meal_id}`);
      }
    }
  } catch (error) {
    console.error("Error updating meal stock:", error.message);
    throw new Error("Failed to update meal stock");
  }
};




export { createMeal, getMeals, updateMeal, deleteMeal};
