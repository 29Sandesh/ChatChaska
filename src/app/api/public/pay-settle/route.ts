import { NextRequest, NextResponse } from 'next/server';
import { cloudAdminClient } from '@/lib/cloud-db';

/**
 * POST /api/public/pay-settle
 * Customer confirms table payment via UPI QR -> updates cloud order and table status to paid
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order_id, table_number, payment_method = 'upi', amount, utr_number } = body;

    // 1. Update cloud_orders status to 'served' and recorded as paid
    if (order_id) {
      await cloudAdminClient
        .from('cloud_orders')
        .update({
          status: 'served',
          served_at: new Date().toISOString(),
        })
        .or(`id.eq.${order_id},order_number.eq.${order_id}`);
    }

    // 2. Mark local table status to 'paid' via internal API
    const base = req.nextUrl.origin;
    if (table_number) {
      try {
        await fetch(`${base}/api/tables`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: `table-${table_number.toLowerCase().replace(/\s+/g, '')}`,
            status: 'paid',
          }),
        });
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: 'Payment confirmed! Receipt generated.',
      settledAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error settling payment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
