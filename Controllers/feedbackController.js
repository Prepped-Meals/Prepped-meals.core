import Feedback from '../Models/feedbackModel.js';
import { v4 as uuidv4 } from 'uuid';

//add feedback
export const submitFeedback = async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Not authenticated" });
    }

    const { feedback_description } = req.body;
    if (!feedback_description || feedback_description.trim() === "") {
        return res.status(400).json({ error: "Feedback cannot be empty" });
    }

    try {
        const newFeedback = new Feedback({
            feedback_id: uuidv4(),
            customer: req.session.user._id,
            feedback_description,
        });

        await newFeedback.save();
        res.status(201).json({ message: "Feedback submitted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


//view all meals (for admin)

export const getAllFeedbacks = async (req, res) => {
    try {
        
        const feedbacks = await Feedback.find()
            .populate('customer', 'name email') // Adjust fields as per your user model
            .sort({ createdAt: -1 }); // Sort by latest first

        res.status(200).json(feedbacks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

