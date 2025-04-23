import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
    meal_id: { type: String, required: true, unique: true },
    meal_name: { type: String, required: true },
    meal_description: { type: String },
    meal_price: { type: Number, required: true },
    calorie_count: { type: Number },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }, // Reference to Admin
    meal_image: {type : String},
});

const Meal = mongoose.model('Meal', mealSchema);
export default Meal;
