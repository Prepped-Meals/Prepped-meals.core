import Joi from "joi";

export const cartDTO = Joi.object({
  cart_id: Joi.string().required(),
  customer: Joi.string().required(),
  meals: Joi.array()
    .items(
      Joi.object({
        meal: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
        price: Joi.number().min(0).required(),
      })
    )
    .required(),
});
