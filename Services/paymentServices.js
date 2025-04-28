import Payment from "../Models/paymentModel.js";

export const createPayment = async (paymentData) => {
  const payment = new Payment(paymentData);
  return await payment.save();
};

export const getWeeklyPaymentReport = async () => {
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7); // Next Sunday

  const topCustomers = await Payment.aggregate([
    {
      $match: {
        payment_date: {
          $gte: startOfWeek,
          $lt: endOfWeek,
        },
      },
    },
    {
      $group: {
        _id: "$customer", // Group by the 'customer' field
        totalPaid: { $sum: "$payment_amount" },
      },
    },
    {
      $sort: { totalPaid: -1 },
    },
    {
      $limit: 3,
    },
    {
      $lookup: {
        from: "customers",
        let: { customerId: { $toObjectId: "$_id" } }, // Only define 'customerId' here
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$customerId"] },
            },
          },
          {
            $project: {
              _id: 1,
              f_name: 1,
              l_name: 1,
            },
          },
        ],
        as: "customerInfo",
      },
    },
    {
      $unwind: {
        path: "$customerInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 0,
        customer_id: "$customerInfo._id",
        customer_name: {
          $concat: ["$customerInfo.f_name", " ", "$customerInfo.l_name"],
        },
        totalPaid: 1,
      },
    },
  ]);

  // Step 2: Find the busiest payment date
  const busiestDay = await Payment.aggregate([
    {
      $match: {
        payment_date: {
          $gte: startOfWeek,
          $lt: endOfWeek,
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$payment_date" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $limit: 1,
    },
  ]);

  // Step 3: Find the most used payment method
  const popularPaymentMethod = await Payment.aggregate([
    {
      $match: {
        payment_date: {
          $gte: startOfWeek,
          $lt: endOfWeek,
        },
      },
    },
    {
      $group: {
        _id: "$payment_type",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $limit: 1,
    },
  ]);

  // Final response
  return {
    topCustomers: topCustomers || [],
    busiestDay: busiestDay[0]?._id || null,
    mostUsedPaymentMethod: popularPaymentMethod[0]?._id || null,
  };
};
