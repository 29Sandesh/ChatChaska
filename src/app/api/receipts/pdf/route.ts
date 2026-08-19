import { NextResponse } from 'next/server';
import { generateReceiptPDF, saveBillPdfLocally } from '@/lib/pdf-receipt';
import { getAllBills } from '@/lib/database';
import { BillData } from '@/components/pos/ReceiptPreviewModal';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { billId, billData } = body;

    let targetBillData: BillData | null = billData || null;

    if (!targetBillData && billId) {
      const allBills = getAllBills();
      const matched = allBills.find((b) => b.id === billId);
      if (matched) {
        targetBillData = {
          billId: matched.id,
          orderId: matched.orderId,
          tokenNumber: matched.tokenNumber || '01',
          restaurantName: matched.restaurantName || 'ChatChaska Cafe',
          gstin: matched.gstin || '27AABCM1234A1Z5',
          fssai: matched.fssai || '11521001000123',
          address: matched.address || 'MG Road, Main Market',
          date: new Date(matched.createdAt).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          tableNumber: matched.tableNumber,
          waiterName: matched.waiterName,
          customerName: matched.customerName,
          customerPhone: matched.customerPhone,
          items: matched.items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            unitPrice: i.unitPrice || 0,
            lineTotal: i.lineTotal || 0,
          })),
          subtotal: matched.subtotal,
          discountAmount: matched.discountAmount,
          cgstRate: 2.5,
          sgstRate: 2.5,
          cgstAmount: matched.cgstAmount,
          sgstAmount: matched.sgstAmount,
          grandTotal: matched.grandTotal,
          paymentMode: (matched.paymentMode || 'CASH').toUpperCase(),
        };
      }
    }

    if (!targetBillData) {
      return NextResponse.json({ error: 'Bill data not found' }, { status: 404 });
    }

    const pdfBuffer = generateReceiptPDF(targetBillData);
    const localFilePath = saveBillPdfLocally(targetBillData.billId, pdfBuffer);

    // Return downloadable PDF response with headers
    return new Response(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${targetBillData.billId}.pdf"`,
        'X-Local-Path': localFilePath,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate PDF';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
