/**
 * ESC/POS Thermal Receipt Renderer & Utility Functions
 * Supports 80mm (48 characters wide) and 58mm (32 characters wide) paper formats.
 */

const ESC = '\x1B';
const GS = '\x1D';

export const COMMANDS = {
  RESET: `${ESC}@`,
  TEXT_NORMAL: `${ESC}!`,
  TEXT_BOLD_ON: `${ESC}E\x01`,
  TEXT_BOLD_OFF: `${ESC}E\x00`,
  ALIGN_LEFT: `${ESC}a\x00`,
  ALIGN_CENTER: `${ESC}a\x01`,
  ALIGN_RIGHT: `${ESC}a\x02`,
  FONT_LARGE: `${GS}!\x11`, // Double height + double width
  FONT_MEDIUM: `${GS}!\x01`, // Double height
  FONT_NORMAL: `${GS}!\x00`,
  CUT_PAPER: `${GS}V\x41\x03`,
  KICK_DRAWER: `${ESC}p\x00\x19\xFA`,
};

export function padLine(left, right, width = 48) {
  const leftStr = String(left);
  const rightStr = String(right);
  const spaceNeeded = width - leftStr.length - rightStr.length;
  if (spaceNeeded <= 0) {
    return leftStr.slice(0, width - rightStr.length - 1) + ' ' + rightStr;
  }
  return leftStr + ' '.repeat(spaceNeeded) + rightStr;
}

export function drawDivider(char = '-', width = 48) {
  return char.repeat(width);
}

export function formatThermalBillReceipt(bill, config = {}) {
  const width = config.paperWidth === '58mm' ? 32 : 48;
  const restaurantName = config.restaurantName || bill.restaurantName || 'Spice Garden';
  const address = config.address || '42 Linking Road, Bandra West, Mumbai';
  const phone = config.phone || '+91 98765 43210';
  const gstin = config.gstin || '27AAAAA0000A1Z5';
  const fssai = config.fssai || '11521001000482';
  const headerNote = config.headerNote || 'Tax Invoice';
  const footerNote = config.footerNote || 'Thank you! Visit again.';

  const lines = [];

  // Header
  lines.push(COMMANDS.ALIGN_CENTER);
  lines.push(COMMANDS.FONT_LARGE);
  lines.push(restaurantName);
  lines.push(COMMANDS.FONT_NORMAL);
  lines.push(address);
  lines.push(`Ph: ${phone}`);
  if (gstin) lines.push(`GSTIN: ${gstin}`);
  if (fssai) lines.push(`FSSAI Lic No: ${fssai}`);
  lines.push(drawDivider('=', width));
  lines.push(COMMANDS.TEXT_BOLD_ON);
  lines.push(headerNote);
  lines.push(COMMANDS.TEXT_BOLD_OFF);
  lines.push(drawDivider('=', width));

  // Meta Info
  lines.push(COMMANDS.ALIGN_LEFT);
  lines.push(padLine(`Invoice #: ${bill.id}`, `Date: ${new Date(bill.createdAt || Date.now()).toLocaleDateString()}`, width));
  lines.push(padLine(`Table: ${bill.tableNumber}`, `Time: ${new Date(bill.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, width));
  lines.push(padLine(`Biller: ${bill.waiterName || 'Staff'}`, `Mode: ${(bill.paymentMode || 'cash').toUpperCase()}`, width));
  lines.push(drawDivider('-', width));

  // Items Header
  lines.push(padLine('Item Description', 'Qty x Price   Amount', width));
  lines.push(drawDivider('-', width));

  // Items
  if (bill.items) {
    bill.items.forEach((item) => {
      const itemTitle = `${item.veg ? '[V]' : '[N]'} ${item.name}`;
      const qtyPrice = `${item.quantity}x${item.unitPrice}`;
      const totalStr = `Rs.${item.lineTotal}`;
      lines.push(padLine(itemTitle, padLine(qtyPrice, totalStr, 20), width));
    });
  }

  lines.push(drawDivider('-', width));

  // Totals
  lines.push(padLine('Subtotal:', `Rs.${bill.subtotal}`, width));
  if (bill.discountAmount > 0) {
    lines.push(padLine('Discount:', `-Rs.${bill.discountAmount}`, width));
  }
  lines.push(padLine(`CGST (${(bill.gstPercent || 5) / 2}%):`, `Rs.${bill.cgstAmount || 0}`, width));
  lines.push(padLine(`SGST (${(bill.gstPercent || 5) / 2}%):`, `Rs.${bill.sgstAmount || 0}`, width));
  lines.push(drawDivider('=', width));

  // Grand Total
  lines.push(COMMANDS.FONT_MEDIUM);
  lines.push(COMMANDS.TEXT_BOLD_ON);
  lines.push(padLine('GRAND TOTAL:', `Rs.${bill.grandTotal}`, width));
  lines.push(COMMANDS.TEXT_BOLD_OFF);
  lines.push(COMMANDS.FONT_NORMAL);

  lines.push(drawDivider('=', width));

  // Footer
  lines.push(COMMANDS.ALIGN_CENTER);
  lines.push(footerNote);
  lines.push('Powered by MenuCraft POS');
  lines.push('\n\n');

  if (config.kickDrawer) {
    lines.push(COMMANDS.KICK_DRAWER);
  }
  lines.push(COMMANDS.CUT_PAPER);

  return lines.join('\n');
}

export function formatThermalKOTReceipt(kot, config = {}) {
  const width = config.paperWidth === '58mm' ? 32 : 48;
  const lines = [];

  lines.push(COMMANDS.ALIGN_CENTER);
  lines.push(COMMANDS.FONT_LARGE);
  lines.push('*** KITCHEN ORDER TICKET ***');
  lines.push(COMMANDS.FONT_NORMAL);
  lines.push(drawDivider('=', width));

  lines.push(COMMANDS.ALIGN_LEFT);
  lines.push(padLine(`Table: ${kot.tableNumber}`, `Station: ${kot.stationName || 'Main Kitchen'}`, width));
  lines.push(padLine(`Server: ${kot.waiterName || 'Staff'}`, `Time: ${kot.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, width));
  lines.push(drawDivider('-', width));

  lines.push(COMMANDS.FONT_MEDIUM);
  if (kot.items) {
    kot.items.forEach((item) => {
      lines.push(`${item.quantity}x  ${item.name}`);
      if (item.note) {
        lines.push(`    --> NOTE: ${item.note}`);
      }
    });
  }
  lines.push(COMMANDS.FONT_NORMAL);

  lines.push(drawDivider('=', width));
  lines.push('\n\n');
  lines.push(COMMANDS.CUT_PAPER);

  return lines.join('\n');
}
