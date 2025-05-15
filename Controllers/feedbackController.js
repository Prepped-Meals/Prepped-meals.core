import Feedback from '../Models/feedbackModel.js';
import { v4 as uuidv4 } from 'uuid';

// Add feedback
export const submitFeedback = async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Not authenticated" });
    }

    const { feedback_description, rating } = req.body; // Added rating
    if (!feedback_description || feedback_description.trim() === "") {
        return res.status(400).json({ error: "Feedback cannot be empty" });
    }

    try {
        const newFeedback = new Feedback({
            feedback_id: uuidv4(),
            customer: req.session.user._id,
            feedback_description,
            rating: rating || null, 
        });

        await newFeedback.save();
        res.status(201).json({ message: "Feedback submitted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all feedbacks (for admin)
export const getAllFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find()
            .populate('customer', 'f_name l_name email profile_pic')
            .sort({ createdAt: -1 });

        res.status(200).json(feedbacks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Edit feedback
export const updateFeedback = async (req, res) => {
    const { id } = req.params;
    const { feedback_description, rating } = req.body; 

    if (!feedback_description || feedback_description.trim() === "") {
        return res.status(400).json({ error: "Feedback cannot be empty" });
    }

    try {
        const feedback = await Feedback.findById(id);

        if (!feedback) {
            return res.status(404).json({ error: "Feedback not found" });
        }

        if (feedback.customer.toString() !== req.session.user._id) {
            return res.status(403).json({ error: "Unauthorized to update this feedback" });
        }

        feedback.feedback_description = feedback_description;
        feedback.rating = rating || null; 
        await feedback.save();

        res.status(200).json({ message: "Feedback updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete feedback (no changes needed)
export const deleteFeedback = async (req, res) => {
    const { id } = req.params;

    try {
        const feedback = await Feedback.findById(id);

        if (!feedback) {
            return res.status(404).json({ error: "Feedback not found" });
        }

        if (feedback.customer.toString() !== req.session.user._id) {
            return res.status(403).json({ error: "Unauthorized to delete this feedback" });
        }

        await Feedback.deleteOne({ _id: id });

        res.status(200).json({ message: "Feedback deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Mark feedback as helpful (no changes needed)
export const markHelpful = async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Not authenticated" });
    }

    const { id } = req.params;
    const userId = req.session.user._id;

    try {
        const feedback = await Feedback.findById(id);
        if (!feedback) {
            return res.status(404).json({ error: "Feedback not found" });
        }

        if (feedback.customer.toString() === userId) {
            return res.status(400).json({ error: "You cannot mark your own feedback as helpful" });
        }

        const alreadyMarked = feedback.helpful.includes(userId);

        if (alreadyMarked) {
            feedback.helpful.pull(userId);
        } else {
            feedback.helpful.push(userId);
        }

        await feedback.save();
        res.status(200).json({
            message: alreadyMarked ? "Removed from helpful" : "Marked as helpful",
            helpfulCount: feedback.helpful.length,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};