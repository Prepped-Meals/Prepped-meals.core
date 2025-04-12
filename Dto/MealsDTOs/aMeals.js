import Joi from 'joi';

// Meal DTO validation schema
const mealDTO = Joi.object({
    meal_name: Joi.string().min(3).max(100).required(),
    meal_description: Joi.string().max(500).required(),
    meal_price: Joi.number().min(0).required(),
    calorie_count: Joi.number().min(0).required(),
    admin: Joi.string().hex().length(24).required()
});

export { mealDTO };

