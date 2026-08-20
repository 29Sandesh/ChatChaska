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
  orderType?: 'DINE_IN' | 'PICKUP';
  onConfirm: (details: {
    orderType: 'DINE_IN' | 'PICKUP';
    tableNumber: string;
    paymentMethod: 'cash' | 'upi' | 'card';
    customerName: string;
    customerPhone: string;
    txnReference?: string;
    isPayLater?: boolean;
  }) => void;
}

const DEFAULT_TABLES = [
  'Table 1', 'Table 2', 'Table 3', 'Table 4',
  'Table 5', 'Table 6', 'Table 7', 'Table 8',
  'Table 9', 'Table 10', 'Table 11', 'Table 12',
];

export function PaymentSettlementModal({
  isOpen,
  onClose,
  grandTotal,
  tableNumber: initialTableNumber,
  itemCount,
  merchantUpiId,
  tokenNumber,
  orderType: initialOrderType = 'DINE_IN',
  onConfirm,
}: PaymentSettlementModalProps) {
  const { config } = useCafeConfig();
  const [orderType, setOrderType] = useState<'DINE_IN' | 'PICKUP'>(initialOrderType);
  const [selectedTable, setSelectedTable] = useState<string>(initialTableNumber || 'Table 1');
  const [availableTables, setAvailableTables] = useState<string[]>(DEFAULT_TABLES);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card'>('cash');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [txnReference, setTxnReference] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Fetch live tables from database
  useEffect(() => {
    async function loadTables() {
      try {
        const res = await fetch('/api/tables');
        const data = await res.json();
        if (data.tables && data.tables.length > 0) {
          setAvailableTables(data.tables.map((t: any) => t.name || t.id));
        }
      } catch (err) {
        console.error('Failed to load tables:', err);
      }
    }
    if (isOpen) {
      loadTables();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setOrderType(initialOrderType);
      setSelectedTable(initialTableNumber || 'Table 1');
      setPaymentMethod('cash');
      setCustomerName('');
      setCustomerPhone('');
      setTxnReference('');
      setPhoneError(null);
    }
  }, [isOpen, initialTableNumber, initialOrderType]);

  if (!isOpen) return null;

  const handleAction = (isPayLater: boolean) => {
    const cleanPhone = customerPhone.trim();
    if (cleanPhone && cleanPhone.length < 10) {
      setPhoneError('Please enter a valid 10-digit WhatsApp mobile number.');
      return;
    }

    setPhoneError(null);
    onConfirm({
      orderType,
      tableNumber: orderType === 'DINE_IN' ? selectedTable : 'Pick Up',
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
  const upiString = `upi://pay?pa=${encodeURIComponent(currentVpa)}&pn=${encodeURIComponent(cafeName)}&am=${grandTotal}&tn=${encodeURIComponent(`Bill ${selectedTable}`)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiString)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 select-none font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* MODAL HEADER: ORDER SUMMARY & TOTAL */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Checkout & Settlement
            </span>
            <div className="text-sm font-bold text-slate-800">
              {itemCount} {itemCount === 1 ? 'Item' : 'Items'} Selected
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 font-bold block">Total Amount</span>
            <span className="text-xl text-blue-600 font-black">₹{grandTotal}</span>
          </div>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1 no-scrollbar">

          {/* 1. ORDER TYPE: DINE IN vs PICK UP */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Select Order Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrderType('DINE_IN')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  orderType === 'DINE_IN'
                    ? 'bg-[#F8EFE7] border-[#D9C4B0] text-slate-900 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">table_restaurant</span>
                <span>🍽️ Dine In</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('PICKUP')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  orderType === 'PICKUP'
                    ? 'bg-[#F8EFE7] border-[#D9C4B0] text-slate-900 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                <span>🛍️ Pick Up / Takeaway</span>
              </button>
            </div>
          </div>

          {/* 2. TABLE SELECTION (If Dine In is chosen) */}
          {orderType === 'DINE_IN' && (
            <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Assign Table ({selectedTable})
                </label>
              </div>

              <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto no-scrollbar pt-1">
                {availableTables.map((tbl) => {
                  const isSelected = selectedTable === tbl;
                  return (
                    <button
                      key={tbl}
                      type="button"
                      onClick={() => setSelectedTable(tbl)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {tbl.replace('Table ', 'T')}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. PAYMENT METHOD SELECTION */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* CASH */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs',
                  paymentMethod === 'cash'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
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
                  'flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs',
                  paymentMethod === 'upi'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
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
                  'flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs',
                  paymentMethod === 'card'
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                )}
              >
                <span className="material-symbols-outlined text-[20px]">credit_card</span>
                Card / POS
              </button>
            </div>
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

          {/* 4. OPTIONAL CUSTOMER DETAILS */}
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Customer Name (Optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-black transition-all"
            />

            <input
              type="tel"
              placeholder="WhatsApp Mobile Number (Optional)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              maxLength={10}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-black transition-all"
            />
            {phoneError && (
              <p className="text-[11px] text-rose-600 font-bold">{phoneError}</p>
            )}
          </div>
        </div>

        {/* 5. BOTTOM ACTION BUTTONS: [ Cancel ] [ ⏳ Pay Later ] [ 🖨️ Confirm & Print ] */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
          {/* Cancel Button */}
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>

          {/* Pay Later Button */}
          <button
            type="button"
            onClick={() => handleAction(true)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
            title="Place Order as Running on Table to Pay Later"
          >
            <span className="material-symbols-outlined text-[16px] text-amber-700">schedule</span>
            <span>Pay Later</span>
          </button>

          {/* Confirm & Print Button */}
          <button
            type="button"
            onClick={() => handleAction(false)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Confirm & Print</span>
          </button>
        </div>
      </div>
    </div>
  );
}
