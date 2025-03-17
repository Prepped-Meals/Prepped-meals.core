import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB");

        await import("../Models/adminModel.js");
        await import("../Models/customerModel.js");
        await import("../Models/mealModel.js");
        await import("../Models/cartModel.js");
        await import("../Models/orderModel.js");
        await import("../Models/paymentModel.js");
        await import("../Models/feedbackModel.js");

        console.log("Database & Schemas Initialized");
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1); // Exit process on failure
    }
};

export default connectDB;