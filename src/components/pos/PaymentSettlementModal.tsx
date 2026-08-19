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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
    });
  };

  // Dynamic NPCI UPI string & QR code URL generator
  const currentVpa = merchantUpiId || config?.upiId || 'chatchaska@upi';
  const cafeName = config?.cafeName || 'ChatChaska Cafe';
  const upiString = `upi://pay?pa=${encodeURIComponent(currentVpa)}&pn=${encodeURIComponent(cafeName)}&am=${grandTotal}&tn=${encodeURIComponent(`Bill ${tableNumber}`)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(upiString)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* MINIMAL HEADER: BADGES ON LEFT | TOTAL AMOUNT ON RIGHT */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-blue-600 text-white font-black text-xs shadow-2xs">
              {tableNumber}
            </span>
            {tokenNumber && (
              <span className="px-2.5 py-1 rounded-md bg-slate-200 text-slate-900 font-black text-xs border border-slate-300">
                Token : {tokenNumber}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 font-black text-slate-900 text-sm">
            <span className="text-xs text-slate-500 font-bold">Total:</span>
            <span className="text-base text-blue-600 font-black">₹{grandTotal}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">

          {/* PAYMENT MODE SELECTION (Crisp Box Buttons) */}
          <div className="grid grid-cols-3 gap-2">
            {/* CASH */}
            <button
              type="button"
              onClick={() => setPaymentMethod('cash')}
              className={cn(
                'flex flex-col items-center justify-center gap-1 p-2.5 rounded-md border text-xs font-extrabold transition-all cursor-pointer shadow-2xs',
                paymentMethod === 'cash'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              )}
            >
              <span className="material-symbols-outlined text-[20px]">payments</span>
              Cash
            </button>

            {/* UPI / QR */}
            <button
              type="button"
              onClick={() => setPaymentMethod('upi')}
              className={cn(
                'flex flex-col items-center justify-center gap-1 p-2.5 rounded-md border text-xs font-extrabold transition-all cursor-pointer shadow-2xs',
                paymentMethod === 'upi'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              )}
            >
              <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
              UPI / QR
            </button>

            {/* CARD */}
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={cn(
                'flex flex-col items-center justify-center gap-1 p-2.5 rounded-md border text-xs font-extrabold transition-all cursor-pointer shadow-2xs',
                paymentMethod === 'card'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              )}
            >
              <span className="material-symbols-outlined text-[20px]">credit_card</span>
              Card
            </button>
          </div>

          {/* REAL UPI / CARD PAYMENT INTERFACE WORKFLOW */}
          {paymentMethod === 'upi' && (
            <div className="bg-blue-50/70 border border-blue-200 rounded-md p-4 text-center space-y-3 animate-in fade-in duration-150">
              <span className="text-[11px] font-black text-blue-900 block uppercase tracking-wider">
                Scan & Pay via GPay / PhonePe / Paytm
              </span>
              
              {/* BIG HIGH-RESOLUTION QR CODE */}
              <div className="flex justify-center bg-white p-3 rounded-md border border-slate-300 w-52 h-52 mx-auto shadow-sm">
                <img
                  src={qrCodeUrl}
                  alt="UPI QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="bg-purple-50/70 border border-purple-200 rounded-md p-3.5 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-purple-900 font-extrabold text-xs">
                <span className="material-symbols-outlined text-[18px]">contactless</span>
                <span>Tap or Swipe Card on POS Machine</span>
              </div>
              <p className="text-[11px] text-slate-600 font-semibold">
                Enter Approval / RRN Code:
              </p>
              <input
                type="text"
                placeholder="Approval / RRN Code (e.g. 489201)"
                value={txnReference}
                onChange={(e) => setTxnReference(e.target.value)}
                className="bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs font-bold text-slate-900 w-full placeholder:text-slate-400 outline-none focus:border-purple-600"
              />
            </div>
          )}

          {/* WHATSAPP MOBILE NUMBER & CUSTOMER NAME */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            {/* Customer Name (Optional) */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs focus-within:border-blue-600 focus-within:bg-white transition-all">
              <span className="material-symbols-outlined text-[16px] text-slate-400">person</span>
              <input
                type="text"
                placeholder="Customer Name (Optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="bg-transparent outline-none w-full font-bold text-slate-900 placeholder:text-slate-400 text-xs"
              />
            </div>

            {/* WhatsApp Mobile Number (Optional) */}
            <div>
              <div className={cn(
                'flex items-center gap-2 bg-slate-50 border rounded-md px-3 py-2 text-xs transition-all',
                phoneError ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300 focus-within:border-blue-600 focus-within:bg-white'
              )}>
                <span className="material-symbols-outlined text-[16px] text-emerald-600 font-bold">chat</span>
                <input
                  type="tel"
                  placeholder="WhatsApp Mobile Number (Optional)"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    if (phoneError) setPhoneError(null);
                  }}
                  className="bg-transparent outline-none w-full font-bold text-slate-900 placeholder:text-slate-400 text-xs"
                />
              </div>
              {phoneError && (
                <span className="text-[10px] font-bold text-rose-600 mt-1 block">
                  {phoneError}
                </span>
              )}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-md border border-slate-300 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-[2] py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              Confirm & Print
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

