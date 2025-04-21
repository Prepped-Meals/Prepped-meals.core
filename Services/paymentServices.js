import Payment from "../Models/paymentModel.js";
 
export const createPayment = async (paymentData) => {
  const payment = new Payment(paymentData);
  return await payment.save();
};
 