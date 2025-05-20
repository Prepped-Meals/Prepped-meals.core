import Order from "../Models/orderModel.js";
import moment from "moment";
import PDFDocument from "pdfkit";
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

// Helper functions
const parseCalorieRange = (range) => {
  if (range === 'all') return null;
  if (range === '401') return { $gt: 400 };
  const [min, max] = range.split('-').map(Number);
  return { $gte: min, $lte: max };
};

const calculateAverageCalories = (dailyCalories) => {
  const days = Object.entries(dailyCalories).filter(([_, calories]) => calories > 0);
  if (days.length === 0) return 0;
  const total = days.reduce((sum, [_, calories]) => sum + calories, 0);
  return Math.round(total / days.length);
};

const generateTrendData = (dailyCalories) => {
  return Object.entries(dailyCalories)
    .filter(([_, calories]) => calories > 0)
    .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
    .map(([date, calories]) => ({ date, calories }));
};

const getCalorieInsights = (averageCalories) => {
  if (averageCalories < 1200) return "Your average intake is very low. Consider consulting a nutritionist.";
  if (averageCalories < 1600) return "Your intake suggests a light eating pattern, appropriate for weight loss.";
  if (averageCalories < 2000) return "Moderate intake typical for moderately active individuals.";
  if (averageCalories < 2500) return "Moderately high intake common for active individuals.";
  if (averageCalories < 3000) return "High intake typical for very active individuals or athletes.";
  return "Very high intake. Monitor carefully if intentional for weight gain or intense training.";
};

const generateChartImage = async (chartData, type = 'bar', width = 800, height = 400) => {
  const configuration = {
    type,
    data: chartData.data,
    options: {
      ...chartData.options,
      plugins: {
        legend: { position: 'top' },
        title: { 
          display: true, 
          text: chartData.options?.title?.text || `${type === 'bar' ? 'Calories by Meal' : 'Daily Trend'}`,
          font: { size: 16 }
        }
      }
    }
  };

  const chartRenderer = new ChartJSNodeCanvas({ width, height });
  return await chartRenderer.renderToBuffer(configuration);
};

const getDateRange = (rangeType) => {
  const today = moment().startOf('day');
  let startDate, endDate;

  switch (rangeType) {
    case 'today':
      startDate = today.clone();
      endDate = today.clone().endOf('day');
      break;
    case 'yesterday':
      startDate = today.clone().subtract(1, 'days').startOf('day');
      endDate = today.clone().subtract(1, 'days').endOf('day');
      break;
    case 'last7days':
      startDate = today.clone().subtract(6, 'days').startOf('day');
      endDate = today.clone().endOf('day');
      break;
    case 'last30days':
      startDate = today.clone().subtract(29, 'days').startOf('day');
      endDate = today.clone().endOf('day');
      break;
    case 'thismonth':
      startDate = today.clone().startOf('month').startOf('day');
      endDate = today.clone().endOf('day');
      break;
    case 'lastmonth':
      startDate = today.clone().subtract(1, 'months').startOf('month').startOf('day');
      endDate = today.clone().subtract(1, 'months').endOf('month').endOf('day');
      break;
    default: // custom
      return null;
  }

  return {
    startDate: startDate.toDate(),
    endDate: endDate.toDate()
  };
};

const ensureDateRangeCoverage = (dailyCalories, dateRangeType, startDate, endDate) => {
  const datesToEnsure = [];
  const today = moment().startOf('day');

  if (dateRangeType === 'today') {
    datesToEnsure.push(today.format('YYYY-MM-DD'));
  } else if (dateRangeType === 'yesterday') {
    datesToEnsure.push(today.clone().subtract(1, 'days').format('YYYY-MM-DD'));
  } else if (dateRangeType === 'last7days') {
    for (let i = 0; i < 7; i++) {
      datesToEnsure.push(today.clone().subtract(i, 'days').format('YYYY-MM-DD'));
    }
  } else if (dateRangeType === 'last30days') {
    for (let i = 0; i < 30; i++) {
      datesToEnsure.push(today.clone().subtract(i, 'days').format('YYYY-MM-DD'));
    }
  } else if (dateRangeType === 'thismonth') {
    const startOfMonth = today.clone().startOf('month');
    const daysInMonth = today.daysInMonth();
    for (let i = 0; i < daysInMonth; i++) {
      datesToEnsure.push(startOfMonth.clone().add(i, 'days').format('YYYY-MM-DD'));
    }
  } else if (dateRangeType === 'lastmonth') {
    const lastMonth = today.clone().subtract(1, 'months');
    const daysInMonth = lastMonth.daysInMonth();
    for (let i = 0; i < daysInMonth; i++) {
      datesToEnsure.push(lastMonth.clone().startOf('month').add(i, 'days').format('YYYY-MM-DD'));
    }
  } else if (dateRangeType === 'custom' && startDate && endDate) {
    const start = moment(startDate);
    const end = moment(endDate);
    const daysDiff = end.diff(start, 'days');
    
    for (let i = 0; i <= daysDiff; i++) {
      datesToEnsure.push(start.clone().add(i, 'days').format('YYYY-MM-DD'));
    }
  }

  datesToEnsure.forEach(date => {
    if (!dailyCalories[date]) {
      dailyCalories[date] = 0;
    }
  });

  return dailyCalories;
};

