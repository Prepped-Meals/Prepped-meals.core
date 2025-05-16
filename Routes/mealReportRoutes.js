import express from 'express';
import PDFDocument from 'pdfkit'; // PDF generation library
import Meal from '../Models/mealModel.js';  
import Order from '../Models/orderModel.js';

const router = express.Router();

// Set the threshold for Fast-Moving Meals (10 sales)
const FAST_MOVING_THRESHOLD = 10;

// Helper function to draw a row with borders
const drawRow = (doc, row, columnWidth, yPosition, rowHeight) => {
  row.forEach((cell, index) => {
    const x = 50 + (index * columnWidth);
    // Draw the cell border
    doc.rect(x, yPosition, columnWidth, rowHeight).stroke();
    
    // Vertically center the text inside the cell
    const textY = yPosition + (rowHeight / 2) - 6; // Fine-tuned adjustment
    doc.text(cell, x, textY, { width: columnWidth, align: 'center' });
  });
};

// =================== PDF ROUTES =================== //

// Low Stock PDF Report
router.get('/low-stock-pdf', async (req, res) => {
  try {
    const meals = await Meal.find();
    const lowStockMeals = meals.filter(meal => meal.meal_stock < 10);

    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="low-stock-report.pdf"');

    doc.pipe(res);

    // Title
    doc.fontSize(18).font('Helvetica-Bold').text('Low Stock Meals Report', { align: 'center' });
    doc.moveDown(2);

    // Table setup
    const header = ['Meal ID', 'Meal Name', 'Meal Stock'];
    const totalTableWidth = 400;
    const numColumns = header.length;
    const columnWidth = totalTableWidth / numColumns;
    const rowHeight = 40;  // Increased row height to make the cells larger
    let y = doc.y;

    // Draw header
    doc.fontSize(12).font('Helvetica-Bold');
    drawRow(doc, header, columnWidth, y, rowHeight);
    y += rowHeight;

    // Draw table rows
    doc.fontSize(12).font('Helvetica');
    lowStockMeals.forEach(meal => {
      const row = [
        meal.meal_id,
        meal.meal_name,
        meal.meal_stock.toString(),
      ];
      drawRow(doc, row, columnWidth, y, rowHeight);
      y += rowHeight;
    });

    doc.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Combined Fast-Moving & Slow-Moving PDF Report
// router.get('/moving-meals-pdf', async (req, res) => {
//   try {
//     const meals = await Meal.find();

//     const fastMovingMeals = meals.filter(meal => meal.total_sold >= FAST_MOVING_THRESHOLD);
//     const slowMovingMeals = meals.filter(meal => meal.total_sold < FAST_MOVING_THRESHOLD);

//     const doc = new PDFDocument();

//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', 'attachment; filename="moving-meals-report.pdf"');

//     doc.pipe(res);

//     // Title
//     doc.fontSize(18).font('Helvetica-Bold').text('Fast-Moving & Slow-Moving Meals Report', { align: 'center' });
//     doc.moveDown(2);

//     // Table setup
//     const header = ['Meal ID', 'Meal Name', 'Total Sold', 'Moving Status'];
//     const totalTableWidth = 500;
//     const numColumns = header.length;
//     const columnWidth = totalTableWidth / numColumns;
//     const rowHeight = 40;  // Increased row height to make the cells larger
//     let y = doc.y;

//     // Draw header
//     doc.fontSize(12).font('Helvetica-Bold');
//     drawRow(doc, header, columnWidth, y, rowHeight);
//     y += rowHeight;

//     // Draw Fast-Moving Meals
//     doc.fontSize(12).font('Helvetica');
//     fastMovingMeals.forEach(meal => {
//       const row = [
//         meal.meal_id,
//         meal.meal_name,
//         meal.total_sold.toString(),
//         'Fast-Moving',
//       ];
//       drawRow(doc, row, columnWidth, y, rowHeight);
//       y += rowHeight;
//     });

//     // Draw Slow-Moving Meals
//     doc.fontSize(12).font('Helvetica');
//     slowMovingMeals.forEach(meal => {
//       const row = [
//         meal.meal_id,
//         meal.meal_name,
//         meal.total_sold.toString(),
//         'Slow-Moving',
//       ];
//       drawRow(doc, row, columnWidth, y, rowHeight);
//       y += rowHeight;
//     });

//     doc.end();

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server Error' });
//   }
// });

// Combined Fast-Moving & Slow-Moving PDF Report (with optional date filtering)
router.get('/moving-meals-pdf', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let fastMovingMeals = [];
    let slowMovingMeals = [];

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include whole end day

      const salesData = await Order.aggregate([
        { $match: { order_received_date: { $gte: start, $lte: end } } },
        { $unwind: '$cart_items' },
        {
          $group: {
            _id: '$cart_items.meal_id',
            totalSold: { $sum: '$cart_items.quantity' }
          }
        },
        {
          $lookup: {
            from: 'meals',
            localField: '_id',
            foreignField: '_id',
            as: 'meal'
          }
        },
        { $unwind: '$meal' },
        {
          $project: {
            meal_id: '$meal.meal_id',
            meal_name: '$meal.meal_name',
            total_sold: '$totalSold'
          }
        }
      ]);

      fastMovingMeals = salesData.filter(m => m.total_sold >= FAST_MOVING_THRESHOLD);
      slowMovingMeals = salesData.filter(m => m.total_sold < FAST_MOVING_THRESHOLD);
    } else {
      const meals = await Meal.find();
      fastMovingMeals = meals.filter(meal => meal.total_sold >= FAST_MOVING_THRESHOLD);
      slowMovingMeals = meals.filter(meal => meal.total_sold < FAST_MOVING_THRESHOLD);
    }

    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="moving-meals-report.pdf"');

    doc.pipe(res);

    // Title
    let title = 'Fast-Moving & Slow-Moving Meals Report';
    if (startDate && endDate) {
      title += ` (${startDate} to ${endDate})`;
    }

    doc.fontSize(18).font('Helvetica-Bold').text(title, { align: 'center' });
    doc.moveDown(2);

    // Table setup
    const header = ['Meal ID', 'Meal Name', 'Total Sold', 'Moving Status'];
    const totalTableWidth = 500;
    const numColumns = header.length;
    const columnWidth = totalTableWidth / numColumns;
    const rowHeight = 40;
    let y = doc.y;

    // Draw header
    doc.fontSize(12).font('Helvetica-Bold');
    drawRow(doc, header, columnWidth, y, rowHeight);
    y += rowHeight;

    // Draw Fast-Moving Meals
    doc.fontSize(12).font('Helvetica');
    fastMovingMeals.forEach(meal => {
      const row = [
        meal.meal_id,
        meal.meal_name,
        meal.total_sold.toString(),
        'Fast-Moving',
      ];
      drawRow(doc, row, columnWidth, y, rowHeight);
      y += rowHeight;
    });

    // Draw Slow-Moving Meals
    doc.fontSize(12).font('Helvetica');
    slowMovingMeals.forEach(meal => {
      const row = [
        meal.meal_id,
        meal.meal_name,
        meal.total_sold.toString(),
        'Slow-Moving',
      ];
      drawRow(doc, row, columnWidth, y, rowHeight);
      y += rowHeight;
    });

    doc.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});


// =================== VIEW REPORTS ROUTES (JSON) =================== //

// Low Stock Meals (JSON for Viewing on Page)
router.get('/low-stock', async (req, res) => {
  try {
    const meals = await Meal.find();
    const lowStockMeals = meals.filter(meal => meal.meal_stock < 10);

    res.json(lowStockMeals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Moving Meals (JSON for Viewing on Page)
router.get('/moving-meals', async (req, res) => {
  try {
    const meals = await Meal.find();

    const fastMovingMeals = meals.filter(meal => meal.total_sold >= FAST_MOVING_THRESHOLD);
    const slowMovingMeals = meals.filter(meal => meal.total_sold < FAST_MOVING_THRESHOLD);

    res.json({ fastMovingMeals, slowMovingMeals });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});


router.get('/moving-meals-by-date', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate query parameters are required' });
    }

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include whole end day

    // Aggregate order data to calculate total sold quantity per meal in date range
    const salesData = await Order.aggregate([
      { $match: { order_received_date: { $gte: start, $lte: end } } },
      { $unwind: '$cart_items' },
      { $group: {
          _id: '$cart_items.meal_id',
          totalSold: { $sum: '$cart_items.quantity' }
      }},
      { $lookup: {
          from: 'meals',
          localField: '_id',
          foreignField: '_id',
          as: 'meal'
      }},
      { $unwind: '$meal' },
      { $project: {
          meal_id: '$meal.meal_id',
          meal_name: '$meal.meal_name',
          total_sold: '$totalSold'
      }}
    ]);

    // Separate fast-moving and slow-moving based on threshold
    const fastMovingMeals = salesData.filter(m => m.total_sold >= FAST_MOVING_THRESHOLD);
    const slowMovingMeals = salesData.filter(m => m.total_sold < FAST_MOVING_THRESHOLD);

    res.json({ fastMovingMeals, slowMovingMeals });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});



export default router;
