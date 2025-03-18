import CardDetails from "../Models/paymentcardModel.js";
 
/**
* Create new card details.
* @param {Object} cardData - Card details payload.
* @returns {Promise<Object>} - Created card details.
*/
export const insertCardDetails = async (cardData) => {
    const cardDetails = new CardDetails(cardData);
    await cardDetails.save();
    return cardDetails;
};