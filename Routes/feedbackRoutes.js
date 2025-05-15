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
router.put("/:id", updateFeedback);  // Updated route for feedback update
router.delete("/:id", deleteFeedback);  // Updated route for feedback delete
router.post("/:id/helpful", markHelpful); // NEW

export default router;
