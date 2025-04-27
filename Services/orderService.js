import Order from "../Models/orderModel.js";

export const createOrder = async (orderData) => {
  const order = await Order.create(orderData);
  return order;
};

export const getOrdersByCustomerService = async (customerId) => {
  return await Order.find({ customer: customerId }).populate(
    "customer payment cart_items.meal_id"
  );
};
