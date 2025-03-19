import { cartDTO } from "../Dto/CartDTOs/cart.dto.js";
import { addMealToCartService } from "../Services/cartService.js";

/**
 * Controller to add meal to cart.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const addMealToCart = async (req, res) => {
  try {
    const cartDetails = await addMealToCartService(req.body);

    res
      .status(201)
      .json({ message: "Meal added to cart successfully", cartDetails });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
