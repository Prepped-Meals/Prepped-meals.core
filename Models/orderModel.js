import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    order_id: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    cart: { type: mongoose.Schema.Types.ObjectId, ref: "Cart", required: true },
    order_address: { type: String, required: true },
    order_date: { type: Date, default: Date.now },
    order_status: { type: String, enum: ["Pending", "Completed", "Cancelled"], default: "Pending" },
    
});

const Order = mongoose.model("Order", OrderSchema);
export default Order;