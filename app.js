import express from "express";
import dotenv from "dotenv";
import connectDB from "./Config/db.js";
import customerRoutes from "./routes/customerRoutes.js";
import seedDatabase from "./Config/seedDB.js";
import paymentcardRoutes from "./Routes/paymentCardRoutes.js";
import cors from "cors";

dotenv.config();

// Connect to MongoDB & Seed Data
const startServer = async () => {
  await connectDB();
  await seedDatabase();
};

startServer();

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000", // Allow only frontend origin
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);
app.use(express.json());

app.use("/api/customers", customerRoutes);
app.use("/api/card-details", paymentcardRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
