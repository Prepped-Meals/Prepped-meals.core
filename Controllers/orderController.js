import {
  createOrder,
  getOrdersByCustomerService,
} from "../Services/orderService.js";
import { validateOrder } from "../Dto/orderDTOs/orderDTO.js";
import Order from "../Models/orderModel.js";

export const addOrder = async (req, res) => {
  try {
    const { error } = validateOrder(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map((err) => err.message).join(", "),
      });
    }

    const order = await createOrder(req.body);
    return res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Order Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getOrdersByCustomer = async (req, res) => {
  try {
    let { customerId } = req.params;
    customerId = customerId.trim();
    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "Customer ID is required",
      });
    }

    let orders = await getOrdersByCustomerService(customerId);
    orders = orders.sort(
      (a, b) =>
        new Date(b.order_received_date) - new Date(a.order_received_date)
    );

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Get Orders Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
