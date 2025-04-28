import express from "express";
import { addOrder, getOrdersByCustomer, getAllOrders  } from "../Controllers/orderController.js";

import { generateTopCustomersReport } from "../Controllers/generateTopcustomersReport.js";
import { generateOrderStatusReport } from "../Controllers/GenerateOrderStatusReport.js";

const router = express.Router();

router.post("/add-order", addOrder);
router.get("/get-all-orders/:customerId", getOrdersByCustomer);

router.get("/get-all-orders", getAllOrders);

router.get("/top-customers-report", generateTopCustomersReport);
router.get("/generate-order-status-report", generateOrderStatusReport);

export default router;
