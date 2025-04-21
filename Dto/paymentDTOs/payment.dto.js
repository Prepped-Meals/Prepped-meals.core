import Joi from "joi";
 
// Define validation schema for card details
const cardDetailsSchema = Joi.object({
  cardholder_name: Joi.string().required(),
  card_number: Joi.string().creditCard().required(),
  cvv: Joi.string().length(3).required(),
  exp_date: Joi.string()
    .regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)
    .required()
    .messages({
      "string.pattern.base": "Expiration date must be in MM/YY format",
    }),
});
 
// Define validation schema for payment request
export const validatePayment = (paymentData) => {
  const schema = Joi.object({
    customer: Joi.string().required(),
    payment_amount: Joi.number().positive().required(),
    payment_type: Joi.string().valid("CashOnDelivery", "CardPayment").required(),
    address: Joi.string().required(),
    phone_number: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .required()
      .messages({
        "string.pattern.base": "Phone number must be a 10-digit number",
      }),
    card_details: Joi.when("payment_type", {
      is: "CardPayment",
      then: cardDetailsSchema.required(),
      otherwise: Joi.forbidden(),
    }),
  });
 
  return schema.validate(paymentData, { abortEarly: false });
};
