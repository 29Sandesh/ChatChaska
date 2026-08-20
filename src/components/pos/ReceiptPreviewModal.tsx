'use client';

import React, { useState } from 'react';
import { formatBillCurrency } from '@/lib/billing';

export interface BillItem {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface BillData {
  billId: string;
  orderId?: string;
  tokenNumber?: string;
  restaurantName: string;
  gstin?: string;
  fssai?: string;
  address?: string;
  date: string;
  tableNumber?: string;
  waiterName?: string;
  items: BillItem[];
  subtotal: number;
  discountAmount?: number;
  cgstRate?: number;
  sgstRate?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  roundOff?: number;
  grandTotal: number;
  paymentMode: string;
  customerName?: string;
  customerPhone?: string;
}

interface ReceiptPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  billData: BillData;
  hideGoBack?: boolean;
  hideWhatsApp?: boolean;
}

export function ReceiptPreviewModal({
  isOpen,
  onClose,
  billData,
  hideGoBack = false,
  hideWhatsApp = false,
}: ReceiptPreviewModalProps) {
  const [showPhoneModal, setShowPhoneModal] = useState<boolean>(false);
  const [phoneInput, setPhoneInput] = useState<string>(billData.customerPhone || '');

  if (!isOpen) return null;

  const cgstRate = billData.cgstRate ?? 2.5;
  const sgstRate = billData.sgstRate ?? 2.5;

  const handleSendWhatsApp = async () => {
    let rawPhone = phoneInput || billData.customerPhone || '';
    let cleanPhone = rawPhone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }

    if (!cleanPhone || cleanPhone.length < 10) {
      setShowPhoneModal(true);
      return;
    }

    // Auto-generate and archive PDF receipt in background
    try {
      fetch('/api/receipts/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billData }),
      }).catch((e) => console.warn('[PDF Archive] background error:', e));
    } catch {}

    const { formatWhatsAppBillMessage, buildWhatsAppShareUrl } = await import('@/lib/whatsapp');

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://chatchaska.com';
    const hostedBillUrl = `${origin}/bill/${billData.billId}`;

    const text = formatWhatsAppBillMessage({
      id: billData.billId,
      restaurantName: billData.restaurantName,
      customerName: billData.customerName,
      customerPhone: cleanPhone,
      tableNumber: billData.tableNumber,
      totalAmount: billData.grandTotal,
      paymentMode: billData.paymentMode,
      tokenNumber: billData.tokenNumber,
      items: billData.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.unitPrice })),
      hostedBillUrl,
    });

    if ((window as any).electronAPI?.sendWhatsAppNative) {
      await (window as any).electronAPI.sendWhatsAppNative(cleanPhone, text);
    } else {
      const shareUrl = buildWhatsAppShareUrl(cleanPhone, text);
      window.open(shareUrl, '_blank');
    }

    setShowPhoneModal(false);
  };

  const separator = '- - - - - - - - - - - - - - - - - - - -';

  return (
    <>
      {/* Dark Backdrop Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none font-sans">
        
        {/* Outer Popup Card */}
        <div className="relative bg-[#FAF9F7] border border-[#E8DFC9] rounded-lg shadow-2xl flex flex-col items-center max-h-[92vh] overflow-hidden max-w-sm w-full">
          
          {/* TOP HEADER BAR: GO BACK BUTTON ON LEFT | CROSS BUTTON ON RIGHT */}
          <div className="w-full bg-[#FAF9F7] border-b border-[#E8DFC9] px-4 py-2.5 flex items-center justify-between z-10 shrink-0 select-none">
            {!hideGoBack && (
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-[#F2E5D9] text-slate-900 font-bold text-xs transition-all cursor-pointer border border-[#D9C4B0] shadow-2xs"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Go Back</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-md bg-white hover:bg-[#F2E5D9] text-slate-600 hover:text-black flex items-center justify-center transition-colors border border-[#D9C4B0] cursor-pointer shadow-2xs ml-auto"
              title="Close"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Scrollable Receipt Area */}
          <div className="p-4 flex flex-col items-center overflow-y-auto no-scrollbar flex-1 w-full bg-[#FAF9F7]">
            {/* Thermal Receipt Paper */}
            <div
              className="bg-white p-5 text-black font-mono text-xs w-full max-w-[300px] shadow-sm rounded-md border border-[#E8DFC9] select-none my-auto"
              id="receipt-print-area"
            >
              {/* Header */}
              <div className="text-center mb-3">
                {/* Token Display (1 to 100) */}
                <div className="inline-block bg-[#FAF9F7] border border-[#D9C4B0] py-1 px-3 rounded-md mb-2 font-black text-sm tracking-wider text-black">
                  TOKEN #{billData.tokenNumber || '01'}
                </div>
                <h2 className="font-bold text-base mb-1">{billData.restaurantName}</h2>
                {billData.address && <p className="text-xs whitespace-pre-wrap">{billData.address}</p>}
                {billData.gstin && <p className="text-xs font-semibold">GSTIN: {billData.gstin}</p>}
                {billData.fssai && <p className="text-xs">FSSAI: {billData.fssai}</p>}
              </div>

              <div className="text-center text-xs mb-2 overflow-hidden whitespace-nowrap">{separator}</div>

              {/* Meta Information */}
              <div className="flex justify-between text-xs mb-1">
                <span>Bill: {billData.billId}</span>
                <span>Date: {billData.date}</span>
              </div>
              <div className="flex justify-between text-xs mb-1">
                {billData.tableNumber && <span>Table: {billData.tableNumber}</span>}
                {billData.waiterName && <span>Waiter: {billData.waiterName}</span>}
              </div>
              {billData.customerName && (
                <div className="flex justify-between text-xs mb-1 font-bold text-slate-800">
                  <span>Cust: {billData.customerName}</span>
                  {billData.customerPhone && <span>Mob: {billData.customerPhone}</span>}
                </div>
              )}

              <div className="text-center text-xs mb-2 overflow-hidden whitespace-nowrap">{separator}</div>

              {/* Items Table Header */}
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="w-1/2">Item</span>
                <span className="w-1/4 text-right">Qty</span>
                <span className="w-1/4 text-right">Total</span>
              </div>

              <div className="text-center text-xs mb-2 overflow-hidden whitespace-nowrap">{separator}</div>

              {/* Items Rows */}
              <div className="space-y-1 mb-2 text-xs">
                {billData.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="w-1/2 break-words pr-1 font-medium">{item.name}</span>
                    <span className="w-1/4 text-right">{item.quantity} x ₹{item.unitPrice}</span>
                    <span className="w-1/4 text-right font-semibold">₹{item.lineTotal}</span>
                  </div>
                ))}
              </div>

              <div className="text-center text-xs mb-2 overflow-hidden whitespace-nowrap">{separator}</div>

              {/* Totals & Tax Calculation Breakdown */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatBillCurrency(billData.subtotal)}</span>
                </div>

                {Boolean(billData.discountAmount && billData.discountAmount > 0) && (
                  <div className="flex justify-between text-rose-700">
                    <span>Discount</span>
                    <span>-{formatBillCurrency(billData.discountAmount || 0)}</span>
                  </div>
                )}

                {billData.cgstAmount !== undefined && billData.cgstAmount > 0 && (
                  <div className="flex justify-between">
                    <span>CGST ({cgstRate}%)</span>
                    <span>{formatBillCurrency(billData.cgstAmount, true)}</span>
                  </div>
                )}

                {billData.sgstAmount !== undefined && billData.sgstAmount > 0 && (
                  <div className="flex justify-between">
                    <span>SGST ({sgstRate}%)</span>
                    <span>{formatBillCurrency(billData.sgstAmount, true)}</span>
                  </div>
                )}

                {billData.roundOff !== undefined && billData.roundOff !== 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Round Off</span>
                    <span>{billData.roundOff > 0 ? `+${formatBillCurrency(billData.roundOff, true)}` : formatBillCurrency(billData.roundOff, true)}</span>
                  </div>
                )}

                <div className="text-center text-xs my-1 overflow-hidden whitespace-nowrap">{separator}</div>

                <div className="flex justify-between font-extrabold text-sm pt-0.5">
                  <span>GRAND TOTAL</span>
                  <span>{formatBillCurrency(billData.grandTotal)}</span>
                </div>
              </div>

              <div className="text-center text-xs my-2 overflow-hidden whitespace-nowrap">{separator}</div>

              {/* Footer */}
              <div className="text-center text-xs space-y-1">
                <p className="font-semibold">Payment Mode: {billData.paymentMode}</p>
                <p className="font-bold pt-1">Thank You! Visit Again 🙏</p>
              </div>
            </div>
          </div>

          {/* EXACTLY ONE LONG SEND ON WHATSAPP BUTTON */}
          <div className="bg-[#FAF9F7] border-t border-[#E8DFC9] p-3 w-full shrink-0">
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="w-full py-3 px-4 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              <span>Send on WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp Number Prompt Modal (If no number was initially provided) */}
      {showPhoneModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="bg-white border border-[#E8DFC9] rounded-lg p-5 max-w-xs w-full shadow-2xl space-y-4 font-sans">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">WhatsApp Number</h3>
              <button onClick={() => setShowPhoneModal(false)} className="text-slate-400 hover:text-slate-700 text-xs">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-[#FAF9F7] border border-[#D9C4B0] rounded-md p-2.5">
                <span className="text-xs font-bold text-slate-500">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="Enter 10-digit number"
                  className="w-full bg-transparent text-xs font-mono font-bold text-slate-900 outline-none"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSendWhatsApp()}
                />
              </div>

              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="w-full py-2.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <span>Send Bill</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
