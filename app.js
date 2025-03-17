import express from "express";
import dotenv from "dotenv";
import connectDB from "./Config/db.js";
import customerRoutes from "./routes/customerRoutes.js"
import seedDatabase from "./Config/seedDB.js";

dotenv.config(); 

// Connect to MongoDB & Seed Data
const startServer = async () => {
    await connectDB();
    await seedDatabase(); 
};

startServer();

const app = express();

app.use(express.json());

app.use("/api/customers", customerRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

