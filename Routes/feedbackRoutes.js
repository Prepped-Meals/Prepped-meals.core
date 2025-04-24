// Routes/feedbackRoutes.js
import { Router } from "express";
import { submitFeedback } from "../Controllers/feedbackController.js";

const router = Router();

router.post("/", submitFeedback); 

export default router;
