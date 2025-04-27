import Joi from "joi";

export const validateOrder = (data) => {
  const schema = Joi.object({
    customer: Joi.string().required(),
    payment: Joi.string().required(),
    cart_items: Joi.array()
      .items(
        Joi.object({
          meal_id: Joi.string().required(),
          meal_name: Joi.string().required(),
          quantity: Joi.number().required(),
          meal_price: Joi.number().required(),
          total_price: Joi.number().required(),
        })
      )
      .required(),
    order_received_date: Joi.date(),
    order_status: Joi.string().valid("Pending", "Completed", "Cancelled"),
  });

  return schema.validate(data, { abortEarly: false });
};
