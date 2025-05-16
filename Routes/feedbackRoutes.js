import { Router } from "express";
import {
  submitFeedback,
  getAllFeedbacks,
  updateFeedback,
  deleteFeedback,
  markHelpful,
} from "../Controllers/feedbackController.js";

const router = Router();

router.post("/", submitFeedback);
router.get("/", getAllFeedbacks);
router.put("/:id", updateFeedback);  
router.delete("/:id", deleteFeedback);  
router.post("/:id/helpful", markHelpful); 

export default router;
