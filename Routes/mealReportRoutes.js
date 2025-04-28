import express from 'express';
import PDFDocument from 'pdfkit'; // PDF generation library
import Meal from '../Models/mealModel.js';  // Correct the model path if necessary

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
router.get('/moving-meals-pdf', async (req, res) => {
  try {
    const meals = await Meal.find();

    const fastMovingMeals = meals.filter(meal => meal.total_sold >= FAST_MOVING_THRESHOLD);
    const slowMovingMeals = meals.filter(meal => meal.total_sold < FAST_MOVING_THRESHOLD);

    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="moving-meals-report.pdf"');

    doc.pipe(res);

    // Title
    doc.fontSize(18).font('Helvetica-Bold').text('Fast-Moving & Slow-Moving Meals Report', { align: 'center' });
    doc.moveDown(2);

    // Table setup
    const header = ['Meal ID', 'Meal Name', 'Total Sold', 'Moving Status'];
    const totalTableWidth = 500;
    const numColumns = header.length;
    const columnWidth = totalTableWidth / numColumns;
    const rowHeight = 40;  // Increased row height to make the cells larger
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

export default router;
