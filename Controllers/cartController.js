import { cartDTO } from "../Dto/CartDTOs/cart.dto.js";
import {
  addMealToCartService,
  updateCartService,
  deleteCartService
} from "../Services/cartService.js";

/**
 * Controller to add meal(s) to cart (new or additional).
 */
export const addMealToCart = async (req, res) => {
  try {
    const { error } = cartDTO.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const cartDetails = await addMealToCartService(req.body);

    res.status(201).json({
      message: "Meal(s) added to cart successfully",
      cartDetails
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Controller to update an existing cart (after editing meals).
 */
export const updateCart = async (req, res) => {
  try {
    const { error } = cartDTO.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const updatedCart = await updateCartService(req.params.cart_id, req.body);
    if (!updatedCart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json({
      message: "Cart updated successfully",
      cartDetails: updatedCart
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Controller to delete a cart (optional).
 */
export const deleteCart = async (req, res) => {
  try {
    const deletedCart = await deleteCartService(req.params.cart_id);
    if (!deletedCart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json({ message: "Cart deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