// Main controller functions
export const generateCalorieReport = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { startDate, endDate, calorieRange = "all", dateRangeType = "custom" } = req.query;

    if (!customerId) return res.status(400).json({ success: false, message: "Customer ID required" });

    // Handle predefined date ranges
    let dateFilter = {};
    if (dateRangeType && dateRangeType !== 'custom') {
      const range = getDateRange(dateRangeType);
      if (range) {
        dateFilter = {
          order_received_date: { 
            $gte: range.startDate, 
            $lte: range.endDate 
          }
        };
      }
    } else {
      // Validate custom dates
      if (!moment(startDate, "YYYY-MM-DD", true).isValid() || !moment(endDate, "YYYY-MM-DD", true).isValid()) {
        return res.status(400).json({ success: false, message: "Invalid date format" });
      }
      
      const today = moment().endOf('day');
      const selectedStart = moment(startDate);
      const selectedEnd = moment(endDate);
      
      if (selectedStart.isAfter(today) || selectedEnd.isAfter(today)) {
        return res.status(400).json({ success: false, message: "Cannot select dates in the future" });
      }
      
      dateFilter = {
        order_received_date: { 
          $gte: new Date(startDate), 
          $lte: new Date(endDate) 
        }
      };
    }

    const orders = await Order.find({ customer: customerId, order_status: "Completed", ...dateFilter })
      .populate("cart_items.meal_id", "name calorie_count")
      .exec();

    // Process all meals first - filter out 0 calorie meals immediately
    const allMeals = orders.flatMap(order => {
      const orderDate = moment(order.order_received_date).format("YYYY-MM-DD");
      return order.cart_items
        .map(item => {
          const mealName = item.meal_id?.name || item.meal_name || "Unknown Meal";
          const calories = item.meal_id?.calorie_count || 0;
          const totalCalories = calories * item.quantity;
          return { mealName, date: orderDate, calories: totalCalories };
        })
        .filter(meal => meal.calories > 0); // Filter out 0 calorie meals
    });

    // Calculate daily totals
    const allDailyCalories = {};
    allMeals.forEach(meal => {
      allDailyCalories[meal.date] = (allDailyCalories[meal.date] || 0) + meal.calories;
    });

    // Ensure all dates in the range are represented, even with 0 calories
    const completeDailyCalories = ensureDateRangeCoverage(
      allDailyCalories, 
      dateRangeType, 
      dateRangeType === 'custom' ? startDate : null,
      dateRangeType === 'custom' ? endDate : null
    );

    // Apply calorie range filter
    const rangeFilter = parseCalorieRange(calorieRange);
    let filteredMeals = allMeals;
    let filteredDailyCalories = {};

    if (rangeFilter) {
      filteredMeals = allMeals.filter(meal => {
        if (rangeFilter.$gt) return meal.calories > rangeFilter.$gt;
        return meal.calories >= rangeFilter.$gte && meal.calories <= rangeFilter.$lte;
      });

      // Recalculate daily totals based on filtered meals
      filteredMeals.forEach(meal => {
        filteredDailyCalories[meal.date] = (filteredDailyCalories[meal.date] || 0) + meal.calories;
      });

      // Ensure all dates are represented in filtered data
      Object.keys(completeDailyCalories).forEach(date => {
        if (!filteredDailyCalories[date]) {
          filteredDailyCalories[date] = 0;
        }
      });
    } else {
      filteredDailyCalories = completeDailyCalories;
    }

    const highestCaloriesDay = Object.entries(filteredDailyCalories).reduce(
      (max, [day, calories]) => calories > max.calories ? { day, calories } : max,
      { day: '', calories: 0 }
    );

    const averageCalories = calculateAverageCalories(filteredDailyCalories);
    const trendData = generateTrendData(filteredDailyCalories);
    const insight = getCalorieInsights(averageCalories);

    res.status(200).json({ 
      detailedMeals: filteredMeals,
      highestCaloriesDay,
      averageCalories,
      trendData,
      insight,
      filteredDaysCount: Object.keys(filteredDailyCalories).length
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Failed to generate report", error: error.message });
  }
};

