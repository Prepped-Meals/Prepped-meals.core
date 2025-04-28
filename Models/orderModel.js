import mongoose from "mongoose";

// Define schema for individual cart items
const CartItem = new mongoose.Schema(
  {
    meal_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meal",
      required: true,
    },
    meal_name: { type: String, required: true },
    quantity: { type: Number, required: true },
    meal_price: { type: Number, required: true },
    total_price: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  payment : {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
    required: true,
  },
  cart_items: { type: [CartItem], required: true },
  order_received_date: { type: Date },
  order_status: {
    type: String,
    enum: ["Pending", "Completed", "Cancelled"],
    default: "Completed",
  },
});

const Order = mongoose.model("Order", OrderSchema);
export default Order;