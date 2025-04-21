import { cartDTO } from "../Dto/CartDTOs/cart.dto.js";
import { addMealToCartService } from "../Services/cartService.js";

/**
 * Controller to add meal(s) to cart.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const addMealToCart = async (req, res) => {
  try {
    // Validate input using Joi DTO
    const { error } = cartDTO.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Pass validated data to the service
    const cartDetails = await addMealToCartService(req.body);

    res.status(201).json({
      message: "Meal(s) added to cart successfully",
      cartDetails
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};
