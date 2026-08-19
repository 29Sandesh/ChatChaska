/**
 * Central Restaurant Billing & GST Tax Calculation Engine
 */

export interface BillingItemInput {
  price: number;
  quantity: number;
}

export interface BillingCalculationInput {
  items: BillingItemInput[];
  discountAmount?: number;
  gstRate?: number; // e.g., 5 for 5% GST
}

export interface BillingCalculationResult {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  gstRate: number;
  cgstRate: number;
  sgstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  totalTax: number;
  exactTotal: number;
  roundOff: number;
  grandTotal: number;
}

/**
 * Calculates exact subtotal, CGST, SGST, total tax, round-off, and grand total.
 * 
 * Example:
 * Items total: ₹810
 * Discount: ₹0
 * GST: 5% (2.5% CGST + 2.5% SGST)
 * CGST = 810 * 0.025 = 20.25
 * SGST = 810 * 0.025 = 20.25
 * Total Tax = 40.50
 * Exact Total = 850.50
 * Grand Total = Math.round(850.50) = 851
 * Round Off = +0.50
 * 
 * Check: 810.00 + 20.25 + 20.25 + 0.50 = 851.00 (100% Mathematically Exact!)
 */
export function calculateBillTotals({
  items,
  discountAmount = 0,
  gstRate = 5,
}: BillingCalculationInput): BillingCalculationResult {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const validDiscount = Math.min(subtotal, Math.max(0, discountAmount));
  const taxableAmount = Math.max(0, subtotal - validDiscount);

  const cgstRate = gstRate / 2;
  const sgstRate = gstRate / 2;

  const cgstAmount = Number(((taxableAmount * cgstRate) / 100).toFixed(2));
  const sgstAmount = Number(((taxableAmount * sgstRate) / 100).toFixed(2));
  const totalTax = Number((cgstAmount + sgstAmount).toFixed(2));

  const exactTotal = taxableAmount + totalTax;
  const grandTotal = Math.round(exactTotal);
  const roundOff = Number((grandTotal - exactTotal).toFixed(2));

  return {
    subtotal,
    discountAmount: validDiscount,
    taxableAmount,
    gstRate,
    cgstRate,
    sgstRate,
    cgstAmount,
    sgstAmount,
    totalTax,
    exactTotal,
    roundOff,
    grandTotal,
  };
}

/**
 * Helper to format amount as currency string with optional force decimals
 */
export function formatBillCurrency(amount: number, showDecimals: boolean = false): string {
  if (showDecimals || amount % 1 !== 0) {
    return `₹${amount.toFixed(2)}`;
  }
  return `₹${amount}`;
}
