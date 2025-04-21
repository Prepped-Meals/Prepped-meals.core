import mongoose from "mongoose";

const CartSchema = new mongoose.Schema({
    cart_id: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    meals: [
        {
            meal: { type: mongoose.Schema.Types.ObjectId, ref: "Meal", required: true }, // full meal ref
            meal_name: { type: String, required: true }, // store the name at time of adding to cart
            meal_price: { type: Number, required: true }, // price per unit from meal model
            quantity: { type: Number, required: true }, // number of items added
            total_price: { type: Number, required: true }, // meal_price * quantity
        },
    ],
});

const Cart = mongoose.model("Cart", CartSchema);
export default Cart;
