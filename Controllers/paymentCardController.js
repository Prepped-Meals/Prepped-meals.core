import { paymentCardDTO } from "../Dto/paymentCardDTOs/paymentCard.dto.js";
import {
  insertCardDetails,
  updateCardDetailsService,
  deleteCardDetailsService
} from "../Services/paymentCardService.js";
import CardDetails from "../Models/paymentcardModel.js";

// Create
export const createCardDetails = async (req, res) => {
  try {
    const { error } = paymentCardDTO.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const cardDetails = await insertCardDetails(req.body);
    res.status(201).json({ message: "Card details saved successfully", cardDetails });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update
export const updateCardDetails = async (req, res) => {
  try {
    const { error } = paymentCardDTO.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const updatedCard = await updateCardDetailsService(req.params.id, req.body);
    if (!updatedCard) return res.status(404).json({ message: "Card not found" });

    res.status(200).json({ message: "Card details updated", updatedCard });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete
export const deleteCardDetails = async (req, res) => {
  try {
    const deletedCard = await deleteCardDetailsService(req.params.id);
    if (!deletedCard) return res.status(404).json({ message: "Card not found" });

    res.status(200).json({ message: "Card deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all card details
export const getCardDetailsById = async (req, res) => {
  try {
    const { cardId } = req.params; // Get the cardId from URL parameters
    console.log(cardId); 
    const cardDetail = await CardDetails.findById(cardId); // Query the card details by cardId
    
    if (!cardDetail) {
      return res.status(404).json({ message: "Card details not found" });
    }

    res.status(200).json(cardDetail); // Return the card details if found
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};