import { buildWhatsAppShareUrl } from '@/lib/whatsapp';

/**
 * End-of-Day (EOD) Daily Sales Summary Generator
 *
 * Compiles total sales, order volume, payment mode breakdowns, and top items
 * into an instant WhatsApp summary sent directly to the cafe owner.
 */

export interface EodSummaryData {
  cafeName: string;
  dateStr: string;
  totalSales: number;
  totalOrders: number;
  cashSales: number;
  upiSales: number;
  cardSales: number;
  totalTax: number;
  topSellingItems: Array<{ name: string; count: number; revenue: number }>;
}

export function formatEodWhatsAppMessage(data: EodSummaryData): string {
  const lines: string[] = [
    `📊 *DAILY EOD SALES REPORT*`,
    `🏢 *${data.cafeName.toUpperCase()}*`,
    `📅 Date: ${data.dateStr}`,
    `================================`,
    `💰 *Total Revenue: ₹${data.totalSales.toLocaleString('en-IN')}*`,
    `🧾 Total Orders: *${data.totalOrders} bills*`,
    `--------------------------------`,
    `💳 *Payment Breakdown:*`,
    `• UPI / Online: ₹${data.upiSales.toLocaleString('en-IN')}`,
    `• Cash Drawer: ₹${data.cashSales.toLocaleString('en-IN')}`,
    data.cardSales > 0 ? `• Card: ₹${data.cardSales.toLocaleString('en-IN')}` : '',
    `• GST Tax Collected: ₹${data.totalTax.toLocaleString('en-IN')}`,
    `--------------------------------`,
    `🏆 *Top Selling Dishes:*`,
  ].filter(Boolean);

  data.topSellingItems.slice(0, 3).forEach((item, idx) => {
    lines.push(`${idx + 1}. *${item.name}* (${item.count} orders - ₹${item.revenue.toLocaleString('en-IN')})`);
  });

  lines.push(`================================`);
  lines.push(`✅ *Register Closed & Reconciled*`);
  lines.push(`_Generated automatically by ChatChaska POS_`);

  return lines.join('\n');
}

/**
 * Build one-click WhatsApp share link for the cafe owner.
 */
export function buildEodWhatsAppUrl(ownerPhone: string | undefined, data: EodSummaryData): string {
  const message = formatEodWhatsAppMessage(data);
  return buildWhatsAppShareUrl(ownerPhone, message);
}
