import express from "express";
import { addOrder, getOrdersByCustomer, getAllOrders  } from "../Controllers/orderController.js";
import { generateCalorieReport, downloadCalorieReportPDF } from "../Controllers/generateCalorieReport.js";



const router = express.Router();

router.post("/add-order", addOrder);
router.get("/get-all-orders/:customerId", getOrdersByCustomer);
router.get("/calorie-report/:customerId", generateCalorieReport);
router.get('/downloadPDF/:customerId', downloadCalorieReportPDF);



router.get("/get-all-orders", getAllOrders);

export default router;



