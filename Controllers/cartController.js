import { cartDTO } from "../Dto/CartDTOs/cart.dto.js";
import {
  addMealToCartService,
  updateCartService,
  deleteCartService,
  deleteMealFromCartService,
  getCartByCustomerService,
} from "../Services/cartService.js";
import Cart from "../Models/cartModel.js";

export const addMealToCart = async (req, res) => {
  try {
    const { customer, meal, meal_name, meal_price, action } = req.body;
    let cart = await Cart.findOne({ customer });

    if (!cart) {
      if (action === "decrease") {
        return res.status(400).json({ success: false, message: "Cannot decrease. Cart not found." });
      }

      cart = new Cart({
        cart_id: `cart_${Date.now()}`,
        customer,
        meals: [{
          meal,
          meal_name,
          meal_price,
          quantity: 1,
          total_price: meal_price,
        }],
      });
    } else {
      const existingMeal = cart.meals.find((m) => m.meal.toString() === meal);

      if (existingMeal) {
        if (action === "increase") {
          existingMeal.quantity += 1;
          existingMeal.total_price = existingMeal.quantity * existingMeal.meal_price;
        } else if (action === "decrease") {
          if (existingMeal.quantity > 1) {
            existingMeal.quantity -= 1;
            existingMeal.total_price = existingMeal.quantity * existingMeal.meal_price;
          } else {
            // Remove the item if quantity drops to 0
            cart.meals = cart.meals.filter((m) => m.meal.toString() !== meal);
          }
        }
      } else {
        if (action === "increase") {
          // Add new meal to cart
          cart.meals.push({
            meal,
            meal_name,
            meal_price,
            quantity: 1,
            total_price: meal_price,
          });
        } else {
          return res.status(400).json({ success: false, message: "Cannot decrease. Meal not in cart." });
        }
      }
    }

    await cart.save();
    return res.status(200).json({ success: true, cart, cart_id: cart.cart_id });
  } catch (error) {
    console.error("Cart Update Error:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
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

/**
 * Controller to delete a specific meal from a cart.
 */
export const deleteMealFromCart = async (req, res) => {
  try {
    const { cart_id, meal_id } = req.params;
    console.log(`Received DELETE request for cart_id: ${cart_id}, meal_id: ${meal_id}`);
    const updatedCart = await deleteMealFromCartService(cart_id, meal_id);

    if (!updatedCart) {
      return res.status(404).json({ message: "Cart or meal not found" });
    }

    res.status(200).json({ message: "Meal removed from cart successfully", cart: updatedCart });
  } catch (err) {
    console.error("Delete Meal Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Controller to get a cart by customer ID.
 */
export const getCartByCustomer = async (req, res) => {
  try {
    const { customer_id } = req.params;
    const cart = await getCartByCustomerService(customer_id);

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json({ success: true, cart });
  } catch (err) {
    console.error("Get Cart Error:", err);
    res.status(500).json({ error: err.message });
  }
};