import { validatePayment } from "../Dto/paymentDTOs/payment.dto.js";
import { createPayment } from "../Services/paymentServices.js";

// @desc    Create a new payment
// @route   POST /api/payments
// @access  Public
export const addPayment = async (req, res) => {
  try {
    const { error } = validatePayment(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map((err) => err.message).join(", "),
      });
    }

    const payment = await createPayment(req.body);
    return res.status(201).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("Payment Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
