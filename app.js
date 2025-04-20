import express from "express";
import dotenv from "dotenv";
import connectDB from "./Config/db.js";
import customerRoutes from "./routes/customerRoutes.js";
import seedDatabase from "./Config/seedDB.js";
import paymentcardRoutes from "./Routes/paymentCardRoutes.js";
import cartRoutes from "./Routes/cartRoutes.js";
import paymentRoutes from "./Routes/paymentRoutes.js";
import cors from "cors";

dotenv.config();

const startServer = async () => {
  await connectDB();
  await seedDatabase();
};

startServer();

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);
app.use(express.json());

app.use("/api/customers", customerRoutes);
app.use("/api/card-details", paymentcardRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payments", paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
