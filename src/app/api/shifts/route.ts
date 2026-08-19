import { NextResponse } from 'next/server';
import { getActiveShift, openShift, closeShift, getDb } from '@/lib/database';

export async function GET() {
  try {
    const shift = getActiveShift() as any;
    const db = getDb();
    
    let cashSales = 0;
    let upiSales = 0;
    let cardSales = 0;
    let totalSales = 0;

    if (shift && shift.id) {
      const sales = db.prepare(`
        SELECT payment_mode, SUM(grand_total) as total
        FROM bills
        WHERE created_at >= (SELECT opened_at FROM shifts WHERE id = ?)
        AND status = 'paid'
        GROUP BY payment_mode
      `).all(shift.id) as Array<{ payment_mode: string; total: number }>;

      sales.forEach((s) => {
        if (s.payment_mode === 'cash') cashSales += s.total;
        else if (s.payment_mode === 'upi') upiSales += s.total;
        else if (s.payment_mode === 'card') cardSales += s.total;
        totalSales += s.total;
      });
    }

    return NextResponse.json({
      activeShift: shift || null,
      metrics: {
        cashSales,
        upiSales,
        cardSales,
        totalSales,
        expectedCash: (shift && shift.opening_cash ? shift.opening_cash : 0) + cashSales,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, cashierName, openingCash, id, closingCash, expectedCash, totalSales, notes } = body;

    if (action === 'open') {
      if (!cashierName) {
        return NextResponse.json({ error: 'Cashier name required' }, { status: 400 });
      }
      const shiftId = openShift(cashierName, Number(openingCash) || 0);
      return NextResponse.json({ success: true, shiftId });
    }

    if (action === 'close') {
      if (!id) {
        return NextResponse.json({ error: 'Shift id required' }, { status: 400 });
      }
      closeShift(id, Number(closingCash) || 0, Number(expectedCash) || 0, Number(totalSales) || 0, notes);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
