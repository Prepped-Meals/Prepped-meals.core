import express from "express";
import { addOrder, getOrdersByCustomer } from "../Controllers/orderController.js";

const router = express.Router();

router.post("/add-order", addOrder);
router.get("/get-all-orders/:customerId", getOrdersByCustomer);

export default router;
