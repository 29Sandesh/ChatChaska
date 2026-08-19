import { NextResponse } from 'next/server';
import { Bill } from '@/types';
import { getAllBills, saveBill, updateBillStatus, getNextBillIdentifiers } from '@/lib/database';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const bills = getAllBills(status);
    return NextResponse.json({ bills });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch bills';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body: Partial<Bill> = await req.json();

    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'Bill must contain at least one item' }, { status: 400 });
    }

    // Generate exact 10-character Bill ID + Token Number (1 to 100)
    const { billId, tokenNumber } = getNextBillIdentifiers();
    const formattedId = body.id && body.id.length === 10 ? body.id : billId;
    const finalToken = body.tokenNumber || tokenNumber;

    const subtotal = body.subtotal || body.items.reduce((sum, i) => sum + i.lineTotal, 0);
    const gstPercent = body.gstPercent || 5;
    const discountAmount = body.discountAmount || 0;
    const taxable = Math.max(0, subtotal - discountAmount);
    const gstAmount = Math.round((taxable * gstPercent) / 100);
    const cgstAmount = Number((gstAmount / 2).toFixed(2));
    const sgstAmount = Number((gstAmount / 2).toFixed(2));
    const grandTotal = Math.round(taxable + gstAmount);

    const newBill: Bill = {
      id: formattedId,
      tokenNumber: finalToken,
      orderId: body.orderId,
      restaurantId: body.restaurantId || 'demo',
      restaurantName: body.restaurantName || 'ChatChaska Cafe',
      tableNumber: body.tableNumber || 'Walk-In POS',
      waiterName: body.waiterName || 'Staff',
      items: body.items,
      subtotal,
      gstPercent,
      cgstAmount,
      sgstAmount,
      gstAmount,
      discountAmount,
      grandTotal,
      paymentMode: body.paymentMode || 'cash',
      splitDetails: body.splitDetails,
      status: body.status || 'paid',
      createdAt: body.createdAt || new Date().toISOString(),
      closedAt: new Date().toISOString(),
    };

    const saved = saveBill(newBill);

    // Queue for automatic cloud sync
    try {
      const { syncBillToCloud } = await import('@/lib/sync');
      syncBillToCloud(saved, saved.restaurantId);
    } catch (syncErr) {
      console.warn('[Bill API] Cloud sync queue notice:', syncErr);
    }

    // Automatically create/sync corresponding order entry so it immediately appears on Orders page & Kitchen Display
    try {
      const { saveOrder } = await import('@/lib/database');
      saveOrder({
        id: body.orderId || `ord-${formattedId.slice(-6)}`,
        restaurantId: newBill.restaurantId,
        tableNumber: newBill.tableNumber || 'Walk-In POS',
        items: newBill.items.map((i) => ({
          id: i.name.toLowerCase().replace(/\s+/g, '-'),
          name: i.name,
          quantity: i.quantity,
          price: i.unitPrice || (i.lineTotal / (i.quantity || 1)),
        })),
        totalAmount: newBill.grandTotal,
        status: 'preparing', // Automatically enters Kitchen queue for preparation & serving!
        notes: `Paid via ${newBill.paymentMode.toUpperCase()} (Token #${newBill.tokenNumber})`,
      });
    } catch (orderSyncError) {
      console.warn('[Bill API] Optional order sync warning:', orderSyncError);
    }

    return NextResponse.json({ success: true, bill: saved }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Bill generation failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status, paymentMode } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Bill id is required' }, { status: 400 });
    }

    const updated = updateBillStatus(id, status, paymentMode);
    if (!updated) {
      return NextResponse.json({ error: 'Bill not found or update failed' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Bill status update failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
