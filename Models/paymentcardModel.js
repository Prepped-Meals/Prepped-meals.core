import mongoose from "mongoose";
 
const CardDetailsSchema = new mongoose.Schema({
    cardholder_name: { type: String, required: true },
    card_number: { type: String, required: true },
    cvv: { type: String, required: true },
    exp_date: { type: String, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true }, // Linking to customer
}, { timestamps: true });
 
const CardDetails = mongoose.model("CardDetails", CardDetailsSchema);
export default CardDetails;