import {
  createOrder,
  getOrdersByCustomerService,
} from "../Services/orderService.js";
import { validateOrder } from "../Dto/orderDTOs/orderDTO.js";
import Order from "../Models/orderModel.js";
import { getAllOrdersService } from "../Services/orderService.js";
import Meal from "../Models/mealModel.js";
import { updateMealStockAfterOrder } from "./mealController.js";

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

    await updateMealStockAfterOrder(order); // Call the Meal Controller's function to update stock

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

export const getAllOrders = async (req, res) => {
  try {
    const orders = await getAllOrdersService();
    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Get All Orders Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


//controller for updating order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!["Pending", "Completed", "Cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.order_status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Update Order Status Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

