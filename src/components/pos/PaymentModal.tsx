'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { generateUPIQRCodeDataUrl } from '@/lib/payments/upi';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  grandTotal: number;
  billId: string;
  onCompletePayment: (paymentMode: 'cash' | 'upi' | 'card' | 'split', details?: any) => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  grandTotal,
  billId,
  onCompletePayment,
}: PaymentModalProps) {
  const [activeTab, setActiveTab] = useState<'cash' | 'upi' | 'card' | 'khata'>('upi');
  const [cashTendered, setCashTendered] = useState<number>(Math.ceil(grandTotal / 100) * 100);
  const [upiQrUrl, setUpiQrUrl] = useState<string>('');
  const [edcStatus, setEdcStatus] = useState<'idle' | 'swiping' | 'approved'>('idle');
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    if (isOpen && grandTotal > 0) {
      setCashTendered(Math.ceil(grandTotal / 100) * 100);
      generateUPIQRCodeDataUrl({
        upiId: 'spicegarden@okicici',
        merchantName: 'Spice Garden POS',
        amount: grandTotal,
        billId: billId || 'DEMO-101',
      }).then((url) => setUpiQrUrl(url));
    }
  }, [isOpen, grandTotal, billId]);

  const changeToReturn = Math.max(0, cashTendered - grandTotal);

  const handleSimulateEDC = () => {
    setEdcStatus('swiping');
    setTimeout(() => {
      setEdcStatus('approved');
      setTimeout(() => {
        onCompletePayment('card', { reference: `CARD-${Date.now()}` });
        onClose();
      }, 1000);
    }, 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Bill Settlement & Payment" size="md">
      <div className="space-y-5 py-2">
        {/* Bill Grand Total Banner */}
        <div className="p-4 bg-primary-container/10 border border-primary/30 rounded-2xl flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-outline uppercase block">Amount Payable</span>
            <span className="text-xs font-mono font-semibold text-on-surface-variant">Bill #{billId}</span>
          </div>
          <span className="text-3xl font-black text-primary font-mono">
            {formatCurrency(grandTotal)}
          </span>
        </div>

        {/* Payment Method Selector Tabs */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'upi', label: '📱 UPI QR', icon: 'qr_code_scanner' },
            { id: 'cash', label: '💵 Cash', icon: 'payments' },
            { id: 'card', label: '💳 Card EDC', icon: 'credit_card' },
            { id: 'khata', label: '📖 Khata Credit', icon: 'book' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                activeTab === tab.id
                  ? 'border-primary bg-primary/10 text-primary shadow-xs'
                  : 'border-outline-variant/30 text-on-surface hover:bg-surface-container-low'
              }`}
            >
              <div>{tab.label}</div>
            </button>
          ))}
        </div>

        {/* Dynamic Content based on Tab */}
        {activeTab === 'upi' && (
          <div className="flex flex-col items-center justify-center p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20 space-y-3">
            <span className="text-xs font-bold text-on-surface">Scan & Pay via any UPI App (GPay / PhonePe / Paytm)</span>
            {upiQrUrl ? (
              <img src={upiQrUrl} alt="UPI Payment QR Code" className="w-48 h-48 rounded-xl shadow-md border border-outline-variant/30" />
            ) : (
              <div className="w-48 h-48 bg-surface border rounded-xl flex items-center justify-center text-xs text-outline">Generating Dynamic QR...</div>
            )}
            <span className="text-[11px] text-outline font-mono">UPI ID: spicegarden@okicici</span>
            <Button variant="primary" fullWidth className="mt-2 text-xs" onClick={() => { onCompletePayment('upi'); onClose(); }}>
              Confirm Payment Received ✓
            </Button>
          </div>
        )}

        {activeTab === 'cash' && (
          <div className="space-y-4 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20">
            <div>
              <label className="text-xs font-bold text-on-surface-variant block mb-1">
                Cash Amount Tendered by Customer (₹):
              </label>
              <input
                type="number"
                value={cashTendered}
                onChange={(e) => setCashTendered(Number(e.target.value))}
                className="w-full px-4 py-3 text-lg font-black font-mono bg-surface border border-outline-variant/40 rounded-xl text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            {/* Quick Tendered Notes */}
            <div className="flex gap-2">
              {[500, 1000, 2000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setCashTendered(amt)}
                  className="px-3 py-1.5 bg-surface border border-outline-variant/30 rounded-lg text-xs font-mono font-bold text-on-surface hover:border-primary"
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            <div className="p-3 bg-surface rounded-xl border border-outline-variant/30 flex justify-between items-center text-sm font-bold">
              <span className="text-on-surface-variant">Change to Return Customer:</span>
              <span className="text-xl font-black text-emerald-600 font-mono">
                {formatCurrency(changeToReturn)}
              </span>
            </div>

            <Button variant="primary" fullWidth className="text-xs" onClick={() => { onCompletePayment('cash', { cashTendered, changeToReturn }); onClose(); }}>
              Collect Cash & Kick Drawer 💵
            </Button>
          </div>
        )}

        {activeTab === 'card' && (
          <div className="flex flex-col items-center justify-center p-6 bg-surface-container-low rounded-2xl border border-outline-variant/20 space-y-4">
            <span className="material-symbols-outlined text-primary text-5xl">credit_card</span>
            <span className="text-xs font-bold text-on-surface text-center">
              Pine Labs / Paytm EDC Terminal Payment
            </span>

            {edcStatus === 'idle' && (
              <Button variant="primary" fullWidth onClick={handleSimulateEDC}>
                Send ₹{grandTotal} to EDC Terminal →
              </Button>
            )}

            {edcStatus === 'swiping' && (
              <span className="text-xs font-bold text-amber-500 animate-pulse">
                ⏳ Waiting for customer to tap / insert card on EDC terminal...
              </span>
            )}

            {edcStatus === 'approved' && (
              <span className="text-xs font-bold text-emerald-600">
                ✅ Card Transaction Approved! Printing slip...
              </span>
            )}
          </div>
        )}

        {activeTab === 'khata' && (
          <div className="space-y-4 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20">
            <div>
              <label className="text-xs font-bold text-on-surface-variant block mb-1">
                Customer Name / Account Number:
              </label>
              <input
                type="text"
                placeholder="e.g. Inspector Deshmukh"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-surface border border-outline-variant/40 rounded-xl text-on-surface font-semibold"
              />
            </div>
            <Button
              variant="primary"
              fullWidth
              disabled={!customerName}
              onClick={() => { onCompletePayment('cash', { khataCustomer: customerName }); onClose(); }}
            >
              Record in Khata Ledger 📖
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
