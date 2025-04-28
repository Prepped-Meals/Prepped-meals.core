import express from 'express';
import { generateRegistrationReport, getRegistrationReportData } from '../Controllers/customerReportController.js'; // Correct path

const router = express.Router();

// Route to generate the PDF report
router.get('/registration-report', generateRegistrationReport);

// Route to get the customer registration data in JSON format (for preview)
router.get('/registration-report-data', getRegistrationReportData);

export default router;
