import {mealDTO} from "../Dto/MealsDTOs/aMeals.js";
import Meal from '../Models/mealModel.js';

//create meal
const createMeal = async (req,res) =>{
    try{
        //validate meal data from mealDTO
        const {error, value} = mealDTO.validate(req.body);

        if(error){
            console.log ('Validation error:', error.details);
            return res.status(400).json ({error:error.details[0]});
        }

        const {meal_name, meal_description, meal_price, calorie_count, admin} = value;

        // //check if provided admin id exists 
        // const adminExists = await Admin.findByObjectId(admin);
        // if (!adminExists){
        //     return res.status(404).json ({message:"Admin not found"});
        // }

        //auto generate meal id 
        const meal_id = 'MEAL-' + Date.now();

        //create and save the new meaal
        const newMeal = new Meal({
            meal_id,
            meal_name,
            meal_description,
            meal_price,
            calorie_count,
            admin
        });

        await newMeal.save();

        res.status (201).json({ message : 'Meal created successfully', meal: newMeal});

    }catch (error){
        if (error.code === 11000){
            return res.status(500).json({error: 'Meal ID or another field already exists'});
        }

        res.status(500).json({error: 'Server error', error:error.message});
    }
};

export {createMeal};

