import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateBillTotals } from '../billing';

describe('Billing Calculation Engine', () => {
  it('should calculate GST (5%) and grand total correctly without discount', () => {
    const items = [
      { price: 30, quantity: 2 },
      { price: 140, quantity: 1 },
    ];

    const result = calculateBillTotals({ items, discountAmount: 0, gstRate: 5 });

    assert.equal(result.subtotal, 200);
    assert.equal(result.discountAmount, 0);
    assert.equal(result.taxableAmount, 200);
    assert.equal(result.cgstAmount, 5);
    assert.equal(result.sgstAmount, 5);
    assert.equal(result.totalTax, 10);
    assert.equal(result.grandTotal, 210);
  });

  it('should apply percentage discount correctly and compute tax on taxable base', () => {
    const items = [
      { price: 100, quantity: 2 },
    ];

    // 20 discount on 200 = taxable 180. 5% GST on 180 = 9 (4.50 CGST + 4.50 SGST). Total = 189
    const result = calculateBillTotals({ items, discountAmount: 20, gstRate: 5 });

    assert.equal(result.subtotal, 200);
    assert.equal(result.discountAmount, 20);
    assert.equal(result.taxableAmount, 180);
    assert.equal(result.totalTax, 9);
    assert.equal(result.grandTotal, 189);
  });

  it('should handle zero-rated items or 0% tax gracefully', () => {
    const items = [
      { price: 20, quantity: 1 },
    ];

    const result = calculateBillTotals({ items, discountAmount: 0, gstRate: 0 });

    assert.equal(result.subtotal, 20);
    assert.equal(result.totalTax, 0);
    assert.equal(result.grandTotal, 20);
  });
});
