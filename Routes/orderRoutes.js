import express from "express";
import { addOrder, getOrdersByCustomer, getAllOrders  } from "../Controllers/orderController.js";

const router = express.Router();

router.post("/add-order", addOrder);
router.get("/get-all-orders/:customerId", getOrdersByCustomer);

router.get("/get-all-orders", getAllOrders);

export default router;
