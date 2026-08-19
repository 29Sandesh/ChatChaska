'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { BillItem } from '@/types';

export interface SplitBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: BillItem[];
  grandTotal: number;
  onConfirmSplit: (splits: { label: string; amount: number; paymentMode: string }[]) => void;
}

export function SplitBillModal({
  isOpen,
  onClose,
  items,
  grandTotal,
  onConfirmSplit,
}: SplitBillModalProps) {
  const [splitMode, setSplitMode] = useState<'equal' | 'custom'>('equal');
  const [splitCount, setSplitCount] = useState<number>(2);
  const [customSplits, setCustomSplits] = useState<{ amount: number; paymentMode: string }[]>([
    { amount: Math.round(grandTotal / 2), paymentMode: 'cash' },
    { amount: grandTotal - Math.round(grandTotal / 2), paymentMode: 'upi' },
  ]);

  const handleEqualSplitChange = (count: number) => {
    setSplitCount(count);
    const perPerson = Math.floor(grandTotal / count);
    const remainder = grandTotal - perPerson * count;

    const newSplits = Array.from({ length: count }, (_, i) => ({
      amount: i === 0 ? perPerson + remainder : perPerson,
      paymentMode: i % 2 === 0 ? 'cash' : 'upi',
    }));
    setCustomSplits(newSplits);
  };

  const handleUpdateCustomAmount = (index: number, newAmount: number) => {
    const updated = [...customSplits];
    updated[index].amount = newAmount;
    setCustomSplits(updated);
  };

  const handleUpdateCustomMode = (index: number, mode: string) => {
    const updated = [...customSplits];
    updated[index].paymentMode = mode;
    setCustomSplits(updated);
  };

  const currentSum = customSplits.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const isMatch = Math.abs(currentSum - grandTotal) < 1;

  const handleApplySplit = () => {
    if (!isMatch) return;
    const formatted = customSplits.map((s, idx) => ({
      label: `Person ${idx + 1}`,
      amount: s.amount,
      paymentMode: s.paymentMode,
    }));
    onConfirmSplit(formatted);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Split Bill" size="lg">
      <div className="space-y-6 py-2">
        {/* Total Banner */}
        <div className="flex items-center justify-between p-4 bg-primary-container/20 rounded-2xl border border-primary/20">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block">
              Bill Grand Total
            </span>
            <span className="text-2xl font-black text-primary">{formatCurrency(grandTotal)}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSplitMode('equal');
                handleEqualSplitChange(2);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                splitMode === 'equal'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
              }`}
            >
              Equal Split
            </button>
            <button
              type="button"
              onClick={() => setSplitMode('custom')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                splitMode === 'custom'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
              }`}
            >
              Custom Amounts
            </button>
          </div>
        </div>

        {/* Equal Split Quick Buttons */}
        {splitMode === 'equal' && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
              Split Equally Between:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleEqualSplitChange(num)}
                  className={`p-3 rounded-xl border text-center font-bold text-sm transition-all ${
                    splitCount === num
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-outline-variant/30 hover:border-outline text-on-surface'
                  }`}
                >
                  {num} Ways ({formatCurrency(Math.round(grandTotal / num))}/ea)
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Split Breakdown Table */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
            Payment Breakdown per Person:
          </label>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {customSplits.map((split, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/30"
              >
                <span className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-bold text-on-surface">
                  P{idx + 1}
                </span>

                <div className="flex-1">
                  <span className="text-xs font-semibold text-on-surface block">
                    Person {idx + 1} Share
                  </span>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-2.5 text-xs text-on-surface-variant font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={split.amount}
                      onChange={(e) => handleUpdateCustomAmount(idx, Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 text-sm bg-surface border border-outline-variant/40 rounded-lg text-on-surface font-bold focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="w-36">
                  <span className="text-xs font-semibold text-on-surface block">Payment Mode</span>
                  <select
                    value={split.paymentMode}
                    onChange={(e) => handleUpdateCustomMode(idx, e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs bg-surface border border-outline-variant/40 rounded-lg text-on-surface font-semibold focus:outline-none focus:border-primary"
                  >
                    <option value="cash">💵 Cash</option>
                    <option value="upi">📲 UPI QR</option>
                    <option value="card">💳 Card</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Validation Bar */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs">
          <div>
            <span className="text-on-surface-variant font-semibold">Total Split Sum: </span>
            <span
              className={`font-black ${
                isMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
              }`}
            >
              {formatCurrency(currentSum)}
            </span>
          </div>
          {!isMatch && (
            <span className="text-rose-500 font-bold">
              Mismatch of {formatCurrency(Math.abs(grandTotal - currentSum))}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/20">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={!isMatch} onClick={handleApplySplit}>
            Confirm Split & Process Bills
          </Button>
        </div>
      </div>
    </Modal>
  );
}
