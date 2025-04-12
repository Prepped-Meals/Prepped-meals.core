import Joi from 'joi';

export const customerDTO = Joi.object({
    f_name : Joi.string().required(),
    l_name: Joi.string().required(),
    email : Joi.string().email().required(),
    contact_no : Joi.string().required(),
    username: Joi.string().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).optional()
});