import Joi from "joi";

export const cartDTO = Joi.object({
  cart_id: Joi.string().required(),
  customer: Joi.string().required(),
  meals: Joi.array()
    .items(
      Joi.object({
        meal: Joi.string().required(), // ObjectId of the meal
        meal_name: Joi.string().required(), // New field
        meal_price: Joi.number().min(0).required(), // Unit price from meal
        quantity: Joi.number().min(1).required(),
        total_price: Joi.number().min(0).required(), // meal_price * quantity
      })
    )
    .required(),
});
