import mongoose from "mongoose";
import Cart from "../Models/cartModel.js";

/**
 * Service to add meal to cart.
 * @param {Object} cartData - The cart data containing cart_id, customer, and meals.
 * @returns {Promise<Object>} - The updated or newly created cart.
 */
export const addMealToCartService = async (cartData) => {
  try {
    // Convert customer to ObjectId if it's a string
    const customerId = new mongoose.Types.ObjectId(cartData.customer);

    let cart = await Cart.findOne({
      cart_id: cartData.cart_id,
      customer: customerId,
    });

    // If cart doesn't exist, create a new cart
    if (!cart) {
      cart = new Cart({
        cart_id: cartData.cart_id,
        customer: customerId,
        meals: cartData.meals,
      });
    } else {
      cart.meals.push(...cartData.meals);
    }

    await cart.save();
    return cart;
  } catch (error) {
    throw new Error("Error while adding meal to cart: " + error.message);
  }
};