export const downloadCalorieReportPDF = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { startDate, endDate, calorieRange = "all", dateRangeType = "custom" } = req.query;

    if (!customerId) return res.status(400).json({ message: "Customer ID required" });

    // Handle predefined date ranges
    let dateFilter = {};
    if (dateRangeType && dateRangeType !== 'custom') {
      const range = getDateRange(dateRangeType);
      if (range) {
        dateFilter = {
          order_received_date: { 
            $gte: range.startDate, 
            $lte: range.endDate 
          }
        };
      }
    } else {
      if (!startDate || !endDate) return res.status(400).json({ message: "Dates required" });
      
      const today = moment().endOf('day');
      const selectedStart = moment(startDate);
      const selectedEnd = moment(endDate);
      
      if (selectedStart.isAfter(today) || selectedEnd.isAfter(today)) {
        return res.status(400).json({ message: "Cannot select dates in the future" });
      }
      
      dateFilter = {
        order_received_date: { 
          $gte: new Date(startDate), 
          $lte: new Date(endDate) 
        }
      };
    }

    const orders = await Order.find({
      customer: customerId,
      order_status: "Completed",
      ...dateFilter
    }).populate("cart_items.meal_id");
    
    // Process all meals first - filter out 0 calorie meals immediately
    const allMeals = orders.flatMap(order => {
      const date = moment(order.order_received_date).format("YYYY-MM-DD");
      return order.cart_items
        .map(item => {
          const mealName = item.meal_name || "Unknown Meal";
          const calories = item.meal_id?.calorie_count || 0;
          const totalCalories = calories * item.quantity;
          return { mealName, date, calories: totalCalories };
        })
        .filter(meal => meal.calories > 0); // Filter out 0 calorie meals
    });

    // Calculate daily totals
    const allDailyCalories = {};
    allMeals.forEach(meal => {
      allDailyCalories[meal.date] = (allDailyCalories[meal.date] || 0) + meal.calories;
    });

    // Ensure all dates in the range are represented, even with 0 calories
    const completeDailyCalories = ensureDateRangeCoverage(
      allDailyCalories, 
      dateRangeType, 
      dateRangeType === 'custom' ? startDate : null,
      dateRangeType === 'custom' ? endDate : null
    );

    // Apply calorie range filter
    const rangeFilter = parseCalorieRange(calorieRange);
    let filteredMeals = allMeals;
    let filteredDailyCalories = {};

    if (rangeFilter) {
      filteredMeals = allMeals.filter(meal => {
        if (rangeFilter.$gt) return meal.calories > rangeFilter.$gt;
        return meal.calories >= rangeFilter.$gte && meal.calories <= rangeFilter.$lte;
      });

      // Recalculate daily totals based on filtered meals
      filteredMeals.forEach(meal => {
        filteredDailyCalories[meal.date] = (filteredDailyCalories[meal.date] || 0) + meal.calories;
      });

      // Ensure all dates are represented in filtered data
      Object.keys(completeDailyCalories).forEach(date => {
        if (!filteredDailyCalories[date]) {
          filteredDailyCalories[date] = 0;
        }
      });
    } else {
      filteredDailyCalories = completeDailyCalories;
    }

    const highestCaloriesDay = Object.entries(filteredDailyCalories).reduce(
      (max, [day, calories]) => calories > max.calories ? { day, calories } : max,
      { day: '', calories: 0 }
    );

    const averageCalories = calculateAverageCalories(filteredDailyCalories);
    const trendData = generateTrendData(filteredDailyCalories);
    const insight = getCalorieInsights(averageCalories);

    // Prepare charts
    const barChartConfig = {
      data: {
        labels: filteredMeals.map(item => item.date),
        datasets: [{
          label: "Calories",
          data: filteredMeals.map(item => item.calories),
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        }]
      },
      options: { 
        responsive: false,
        title: {
          text: `Meal Calories (${calorieRange === 'all' ? 'All' : calorieRange === '401' ? '>400' : calorieRange} kcal)`
        }
      }
    };

    const lineChartConfig = {
      data: {
        labels: trendData.map(item => item.date),
        datasets: [{
          label: "Daily Calories",
          data: trendData.map(item => item.calories),
          borderColor: "rgba(153, 102, 255, 1)",
          backgroundColor: "rgba(153, 102, 255, 0.2)",
          borderWidth: 2,
          tension: 0.1,
          fill: true
        }]
      },
      options: { 
        responsive: false,
        title: {
          text: `Daily Trend (${calorieRange === 'all' ? 'All' : calorieRange === '401' ? '>400' : calorieRange} kcal)`
        }
      }
    };

    const [barChartImage, lineChartImage] = await Promise.all([
      generateChartImage(barChartConfig, 'bar'),
      generateChartImage(lineChartConfig, 'line')
    ]);

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    
    // Determine filename based on range type
    let filename;
    if (dateRangeType !== 'custom') {
      filename = `Calorie_Report_${dateRangeType}_${calorieRange}.pdf`;
    } else {
      filename = `Calorie_Report_${startDate}_to_${endDate}_${calorieRange}.pdf`;
    }
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

    // Header
    doc.fontSize(20).text("Calorie Consumption Report", { align: "center" });
    doc.moveDown(0.5);
    
    if (dateRangeType !== 'custom') {
      doc.fontSize(12).text(`Duration: ${dateRangeType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}`, { align: "center" });
    } else {
      doc.fontSize(12).text(`Duration: ${startDate} to ${endDate}`, { align: "center" });
    }
    
    doc.text(`Calorie Range: ${calorieRange === 'all' ? 'All' : calorieRange === '401' ? '>400' : calorieRange} kcal`, { align: "center" });
    doc.moveDown(1);

    // Summary
    doc.fontSize(14).text("Summary", { align: "left", underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Average Daily Calories: ${averageCalories} kcal (${insight})`);
    doc.text(`Highest Day: ${highestCaloriesDay.day} - ${highestCaloriesDay.calories} kcal`);
    doc.text(`Days Analyzed: ${Object.keys(filteredDailyCalories).length}`);
    doc.moveDown(1);

    // Guidelines
    doc.fontSize(12).text("General Guidelines:", { underline: true });
    doc.fontSize(10).text("- Sedentary: 1,600-2,000 kcal", { indent: 20 });
    doc.text("- Moderate activity: 2,000-2,400 kcal", { indent: 20 });
    doc.text("- Active: 2,400-3,000 kcal", { indent: 20 });
    doc.text("- Very active: 3,000+ kcal", { indent: 20 });
    doc.moveDown(1);

    // Charts
    doc.fontSize(14).text("Visualizations", { align: "left", underline: true });
    doc.moveDown(0.5);
    
    doc.fontSize(12).text("Daily Trend:");
    doc.image(lineChartImage, { fit: [500, 300], align: 'center' });
    doc.moveDown(1);
    
    doc.fontSize(12).text("Meal Breakdown:");
    doc.image(barChartImage, { fit: [500, 300], align: 'center' });
    doc.moveDown(1);

    // Detailed Data
    doc.fontSize(14).text("Meal Details", { align: "left", underline: true });
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const columnWidths = { mealName: 200, date: 150, calories: 100 };
    const tableLeft = 50;

    // Table headers
    doc.rect(tableLeft, tableTop, columnWidths.mealName, 20).stroke();
    doc.rect(tableLeft + columnWidths.mealName, tableTop, columnWidths.date, 20).stroke();
    doc.rect(tableLeft + columnWidths.mealName + columnWidths.date, tableTop, columnWidths.calories, 20).stroke();

    doc.fontSize(12).font('Helvetica-Bold');
    doc.text("Meal", tableLeft + 5, tableTop + 5);
    doc.text("Date", tableLeft + columnWidths.mealName + 5, tableTop + 5);
    doc.text("Calories", tableLeft + columnWidths.mealName + columnWidths.date + 5, tableTop + 5);

    let rowTop = tableTop + 20;
    doc.font('Helvetica');

    filteredMeals.forEach(meal => {
      if (rowTop > doc.page.height - 100) {
        doc.addPage();
        rowTop = 50;
      }

      doc.rect(tableLeft, rowTop, columnWidths.mealName, 20).stroke();
      doc.rect(tableLeft + columnWidths.mealName, rowTop, columnWidths.date, 20).stroke();
      doc.rect(tableLeft + columnWidths.mealName + columnWidths.date, rowTop, columnWidths.calories, 20).stroke();

      doc.text(meal.mealName, tableLeft + 5, rowTop + 5, { width: columnWidths.mealName - 10, ellipsis: true });
      doc.text(meal.date, tableLeft + columnWidths.mealName + 5, rowTop + 5);
      doc.text(meal.calories.toString(), tableLeft + columnWidths.mealName + columnWidths.date + 5, rowTop + 5);

      rowTop += 20;
    });

    doc.end();
    doc.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
};