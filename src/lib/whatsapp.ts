/**
 * ChatChaska WhatsApp Messaging Helper
 *
 * Formats receipts and reports into clean, emoji-rich WhatsApp messages
 * and builds zero-cost `wa.me` deep links for one-tap sharing.
 */

export interface WhatsAppBillData {
  id: string;
  restaurantName: string;
  customerName?: string;
  customerPhone?: string;
  tableNumber?: string;
  totalAmount: number;
  paymentMode: string;
  tokenNumber?: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  hostedBillUrl?: string;
}

/**
 * Generate a formatted text message for a digital bill receipt.
 */
export function formatWhatsAppBillMessage(bill: WhatsAppBillData): string {
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const lines: string[] = [
    `🧾 *${bill.restaurantName.toUpperCase()}*`,
    `--------------------------------`,
    `📋 *Order Receipt #${bill.tokenNumber || bill.id.slice(-4)}*`,
    `📅 Date: ${dateStr}`,
    bill.tableNumber ? `🪑 Table: ${bill.tableNumber}` : `🛍️ Order Type: Takeaway`,
    `--------------------------------`,
  ];

  // List top items (up to 4 items in text)
  bill.items.slice(0, 4).forEach((item) => {
    lines.push(`• ${item.name} x${item.quantity} = ₹${(item.quantity * item.price).toLocaleString('en-IN')}`);
  });

  if (bill.items.length > 4) {
    lines.push(`• ...and ${bill.items.length - 4} more item(s)`);
  }

  lines.push(`--------------------------------`);
  lines.push(`💰 *Grand Total: ₹${bill.totalAmount.toLocaleString('en-IN')}*`);
  lines.push(`💳 Paid via: *${bill.paymentMode.toUpperCase()}* ✅`);
  lines.push(``);

  if (bill.hostedBillUrl) {
    lines.push(`🔗 *View & Download Tax Invoice:*`);
    lines.push(`${bill.hostedBillUrl}`);
    lines.push(``);
  }

  lines.push(`✨ *Thank you for dining with us! Visit again!* ✨`);
  lines.push(`_Powered by ChatChaska POS_`);

  return lines.join('\n');
}

/**
 * Build a `wa.me` deep link for instant WhatsApp sharing.
 */
export function buildWhatsAppShareUrl(phone: string | undefined, message: string): string {
  let cleanPhone = (phone || '').replace(/\D/g, '');
  
  // Default to India country code 91 if 10 digits
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }

  const encodedText = encodeURIComponent(message);
  
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }
  
  // If no phone provided, opens WhatsApp share selector
  return `https://api.whatsapp.com/send?text=${encodedText}`;
}
