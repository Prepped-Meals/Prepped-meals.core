import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const PaymentSchema = new mongoose.Schema({
    payment_id: { type: String, default: uuidv4, unique: true },
    customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  payment_amount: { type: Number, required: true },
  payment_date: { type: Date, default: Date.now },
  payment_type: {
    type: String,
    enum: ["CashOnDelivery", "CardPayment"],
    required: true,
  },
  address: { type: String, required: true },
  phone_number: { type: String, required: true },
  card_details: {
    cardholder_name: { type: String },
    card_number: { type: String },
    cvv: { type: String },
    exp_date: { type: String },
  },
});

// Ensure card details are only required for CardPayment
PaymentSchema.pre("validate", function (next) {
  if (this.payment_type === "CardPayment") {
    if (
      !this.card_details.cardholder_name ||
      !this.card_details.card_number ||
      !this.card_details.cvv ||
      !this.card_details.exp_date
    ) {
      return next(new Error("Card details are required for card payments."));
    }
  }
  next();
});

const Payment = mongoose.model("Payment", PaymentSchema);
export default Payment;
