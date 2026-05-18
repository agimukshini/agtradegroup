import PDFDocument from 'pdfkit';
import { pipeline } from 'stream/promises';
import fs from 'fs';
import path from 'path';

export async function generateInvoice(order: any): Promise<string> {
  const dir = path.join(process.cwd(), 'uploads', 'invoices');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, `invoice-${order.orderNumber}.pdf`);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);

    pipeline(doc, stream).catch(reject);

    // Header
    doc.fontSize(24).text('AgTradeGroup', { align: 'left' });
    doc.fontSize(10).text('Plumbing, Heating & Construction Materials', { align: 'left' });
    doc.moveDown(0.5);
    doc.fontSize(18).text('INVOICE', { align: 'right' });
    doc.moveDown(1);

    // Order info
    doc.fontSize(12).text(`Invoice Number: INV-${order.orderNumber}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('sq-AL')}`);
    doc.text(`Order Number: ${order.orderNumber}`);
    doc.moveDown(1);

    // Customer
    doc.fontSize(12).font('Helvetica-Bold').text('Bill To:');
    doc.font('Helvetica').text(order.customerName);
    doc.text(order.deliveryAddress);
    doc.text(order.deliveryCity);
    doc.text(`Phone: ${order.customerPhone}`);
    doc.text(`Email: ${order.customerEmail}`);
    doc.moveDown(1);

    // Items table header
    const tableTop = doc.y;
    doc.font('Helvetica-Bold').fontSize(10);
    doc.text('Product', 50, tableTop);
    doc.text('Qty', 300, tableTop);
    doc.text('Price', 370, tableTop);
    doc.text('Total', 450, tableTop);
    doc.moveTo(50, tableTop + 15).lineTo(540, tableTop + 15).stroke();

    // Items
    doc.font('Helvetica').fontSize(10);
    let y = tableTop + 25;
    for (const item of order.items) {
      doc.text(item.product.name.substring(0, 35), 50, y);
      doc.text(String(item.quantity), 300, y);
      doc.text(`${item.price} EUR`, 360, y);
      doc.text(`${item.total} EUR`, 445, y);
      y += 20;
    }

    // Totals
    doc.moveTo(50, y + 5).lineTo(540, y + 5).stroke();
    y += 15;
    doc.fontSize(12);
    const vat = Number(order.vatAmount ?? 0);
    doc.text(`Subtotal (excl. VAT): ${order.subtotal} EUR`, 300, y, { align: 'right' });
    let offset = 18;
    if (vat > 0) {
      doc.text(`VAT (TVSH): ${vat} EUR`, 300, y + offset, { align: 'right' });
      offset += 18;
    }
    doc.text(`Shipping: ${order.shippingFee} EUR`, 300, y + offset, { align: 'right' });
    doc.text(`Total: ${order.total} EUR`, 300, y + offset + 18, { align: 'right' });
    doc.fontSize(10);

    // Payment info
    doc.moveDown(2);
    doc.text(`Payment Method: ${order.paymentMethod.replace(/_/g, ' ')}`);
    doc.text(`Payment Status: ${order.paymentStatus}`);
    doc.moveDown(1);
    doc.fontSize(8).text('Thank you for your business! - AgTradeGroup', { align: 'center' });

    doc.end();
    resolve(filePath);
  });
}
