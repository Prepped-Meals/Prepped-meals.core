import mongoose from "mongoose";

const CartSchema = new mongoose.Schema({
    cart_id: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    meals: [
        {
            meal: { type: mongoose.Schema.Types.ObjectId, ref: "Meal" },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
        },
    ],
});

const Cart = mongoose.model("Cart", CartSchema);
export default Cart;