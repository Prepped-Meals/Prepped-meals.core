import Order from "../Models/orderModel.js";
import PDFDocument from "pdfkit"; // Ensure pdfkit is installed

export const generateOrderStatusReport = async (req, res) => {
    try {
        // Step 1: Fetch all orders
        const orders = await Order.find()
            .populate("customer", "f_name l_name")
            .lean();

        const doc = new PDFDocument({ margin: 40 });
        let buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            res
              .writeHead(200, {
                  'Content-Type': 'application/pdf',
                  'Content-Disposition': 'attachment; filename=order_status_report.pdf',
                  'Content-Length': pdfData.length,
              })
              .end(pdfData);
        });

        // Title Section
        doc.fontSize(24).text('Order Status Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(2);

        // Table Header
        const tableTop = 150;
        const itemX = 50;
        const customerX = 120;
        const statusX = 320;
        const dateX = 450;

        doc.fontSize(12);
        doc.text('Order #', itemX, tableTop, { bold: true });
        doc.text('Customer', customerX, tableTop);
        doc.text('Order Status', statusX, tableTop);
        doc.text('Received Date', dateX, tableTop);

        // Draw header line
        doc.moveTo(50, tableTop + 20)
          .lineTo(550, tableTop + 20)
          .stroke();

        // List all orders
        let position = tableTop + 30;
        const rowHeight = 20; // Set a consistent row height
        const pageHeight = doc.page.height - doc.page.margins.bottom; // Page height with margin
        orders.forEach((order, index) => {
            const customerName = order.customer ? `${order.customer.f_name} ${order.customer.l_name}` : 'N/A';
            const receivedDate = order.order_received_date ? new Date(order.order_received_date).toLocaleDateString() : 'N/A';

            // If the next row goes beyond the page height, create a new page
            if (position + rowHeight > pageHeight) {
                doc.addPage();
                position = 50; // Reset position after adding a new page
            }

            doc
              .fontSize(10)
              .text(index + 1, itemX, position)
              .text(customerName, customerX, position)
              .text(order.order_status, statusX, position)
              .text(receivedDate, dateX, position);
            position += rowHeight; // move to next row
        });

        // Add some space between the table and the order summary
        doc.moveDown(2); // This moves the cursor down to create space (adjust the number for more/less space)

        // Summary Section (Counts by Status)
        const statusCounts = { Pending: 0, Completed: 0, Cancelled: 0 };
        orders.forEach(order => {
            if (statusCounts[order.order_status] !== undefined) {
                statusCounts[order.order_status]++;
            }
        });

        // Title for summary - Centered manually based on the page width
        const pageWidth = doc.page.width;
        const titleWidth = doc.widthOfString('Summary of Order Status');
        const titleX = (pageWidth - titleWidth) / 2; // Calculate center position
        doc.fontSize(18).text('Summary of Orders', titleX, doc.y, { underline: true });
        doc.moveDown(1);

        // Summary Content - Centered manually based on the page width
        const text1 = `Total Pending Orders: ${statusCounts.Pending}`;
        const text2 = `Total Completed Orders: ${statusCounts.Completed}`;
        const text3 = `Total Cancelled Orders: ${statusCounts.Cancelled}`;

        const textWidth1 = doc.widthOfString(text1);
        const textWidth2 = doc.widthOfString(text2);
        const textWidth3 = doc.widthOfString(text3);

        const x1 = (pageWidth - textWidth1) / 2;
        const x2 = (pageWidth - textWidth2) / 2;
        const x3 = (pageWidth - textWidth3) / 2;

        const yStart = doc.y; // Capture the starting Y position

        // Draw rectangle around the summary
        const rectX = 40; // X position for rectangle (with margin)
        const rectWidth = pageWidth - 2 * 40; // Rectangle width (page width - margins)
        const rectY = yStart - 10; // Slightly above the summary to create spacing from title
        const rectHeight = 90; // Height of the rectangle (enough to cover the summary)

        // Draw rectangle around the summary section
        doc.rect(rectX, rectY, rectWidth, rectHeight)
           .stroke(); // Outline the rectangle


        // Place the summary content inside the rectangle
        doc.fontSize(12)
           .text(text1, x1, yStart)
           .moveDown(0.8) // Add some space between the lines
           .text(text2, x2, doc.y)
           .moveDown(0.8)
           .text(text3, x3, doc.y);

        doc.end();
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to generate order status report" });
    }
};
