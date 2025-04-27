import mongoose from "mongoose";

// Define schema for individual cart items
const CartItem = new mongoose.Schema({
    meal_id: { type: mongoose.Schema.Types.ObjectId, ref: "Meal", required: true },
    meal_name: { type: String, required: true }, 
    quantity: { type: Number, required: true },
    meal_price: { type: Number, required: true } 
}, { _id: false }); // prevent automatic _id creation for subdocs

// Main order schema
const OrderSchema = new mongoose.Schema({
    order_id: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    cart: { type: [CartItem], required: true },
    order_address: { type: String, required: true },
    order_date: { type: Date, default: Date.now },
    order_status: { type: String, enum: ["Pending", "Completed", "Cancelled"], default: "Pending" },
});

const Order = mongoose.model("Order", OrderSchema);
export default Order;