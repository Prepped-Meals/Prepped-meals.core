import Cart from "../Models/cartModel.js";
import Meal from "../Models/mealModel.js";
import Customer from "../Models/customerModel.js";

/**
 * Add or update cart with meals.
 * If the cart with the given cart_id exists, it updates the meals.
 * Otherwise, it creates a new cart with the given meals.
 *
 * @param {Object} cartData - The cart payload (cart_id, customer, meals).
 * @returns {Promise<Object>} - The created or updated cart document.
 */
export const addMealToCartService = async (cartData) => {
  const { cart_id, customer, meals } = cartData;

  // Validate that the customer exists
  const existingCustomer = await Customer.findById(customer);
  if (!existingCustomer) {
    throw new Error("Customer not found");
  }

  // Prepare the formatted meals array
  const formattedMeals = [];

  for (const item of meals) {
    const mealData = await Meal.findById(item.meal);
    if (!mealData) {
      throw new Error(`Meal not found: ${item.meal}`);
    }

    const quantity = item.quantity;
    const meal_price = mealData.meal_price;
    const total_price = quantity * meal_price;

    formattedMeals.push({
      meal: mealData._id,
      meal_name: mealData.meal_name,
      meal_price,
      quantity,
      total_price,
    });
  }

  // Check if the cart exists
  let cart = await Cart.findOne({ cart_id });

  if (cart) {
    cart.meals = formattedMeals;
    await cart.save();
  } else {
    cart = await Cart.create({
      cart_id,
      customer,
      meals: formattedMeals,
    });
  }

  return cart;
};
