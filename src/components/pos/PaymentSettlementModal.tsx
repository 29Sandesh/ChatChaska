'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useCafeConfig } from '@/hooks/useCafeConfig';

export interface PaymentSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  grandTotal: number;
  tableNumber: string;
  itemCount: number;
  merchantUpiId?: string;
  tokenNumber?: string;
  onConfirm: (details: {
    paymentMethod: 'cash' | 'upi' | 'card';
    customerName: string;
    customerPhone: string;
    txnReference?: string;
    isPayLater?: boolean;
  }) => void;
}

export function PaymentSettlementModal({
  isOpen,
  onClose,
  grandTotal,
  tableNumber,
  itemCount,
  merchantUpiId,
  tokenNumber,
  onConfirm,
}: PaymentSettlementModalProps) {
  const { config } = useCafeConfig();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card'>('cash');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [txnReference, setTxnReference] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPaymentMethod('cash');
      setCustomerName('');
      setCustomerPhone('');
      setTxnReference('');
      setPhoneError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAction = (isPayLater: boolean) => {
    const cleanPhone = customerPhone.trim();
    if (cleanPhone && cleanPhone.length < 10) {
      setPhoneError('Please enter a valid 10-digit WhatsApp mobile number.');
      return;
    }

    setPhoneError(null);
    onConfirm({
      paymentMethod,
      customerName: customerName.trim() || 'Guest',
      customerPhone: cleanPhone,
      txnReference: txnReference.trim(),
      isPayLater,
    });
  };

  // Dynamic NPCI UPI string & QR code URL generator
  const currentVpa = merchantUpiId || config?.upiId || 'chatchaska@upi';
  const cafeName = config?.cafeName || 'ChatChaska Cafe';
  const upiString = `upi://pay?pa=${encodeURIComponent(currentVpa)}&pn=${encodeURIComponent(cafeName)}&am=${grandTotal}&tn=${encodeURIComponent(`Bill ${tableNumber}`)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiString)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 select-none font-sans">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* MINIMAL TOP HEADER: TABLE BADGE ON LEFT | TOTAL AMOUNT ON RIGHT */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-2xs">
              {tableNumber}
            </span>
            {tokenNumber && (
              <span className="px-2.5 py-1 rounded-xl bg-slate-200 text-slate-800 font-bold text-xs">
                Token {tokenNumber}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
            <span className="text-xs text-slate-500">Total:</span>
            <span className="text-base text-blue-600 font-black">₹{grandTotal}</span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* PAYMENT MODE SELECTION (Clean Box Buttons) */}
          <div className="grid grid-cols-3 gap-2">
            {/* CASH */}
            <button
              type="button"
              onClick={() => setPaymentMethod('cash')}
              className={cn(
                'flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs',
                paymentMethod === 'cash'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              )}
            >
              <span className="material-symbols-outlined text-[20px]">payments</span>
              <span>Cash</span>
            </button>

            {/* UPI / QR */}
            <button
              type="button"
              onClick={() => setPaymentMethod('upi')}
              className={cn(
                'flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs',
                paymentMethod === 'upi'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              )}
            >
              <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
              <span>UPI / QR</span>
            </button>

            {/* CARD */}
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={cn(
                'flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs',
                paymentMethod === 'card'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              )}
            >
              <span className="material-symbols-outlined text-[20px]">credit_card</span>
              <span>Card</span>
            </button>
          </div>

          {/* DYNAMIC UPI QR DISPLAY */}
          {paymentMethod === 'upi' && (
            <div className="flex flex-col items-center justify-center p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2 animate-in fade-in">
              <div className="bg-white p-2 rounded-xl border border-blue-200 shadow-xs">
                <img
                  src={qrCodeUrl}
                  alt="UPI QR Code"
                  className="w-32 h-32 object-contain"
                />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-800">Scan & Pay ₹{grandTotal}</p>
                <p className="text-[10px] text-slate-500 font-mono">{currentVpa}</p>
              </div>
            </div>
          )}

          {/* CUSTOMER DETAILS (Optional) */}
          <div className="space-y-2.5">
            <div className="relative">
              <span className="material-symbols-outlined text-[17px] text-slate-400 absolute left-3 top-2.5">
                person
              </span>
              <input
                type="text"
                placeholder="Customer Name (Optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-black transition-all"
              />
            </div>

            <div className="relative">
              <span className="material-symbols-outlined text-[17px] text-slate-400 absolute left-3 top-2.5">
                chat
              </span>
              <input
                type="tel"
                placeholder="WhatsApp Mobile Number (Optional)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                maxLength={10}
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-black transition-all"
              />
            </div>
            {phoneError && (
              <p className="text-[11px] text-rose-600 font-bold">{phoneError}</p>
            )}
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS: [ Cancel ] [ Pay Later ] [ Confirm & Print ] */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
          {/* Cancel */}
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>

          {/* Pay Later */}
          <button
            type="button"
            onClick={() => handleAction(true)}
            className="flex-1 py-2.5 px-3 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs"
            title="Keep table open and pay later"
          >
            Pay Later
          </button>

          {/* Confirm & Print */}
          <button
            type="button"
            onClick={() => handleAction(false)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">receipt_long</span>
            <span>Confirm & Print</span>
          </button>
        </div>
      </div>
    </div>
  );
}
