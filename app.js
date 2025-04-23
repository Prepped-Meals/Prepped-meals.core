import express from "express";
import dotenv from "dotenv";
import connectDB from "./Config/db.js";
import customerRoutes from "./Routes/customerRoutes.js"
import seedDatabase from "./Config/seedDB.js";
import paymentcardRoutes from "./Routes/paymentCardRoutes.js";
import cartRoutes from "./Routes/cartRoutes.js";
import paymentRoutes from "./Routes/paymentRoutes.js";
import cors from "cors";
import mealRoutes from "./Routes/mealRoutes.js";
import session from "express-session"; 
import path from "path"; 
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      credentials: true,  // Allow credentials like cookies
      allowedHeaders: "Content-Type, Authorization",
    })
  );
  

// app.use(cors()); // Enable CORS

//set up session middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET || "your_secret_key", // Secret to sign the session ID cookie
        resave: false, // Don't save session if it wasn't modified
        saveUninitialized: false, // Don't create a session until something is stored
        cookie: {
            secure: process.env.NODE_ENV === "production", // Set to true if using HTTPS
            maxAge: 1000 * 60 * 60 * 24, // Session expiration (1 day)
            httpOnly: true,
        },
    })
);


app.use(express.json());

app.use('/uploads', express.static('uploads'));



app.use("/api/customers", customerRoutes);
app.use("/api/card-details", paymentcardRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/create-meals",mealRoutes);
app.use("/api/get-meals",mealRoutes);


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



