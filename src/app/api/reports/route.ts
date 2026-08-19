import { NextResponse } from 'next/server';
import { getDb } from '@/lib/database';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get('timeframe') || 'today';

    const db = getDb();

    let timeFilter = "date(created_at) = date('now')";
    if (timeframe === 'yesterday') {
      timeFilter = "date(created_at) = date('now', '-1 day')";
    } else if (timeframe === 'week') {
      timeFilter = "created_at >= date('now', '-7 days')";
    } else if (timeframe === 'month') {
      timeFilter = "created_at >= date('now', '-30 days')";
    }

    // Bills summary
    const summary = db.prepare(`
      SELECT 
        COUNT(*) as total_bills,
        COALESCE(SUM(subtotal), 0) as gross_sales,
        COALESCE(SUM(discount_amount), 0) as total_discounts,
        COALESCE(SUM(cgst_amount + sgst_amount), 0) as total_tax,
        COALESCE(SUM(grand_total), 0) as net_revenue
      FROM bills
      WHERE status = 'paid' AND ${timeFilter}
    `).get() as any;

    // Payment method breakdown
    const paymentBreakdown = db.prepare(`
      SELECT payment_mode, COUNT(*) as count, SUM(grand_total) as amount
      FROM bills
      WHERE status = 'paid' AND ${timeFilter}
      GROUP BY payment_mode
    `).all();

    // Item-wise sales breakdown from bills.items_json
    const allPaidBills = db.prepare(`
      SELECT items_json FROM bills WHERE status = 'paid' AND ${timeFilter}
    `).all() as Array<{ items_json: string }>;

    const itemSalesMap: Record<string, { name: string; qty: number; revenue: number }> = {};
    allPaidBills.forEach((b) => {
      try {
        const items = JSON.parse(b.items_json);
        items.forEach((item: any) => {
          const name = item.name || 'Item';
          const qty = item.quantity || 1;
          const lineTotal = item.lineTotal || (item.unitPrice || 0) * qty;

          if (!itemSalesMap[name]) {
            itemSalesMap[name] = { name, qty: 0, revenue: 0 };
          }
          itemSalesMap[name].qty += qty;
          itemSalesMap[name].revenue += lineTotal;
        });
      } catch (e) {}
    });

    const itemSales = Object.values(itemSalesMap).sort((a, b) => b.revenue - a.revenue);

    return NextResponse.json({
      timeframe,
      summary: {
        totalBills: summary.total_bills || 0,
        grossSales: summary.gross_sales || 0,
        totalDiscounts: summary.total_discounts || 0,
        totalTax: summary.total_tax || 0,
        netRevenue: summary.net_revenue || 0,
        avgTicket: summary.total_bills ? Math.round(summary.net_revenue / summary.total_bills) : 0,
      },
      paymentBreakdown,
      itemSales,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
