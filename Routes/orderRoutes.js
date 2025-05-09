import express from "express";
import { addOrder, getOrdersByCustomer, getAllOrders ,updateOrderStatus } from "../Controllers/orderController.js";
import { generateCalorieReport, downloadCalorieReportPDF } from "../Controllers/generateCalorieReport.js";



import { generateTopCustomersReport } from "../Controllers/generateTopcustomersReport.js";
import { generateOrderStatusReport } from "../Controllers/GenerateOrderStatusReport.js";

const router = express.Router();

router.post("/add-order", addOrder);
router.get("/get-all-orders/:customerId", getOrdersByCustomer);
router.get("/calorie-report/:customerId", generateCalorieReport);
router.get('/downloadPDF/:customerId', downloadCalorieReportPDF);



router.get("/get-all-orders", getAllOrders);

router.get("/top-customers-report", generateTopCustomersReport);
router.get("/generate-order-status-report", generateOrderStatusReport);

router.put ("/update-status/:orderId", updateOrderStatus);

export default router;



