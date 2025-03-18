import { paymentCardDTO } from "../Dto/paymentCardDTOs/paymentCard.dto.js";
import { insertCardDetails } from "../Services/paymentCardService.js";
 
/**
* Controller to create and store card details.
* @param {Object} req - Express request object.
* @param {Object} res - Express response object.
*/
export const createCardDetails = async (req, res) => {
    try {
        // Validate request body
        const { error, value } = paymentCardDTO.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });
 
        // Call service to store card details
        const cardDetails = await insertCardDetails(value);
 
        res.status(201).json({ message: "Card details saved successfully", cardDetails });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};