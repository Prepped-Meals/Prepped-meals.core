import { validatePayment } from "../Dto/paymentDTOs/payment.dto.js";
import { createPayment } from "../Services/paymentServices.js";

// @desc    Create a new payment
// @route   POST /api/payments
// @access  Public
export const addPayment = async (req, res) => {
  console.log("req.body", req);
  try {
    const { error } = validatePayment(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.details.map((err) => err.message).join(", "));
    }

    const payment = await createPayment(req.body);
    res.status(201).json(payment);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};
