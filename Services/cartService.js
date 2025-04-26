import Cart from "../Models/cartModel.js";
import Meal from "../Models/mealModel.js";
import Customer from "../Models/customerModel.js";

/**
 * Create or replace meals in a cart.
 * Called when initially adding meals or replacing the whole cart.
 */
export const addMealToCartService = async (cartData) => {
  const { cart_id, customer, meals } = cartData;

  const existingCustomer = await Customer.findById(customer);
  if (!existingCustomer) {
    throw new Error("Customer not found");
  }

  const formattedMeals = await formatMeals(meals);

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

/**
 * Update an existing cart by cart_id.
 * Can be used after user edits meals and clicks "Save Cart".
 */
export const updateCartService = async (cart_id, cartData) => {
  const { customer, meals } = cartData;

  const existingCart = await Cart.findOne({ cart_id });
  if (!existingCart) return null;

  const formattedMeals = await formatMeals(meals);

  existingCart.customer = customer;
  existingCart.meals = formattedMeals;

  await existingCart.save();
  return existingCart;
};

/**
 * Delete a cart by cart_id.
 */
export const deleteCartService = async (cart_id) => {
  return await Cart.findOneAndDelete({ cart_id });
};

/**
 * Helper to format meals with total_price calculation.
 */
const formatMeals = async (meals) => {
  const formatted = [];

  for (const item of meals) {
    const mealData = await Meal.findById(item.meal);
    if (!mealData) throw new Error(`Meal not found: ${item.meal}`);

    const quantity = item.quantity;
    const meal_price = mealData.meal_price;
    const total_price = quantity * meal_price;

    formatted.push({
      meal: mealData._id,
      meal_name: mealData.meal_name,
      meal_price,
      quantity,
      total_price,
    });
  }

  return formatted;
};
