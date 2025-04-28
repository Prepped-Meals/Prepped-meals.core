import Order from "../Models/orderModel.js";
import moment from "moment";
import PDFDocument from "pdfkit";

// Existing function to generate calorie report
export const generateCalorieReport = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { startDate, endDate, mode = "week" } = req.query;

    if (!customerId) return res.status(400).json({ success: false, message: "Customer ID is required" });
    if (!moment(startDate, "YYYY-MM-DD", true).isValid() || !moment(endDate, "YYYY-MM-DD", true).isValid()) {
      return res.status(400).json({ success: false, message: "Invalid date format." });
    }

    const dateFilter = {
      order_received_date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    };

    // Populate meal_id with name and calorie_count
    const orders = await Order.find({ customer: customerId, order_status: "Completed", ...dateFilter })
      .populate("cart_items.meal_id", "name calorie_count")
      .exec();

    const detailedMeals = [];
    const dailyCalories = {};

    for (const order of orders) {
      const orderDate = moment(order.order_received_date).format("YYYY-MM-DD");

      for (const item of order.cart_items) {
        const mealName = item.meal_id?.name || item.meal_name || "Unknown Meal"; // Use item.meal_name if available
        const calories = item.meal_id?.calorie_count || 0;

        detailedMeals.push({
          mealName,
          date: orderDate,
          calories: calories * item.quantity,
        });

        dailyCalories[orderDate] = (dailyCalories[orderDate] || 0) + (calories * item.quantity);
      }
    }

    const highestCaloriesDay = Object.entries(dailyCalories).reduce(
      (max, [day, calories]) => calories > max.calories ? { day, calories } : max,
      { day: '', calories: 0 }
    );

    res.status(200).json({ detailedMeals, highestCaloriesDay });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Failed to generate report", error: error.message });
  }
};

  
  // Download PDF report
export const downloadCalorieReportPDF = async (req, res) => {
    try {
      const { customerId } = req.params;
      const { startDate, endDate, mode = "week" } = req.query;
  
      if (!customerId) return res.status(400).json({ message: "Customer ID is required" });
      if (!startDate || !endDate) return res.status(400).json({ message: "Start and End dates are required" });
  
      const orders = await Order.find({
        customer: customerId,
        order_status: "Completed",
        order_received_date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      }).populate("cart_items.meal_id");
      
      if (!orders.length) {
        return res.status(404).json({ message: "No orders found for the selected dates" });
      }
  
      const meals = [];
      const dailyCalories = {};
  
      orders.forEach(order => {
        const date = moment(order.order_received_date).format("YYYY-MM-DD");
  
        order.cart_items.forEach(item => {
          const mealName = item.meal_name || "Unknown Meal"; // Use item.meal_name
          const calories = item.meal_id?.calorie_count || 0;
          const totalCalories = calories * item.quantity;
  
          meals.push({ mealName, date, calories: totalCalories });
  
          dailyCalories[date] = (dailyCalories[date] || 0) + totalCalories;
        });
      });
  
      const highestCaloriesDay = Object.entries(dailyCalories).reduce(
        (max, [day, calories]) => calories > max.calories ? { day, calories } : max,
        { day: '', calories: 0 }
      );
  
      const doc = new PDFDocument({ margin: 40, size: "A4" });
  
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=Calorie_Report_${startDate}_to_${endDate}.pdf`);
  
      doc.fontSize(20).text("Calorie Consumption Report", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(12).text(`Duration: ${startDate} to ${endDate}`, { align: "center" });
      doc.text(`Mode: ${mode}`, { align: "center" });
      doc.moveDown(1);
  
      doc.fontSize(16).text("Meals Consumed", { underline: true });
      doc.moveDown(0.5);
  
      // Table Layout
      const tableTop = doc.y;
      const columnWidths = { mealName: 200, date: 150, calories: 100 };
      const tableLeft = 50;
  
      // Draw table headers
      doc.rect(tableLeft, tableTop, columnWidths.mealName, 20).stroke();
      doc.rect(tableLeft + columnWidths.mealName, tableTop, columnWidths.date, 20).stroke();
      doc.rect(tableLeft + columnWidths.mealName + columnWidths.date, tableTop, columnWidths.calories, 20).stroke();
  
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text("Meal Name", tableLeft + 5, tableTop + 5);
      doc.text("Date", tableLeft + columnWidths.mealName + 5, tableTop + 5);
      doc.text("Calories", tableLeft + columnWidths.mealName + columnWidths.date + 5, tableTop + 5);
  
      let rowTop = tableTop + 20;
  
      doc.font('Helvetica');
      meals.forEach(meal => {
        doc.rect(tableLeft, rowTop, columnWidths.mealName, 20).stroke();
        doc.rect(tableLeft + columnWidths.mealName, rowTop, columnWidths.date, 20).stroke();
        doc.rect(tableLeft + columnWidths.mealName + columnWidths.date, rowTop, columnWidths.calories, 20).stroke();
  
        doc.text(meal.mealName, tableLeft + 5, rowTop + 5, { width: columnWidths.mealName - 10, ellipsis: true });
        doc.text(meal.date, tableLeft + columnWidths.mealName + 5, rowTop + 5);
        doc.text(meal.calories.toString(), tableLeft + columnWidths.mealName + columnWidths.date + 5, rowTop + 5);
  
        rowTop += 20;
      });
  
      doc.moveDown(3);
      doc.fontSize(16).text("Day with Highest Calories", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).text(`Date: ${highestCaloriesDay.day}`);
      doc.text(`Calories: ${highestCaloriesDay.calories}`);
  
      doc.end();
      doc.pipe(res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to download calorie report PDF" });
    }
  };
  