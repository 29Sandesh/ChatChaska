'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useCafeConfig } from '@/hooks/useCafeConfig';

export interface PaymentSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  grandTotal: number;
  tableNumber: string;
  orderType?: 'DINE_IN' | 'PICKUP';
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
  orderType = 'DINE_IN',
  itemCount,
  merchantUpiId,
  tokenNumber = '01',
  onConfirm,
}: PaymentSettlementModalProps) {
  const { config } = useCafeConfig();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card'>('cash');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [txnReference, setTxnReference] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const isPickUp = orderType === 'PICKUP' || tableNumber === 'Pick Up';

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
      customerName: customerName.trim() || (isPickUp ? 'Takeaway Guest' : 'Guest'),
      customerPhone: cleanPhone,
      txnReference: txnReference.trim(),
      isPayLater,
    });
  };

  // Dynamic NPCI UPI string & QR code URL generator
  const currentVpa = merchantUpiId || config?.upiId || 'chatchaska@upi';
  const cafeName = config?.cafeName || 'ChatChaska Cafe';
  const upiString = `upi://pay?pa=${encodeURIComponent(currentVpa)}&pn=${encodeURIComponent(cafeName)}&am=${grandTotal}&tn=${encodeURIComponent(isPickUp ? `Takeaway Token ${tokenNumber}` : `Bill ${tableNumber}`)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(upiString)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 select-none font-sans">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-2xl border border-[#E8DFC9] overflow-hidden flex flex-col">
        
        {/* BRAND THEMED HEADER: BOX SHAPED */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#FAF9F7] border-b border-[#E8DFC9]">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-md bg-black text-white font-bold text-xs shadow-2xs">
              {isPickUp ? 'Takeaway Counter' : tableNumber}
            </span>
            {isPickUp && (
              <span className="px-2.5 py-1 rounded-md bg-[#F8EFE7] text-slate-900 border border-[#E8DFC9] font-bold text-xs">
                Token #{tokenNumber}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
            <span className="text-xs text-slate-500 font-medium">Total:</span>
            <span className="text-base font-black text-black">₹{grandTotal}</span>
          </div>
        </div>

        <div className="p-5 space-y-4 bg-white">
          {/* Subheading info */}
          <div className="flex items-center justify-between text-xs text-slate-600 pb-1 border-b border-slate-100">
            <span>{isPickUp ? 'Takeaway / Counter Order' : 'Dine In Table Order'}</span>
            <span className="font-semibold">{itemCount} {itemCount === 1 ? 'Item' : 'Items'}</span>
          </div>

          {/* PAYMENT MODE SELECTION (Box-Shaped rounded-md) */}
          <div className="grid grid-cols-3 gap-2">
            {/* CASH */}
            <button
              type="button"
              onClick={() => setPaymentMethod('cash')}
              className={cn(
                'flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-md border text-xs font-bold transition-all cursor-pointer shadow-2xs',
                paymentMethod === 'cash'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-slate-800 border-slate-200 hover:bg-[#FAF9F7]'
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
                'flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-md border text-xs font-bold transition-all cursor-pointer shadow-2xs',
                paymentMethod === 'upi'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-slate-800 border-slate-200 hover:bg-[#FAF9F7]'
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
                'flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-md border text-xs font-bold transition-all cursor-pointer shadow-2xs',
                paymentMethod === 'card'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-slate-800 border-slate-200 hover:bg-[#FAF9F7]'
              )}
            >
              <span className="material-symbols-outlined text-[20px]">credit_card</span>
              <span>Card</span>
            </button>
          </div>

          {/* DYNAMIC UPI QR DISPLAY - CLEAN (NO EXTRA TEXT) */}
          {paymentMethod === 'upi' && (
            <div className="flex flex-col items-center justify-center p-3 bg-[#FAF9F7] border border-[#E8DFC9] rounded-md animate-in fade-in">
              <div className="bg-white p-2.5 rounded-md border border-[#E8DFC9] shadow-2xs">
                <img
                  src={qrCodeUrl}
                  alt="UPI QR Code"
                  className="w-36 h-36 object-contain"
                />
              </div>
            </div>
          )}

          {/* CUSTOMER DETAILS (Box Shaped) */}
          <div className="space-y-2.5">
            <div className="relative">
              <span className="material-symbols-outlined text-[17px] text-slate-400 absolute left-3 top-2.5">
                person
              </span>
              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#FAF9F7] border border-[#E8DFC9] rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-black transition-all"
              />
            </div>

            <div className="relative">
              <span className="material-symbols-outlined text-[17px] text-slate-400 absolute left-3 top-2.5">
                chat
              </span>
              <input
                type="tel"
                placeholder="WhatsApp Mobile Number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                maxLength={10}
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#FAF9F7] border border-[#E8DFC9] rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-black transition-all"
              />
            </div>
            {phoneError && (
              <p className="text-[11px] text-rose-600 font-bold">{phoneError}</p>
            )}
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS: BOX-SHAPED (rounded-md) */}
        <div className="p-4 bg-[#FAF9F7] border-t border-[#E8DFC9] flex items-center gap-2">
          {/* Cancel */}
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-3.5 rounded-md border border-[#D9C4B0] bg-white hover:bg-[#F2E5D9] text-slate-800 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            Cancel
          </button>

          {/* Pay Later (Only shown for Dine In) */}
          {!isPickUp && (
            <button
              type="button"
              onClick={() => handleAction(true)}
              className="flex-1 py-2.5 px-3 rounded-md border border-[#D9C4B0] bg-[#F8EFE7] hover:bg-[#F2E5D9] text-slate-900 text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs"
              title="Keep table open and pay later"
            >
              Pay Later
            </button>
          )}

          {/* Confirm (Solid Black Brand Button) */}
          <button
            type="button"
            onClick={() => handleAction(false)}
            className="flex-1 py-2.5 px-3 rounded-md bg-black hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-xs"
          >
            <span>Confirm</span>
          </button>
        </div>
      </div>
    </div>
  );
}
