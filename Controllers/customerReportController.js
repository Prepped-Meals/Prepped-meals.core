import PDFDocument from 'pdfkit';
import Customer from '../Models/customerModel.js';
import moment from 'moment';

// Controller function to generate and send the report as PDF
export const generateRegistrationReport = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Please provide both start and end dates.' });
  }

  try {
    const start = moment(startDate, 'YYYY-MM-DD').startOf('day').toDate();
    const end = moment(endDate, 'YYYY-MM-DD').endOf('day').toDate();

    const customers = await Customer.find({
      createdAt: { $gte: start, $lte: end }
    });

    const totalRegistrations = customers.length;

    const pdfDoc = await generatePDFReport(customers, totalRegistrations, startDate, endDate);

    res.contentType('application/pdf');
    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error generating the report.' });
  }
};

async function generatePDFReport(customers, totalRegistrations, startDate, endDate) {
  const doc = new PDFDocument({ margin: 50 });

  // Title
  doc.fontSize(20).font('Helvetica-Bold').text('Customer Registration Report', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica').text(`Date Range: ${startDate} to ${endDate}`, { align: 'center' });

  doc.moveDown(2);

  const tableTop = doc.y;
  const columnWidths = [200, 180, 120];
  const startX = 50;

  // Draw table header background
  doc.rect(startX, tableTop, columnWidths.reduce((a, b) => a + b, 0), 25)
    .fill('#f0f0f0');

  // Write headers
  doc.fillColor('#000').fontSize(12).font('Helvetica-Bold');
  const headers = ['Name', 'Email', 'Registration Date'];
  headers.forEach((header, index) => {
    doc.text(header, startX + columnWidths.slice(0, index).reduce((a, b) => a + b, 0) + 5, tableTop + 7, {
      width: columnWidths[index] - 10,
      align: 'left'
    });
  });

  let y = tableTop + 30;

  // Draw each customer row
  doc.font('Helvetica').fontSize(10).fillColor('#000');
  customers.forEach((customer) => {
    const fullName = `${customer.f_name} ${customer.l_name}`;
    const regDate = moment(customer.createdAt).format('YYYY-MM-DD');
    const row = [fullName, customer.email, regDate];

    row.forEach((data, index) => {
      doc.text(data, startX + columnWidths.slice(0, index).reduce((a, b) => a + b, 0) + 5, y + 5, {
        width: columnWidths[index] - 10,
        align: 'left'
      });
    });

    y += 25; // Move to next row
  });

  // Draw a line under the table
  doc.moveTo(startX, y)
    .lineTo(startX + columnWidths.reduce((a, b) => a + b, 0), y)
    .stroke();

  // Total Registrations
  doc.moveDown(2).fontSize(12).font('Helvetica-Bold');
  doc.text(`Total Registrations: ${totalRegistrations}`, startX, y + 20, { align: 'right' });

  return doc;
}

export const getRegistrationReportData = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Please provide both start and end dates.' });
  }

  try {
    const start = moment(startDate, 'YYYY-MM-DD').startOf('day').toDate();
    const end = moment(endDate, 'YYYY-MM-DD').endOf('day').toDate();

    const customers = await Customer.find({
      createdAt: { $gte: start, $lte: end }
    });

    const totalRegistrations = customers.length;

    res.json({ customers, totalRegistrations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching registration data.' });
  }
};
