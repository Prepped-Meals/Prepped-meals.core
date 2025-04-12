import { paymentCardDTO } from "../Dto/paymentCardDTOs/paymentCard.dto.js";
import { insertCardDetails } from "../Services/paymentCardService.js";

/**
 * Controller to create and store card details.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const createCardDetails = async (req, res) => {
  try {
    const { error } = paymentCardDTO.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const cardDetails = await insertCardDetails(req.body);

    res
      .status(201)
      .json({ message: "Card details saved successfully", cardDetails });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
