import Joi from "joi";
 
export const paymentCardDTO = Joi.object({
    customer: Joi.string().required(),
    cardholder_name: Joi.string().required(),
    card_number: Joi.string().creditCard().required(),
    cvv: Joi.string().length(3).required(),
    exp_date: Joi.string().regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/).required(), // Format: MM/YY
});