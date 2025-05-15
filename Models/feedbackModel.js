// feedbackModel.js
import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema({
  feedback_id: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  feedback_description: { type: String, required: true },
  helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: "Customer" }], // NEW
}, { timestamps: true });

const Feedback = mongoose.model("Feedback", FeedbackSchema);
export default Feedback;
