import { jsPDF } from 'jspdf';
import { BillData } from '@/components/pos/ReceiptPreviewModal';
import path from 'path';
import fs from 'fs';

/**
 * Generates an 80mm thermal-style receipt PDF using jsPDF.
 */
export function generateReceiptPDF(bill: BillData): Buffer {
  // 80mm width standard thermal roll, variable height based on item count
  const itemRowsCount = bill.items.length;
  const pageHeight = Math.max(160, 100 + itemRowsCount * 8 + 60); // dynamic height in mm
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, pageHeight],
  });

  const pageWidth = 80;
  let y = 8;

  // Header - Restaurant Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(bill.restaurantName || 'ChatChaska Cafe', pageWidth / 2, y, { align: 'center' });
  y += 5;

  // Subheader - Address & Tax details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  if (bill.address) {
    doc.text(bill.address, pageWidth / 2, y, { align: 'center' });
    y += 4;
  }
  if (bill.gstin) {
    doc.text(`GSTIN: ${bill.gstin}`, pageWidth / 2, y, { align: 'center' });
    y += 4;
  }
  if (bill.fssai) {
    doc.text(`FSSAI: ${bill.fssai}`, pageWidth / 2, y, { align: 'center' });
    y += 4;
  }

  // Divider
  y += 1;
  doc.setLineWidth(0.2);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(5, y, 75, y);
  y += 4;

  // Token & Bill Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  if (bill.tokenNumber) {
    doc.text(`TOKEN #${bill.tokenNumber}`, pageWidth / 2, y, { align: 'center' });
    y += 4;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Bill: ${bill.billId}`, 5, y);
  doc.text(`Date: ${bill.date}`, 75, y, { align: 'right' });
  y += 3.5;

  if (bill.tableNumber || bill.waiterName) {
    doc.text(`Table: ${bill.tableNumber || 'Walk-In'}`, 5, y);
    doc.text(`Staff: ${bill.waiterName || 'POS'}`, 75, y, { align: 'right' });
    y += 3.5;
  }

  if (bill.customerPhone) {
    doc.text(`Customer: ${bill.customerName || 'Guest'} (${bill.customerPhone})`, 5, y);
    y += 3.5;
  }

  // Table Header
  y += 1;
  doc.line(5, y, 75, y);
  y += 3.5;
  doc.setFont('helvetica', 'bold');
  doc.text('Item', 5, y);
  doc.text('Qty x Price', 48, y);
  doc.text('Total', 75, y, { align: 'right' });
  y += 2;
  doc.line(5, y, 75, y);
  y += 4;

  // Items List
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  for (const item of bill.items) {
    const itemName = item.name.length > 22 ? item.name.substring(0, 20) + '..' : item.name;
    doc.text(itemName, 5, y);
    doc.text(`${item.quantity} x ${item.unitPrice}`, 48, y);
    doc.text(`Rs. ${item.lineTotal}`, 75, y, { align: 'right' });
    y += 4;
  }

  // Summary section
  y += 1;
  doc.line(5, y, 75, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', 5, y);
  doc.text(`Rs. ${bill.subtotal}`, 75, y, { align: 'right' });
  y += 3.5;

  if (bill.discountAmount && bill.discountAmount > 0) {
    doc.text('Discount:', 5, y);
    doc.text(`-Rs. ${bill.discountAmount}`, 75, y, { align: 'right' });
    y += 3.5;
  }

  if (bill.cgstAmount && bill.cgstAmount > 0) {
    doc.text(`CGST (${bill.cgstRate || 2.5}%):`, 5, y);
    doc.text(`Rs. ${bill.cgstAmount}`, 75, y, { align: 'right' });
    y += 3.5;
  }

  if (bill.sgstAmount && bill.sgstAmount > 0) {
    doc.text(`SGST (${bill.sgstRate || 2.5}%):`, 5, y);
    doc.text(`Rs. ${bill.sgstAmount}`, 75, y, { align: 'right' });
    y += 3.5;
  }

  if (bill.roundOff && bill.roundOff !== 0) {
    doc.text('Round Off:', 5, y);
    doc.text(`${bill.roundOff > 0 ? '+' : ''}Rs. ${bill.roundOff}`, 75, y, { align: 'right' });
    y += 3.5;
  }

  // Grand Total
  y += 1;
  doc.line(5, y, 75, y);
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('GRAND TOTAL:', 5, y);
  doc.text(`Rs. ${bill.grandTotal}`, 75, y, { align: 'right' });
  y += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Payment Mode: ${bill.paymentMode || 'CASH'}`, 5, y);
  y += 5;

  // Footer greeting
  doc.line(5, y, 75, y);
  y += 4;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Thank You! Visit Again', pageWidth / 2, y, { align: 'center' });

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}

/**
 * Saves generated PDF into the local filesystem archive: /bills_pdf/<billId>.pdf
 */
export function saveBillPdfLocally(billId: string, pdfBuffer: Buffer): string {
  const billsDir = path.join(process.cwd(), 'bills_pdf');
  if (!fs.existsSync(billsDir)) {
    fs.mkdirSync(billsDir, { recursive: true });
  }

  const filePath = path.join(billsDir, `${billId}.pdf`);
  fs.writeFileSync(filePath, pdfBuffer);
  return filePath;
}
