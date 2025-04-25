import CardDetails from "../Models/paymentcardModel.js";

// Insert
export const insertCardDetails = async (cardData) => {
  const cardDetails = new CardDetails(cardData);
  await cardDetails.save();
  return cardDetails;
};

// Update
export const updateCardDetailsService = async (id, cardData) => {
  return await CardDetails.findByIdAndUpdate(id, cardData, { new: true });
};

// Delete
export const deleteCardDetailsService = async (id) => {
  return await CardDetails.findByIdAndDelete(id);
};