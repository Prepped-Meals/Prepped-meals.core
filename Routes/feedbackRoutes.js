// Routes/feedbackRoutes.js
import { Router } from "express";
import { submitFeedback , getAllFeedbacks } from "../Controllers/feedbackController.js";

const router = Router();

router.post("/", submitFeedback); 
router.get("/", getAllFeedbacks);

export default router;
