import Order from "../Models/orderModel.js";
import PDFDocument from "pdfkit";

export const generateTopCustomersReport = async (req, res) => {
    try {
        const orders = await Order.find()
          .populate('customer')
          .lean();

        const customerMap = {};

        orders.forEach(order => {
            const customerId = order.customer?._id;
            if (customerId) {
                if (!customerMap[customerId]) {
                    customerMap[customerId] = {
                        f_name: order.customer.f_name,
                        cus_id: order.customer.cus_id,
                        orderCount: 0,
                        mealFrequency: {}
                    };
                }
                customerMap[customerId].orderCount += 1;
                order.cart_items.forEach(item => {
                    const mealName = item.meal_name;
                    if (!customerMap[customerId].mealFrequency[mealName]) {
                        customerMap[customerId].mealFrequency[mealName] = 0;
                    }
                    customerMap[customerId].mealFrequency[mealName] += item.quantity;
                });
            }
        });

        const allCustomers = Object.values(customerMap)
            .sort((a, b) => b.orderCount - a.orderCount);

        const doc = new PDFDocument({ margin: 40 });
        let buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            res
              .writeHead(200, {
                  'Content-Type': 'application/pdf',
                  'Content-Disposition': 'attachment; filename=top_customers_report.pdf',
                  'Content-Length': pdfData.length,
              })
              .end(pdfData);
        });

        // Title
        doc.fontSize(24).text('Top Customers Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(2);

        // Table Layout
        const tableTop = 160;
        const itemX = 50;
        const customerX = 100;
        const orderCountX = 300;
        const favoriteMealX = 400;
        const rowHeight = 35; // <-- Increased row height for more space
        let yPosition = tableTop;

        // Draw Table Headers
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text('No.', itemX, yPosition);
        doc.text('Customer Name', customerX, yPosition);
        doc.text('Order Count', orderCountX, yPosition);
        doc.text('Favorite Meal', favoriteMealX, yPosition);

        // Header underline
        yPosition += rowHeight - 20;
        doc.moveTo(40, yPosition)
           .lineTo(570, yPosition)
           .stroke();
        yPosition += 10;

        // Draw Table Rows
        doc.font('Helvetica');
        allCustomers.forEach((customer, index) => {
            const customerName = `${customer.f_name}`;
            let favoriteMeal = 'N/A';

            const meals = Object.entries(customer.mealFrequency);
            if (meals.length > 0) {
                meals.sort((a, b) => b[1] - a[1]);
                favoriteMeal = meals[0][0];
            }

            // Check for page break
            if (yPosition + rowHeight > doc.page.height - 40) {
                doc.addPage();
                yPosition = 50;
            }

            // Draw light gray background for even rows (optional)
            if (index % 2 === 0) {
                doc.rect(40, yPosition - 5, 530, rowHeight - 10)
                   .fillOpacity(0.1)
                   .fillAndStroke("#eeeeee", "#eeeeee");
                doc.fillOpacity(1); // Reset
            }

            // Draw row data
            doc.fontSize(10).fillColor('black');
            doc.text(index + 1, itemX, yPosition);
            doc.text(customerName, customerX, yPosition, { width: 180 });
            doc.text(customer.orderCount.toString(), orderCountX, yPosition, { width: 50, align: 'center' });
            doc.text(favoriteMeal, favoriteMealX, yPosition, { width: 120 });

            yPosition += rowHeight; // Increased row spacing
        });

        doc.end();
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to generate top customers report" });
    }
};
