'use client';

import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { calculateBillTotals, formatBillCurrency } from '@/lib/billing';
import { ActionButtons } from './ActionButtons';
import styles from './BillPanel.module.css';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  veg?: boolean;
}

interface BillPanelProps {
  cart: CartItem[];
  orderType: 'DINE_IN' | 'PICKUP';
  onOrderTypeChange: (type: 'DINE_IN' | 'PICKUP') => void;
  selectedTable: string;
  onTableSelect: (table: string) => void;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  paymentMethod: 'cash' | 'upi' | 'card';
  onPaymentMethodChange: (method: 'cash' | 'upi' | 'card') => void;
  discountAmount: number;
  onDiscountChange: (amount: number) => void;
  heldCount: number;
  onHold: () => void;
  onOpenHeld: () => void;
  onSaveBill: () => void;
  onSendKOT: () => void;
}

export function BillPanel({
  cart,
  orderType,
  onOrderTypeChange,
  selectedTable,
  onTableSelect,
  onUpdateQuantity,
  paymentMethod,
  onPaymentMethodChange,
  discountAmount,
  onDiscountChange,
  heldCount,
  onHold,
  onOpenHeld,
  onSaveBill,
  onSendKOT,
}: BillPanelProps) {
  const { subtotal, totalTax, roundOff, grandTotal } = calculateBillTotals({
    items: cart.map(c => ({ price: c.price, quantity: c.quantity })),
    discountAmount,
    gstRate: 5,
  });

  const defaultTablesList = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'P1', 'P2', 'AC1', 'AC2', 'AC3', 'AC4', 'ROOF1', 'ROOF2'];
  const [tablesList, setTablesList] = useState<string[]>(defaultTablesList);

  React.useEffect(() => {
    fetch('/api/tables')
      .then(res => res.json())
      .then(data => {
        if (data.tables && Array.isArray(data.tables)) {
          const names = data.tables.map((t: any) => t.name || t.tableNumber).filter(Boolean);
          if (names.length > 0) {
            setTablesList(names);
          }
        }
      })
      .catch(err => {
        console.error('Failed to fetch tables:', err);
      });
  }, []);

  // Mouse Drag-to-Scroll State for Table selector
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!tableContainerRef.current) return;
    setIsDragging(true);
    setHasDragged(false);
    setStartX(e.pageX - tableContainerRef.current.offsetLeft);
    setScrollLeftState(tableContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !tableContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - tableContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 4) {
      setHasDragged(true);
    }
    tableContainerRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleTableClick = (tbl: string) => {
    if (!hasDragged) {
      onTableSelect(tbl);
    }
  };

  return (
    <aside className={styles.panel}>
      {/* 1. VERY TOP: Order Type Selector (Dine In / Pick Up) */}
      <div className="p-2 bg-slate-50 border-b border-slate-200 flex gap-2 shrink-0">
        <button
          className={cn(
            'flex-1 py-2 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer shadow-2xs',
            orderType === 'DINE_IN'
              ? 'bg-blue-600 text-white border-blue-600 font-extrabold'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
          )}
          onClick={() => onOrderTypeChange('DINE_IN')}
        >
          <span className="material-symbols-outlined text-[16px]">table_restaurant</span>
          Dine In
        </button>
        <button
          className={cn(
            'flex-1 py-2 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer shadow-2xs',
            orderType === 'PICKUP'
              ? 'bg-blue-600 text-white border-blue-600 font-extrabold'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
          )}
          onClick={() => onOrderTypeChange('PICKUP')}
        >
          <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
          Pick Up
        </button>
      </div>

      {/* 2. Table Selector (Shown when Dine In is active) */}
      {orderType === 'DINE_IN' && (
        <div className="p-2 bg-white border-b border-slate-200 shrink-0">
          <div
            ref={tableContainerRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className="flex items-center gap-1.5 overflow-x-auto py-1 px-0.5 cursor-grab active:cursor-grabbing select-none scrollbar-thin scrollbar-thumb-slate-300"
          >
            {tablesList.map((tbl) => (
              <button
                key={tbl}
                className={cn(
                  styles.tableBtn,
                  selectedTable === tbl && styles.selected
                )}
                onClick={() => handleTableClick(tbl)}
              >
                {tbl}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Cart Items List */}
      <div className={styles.cartList}>
        {cart.length === 0 ? (
          <div className={styles.emptyCart}>
            <span className="material-symbols-outlined text-[40px] text-slate-300 mb-2">shopping_cart</span>
            <p className="font-bold">Bill is empty</p>
            <span className="text-xs text-slate-400 mt-1">Select items from menu panel</span>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className={styles.cartItem}>
              <div className={styles.itemInfo}>
                <span className={styles.itemName}>{item.name}</span>
                <span className={styles.itemPrice}>₹{item.price} each</span>
              </div>

              <div className={styles.qtyControls}>
                <button
                  className={styles.qtyBtn}
                  onClick={() => onUpdateQuantity(item.id, -1)}
                >
                  -
                </button>
                <span className={styles.qtyValue}>{item.quantity}</span>
                <button
                  className={styles.qtyBtn}
                  onClick={() => onUpdateQuantity(item.id, 1)}
                >
                  +
                </button>
              </div>

              <span className={styles.lineTotal}>₹{item.price * item.quantity}</span>
            </div>
          ))
        )}
      </div>

      {/* Totals Section */}
      <div className={styles.totalsSection}>
        <div className={styles.summaryRow}>
          <span>Subtotal ({cart.reduce((a, c) => a + c.quantity, 0)} items)</span>
          <span>₹{subtotal}</span>
        </div>

        {subtotal > 0 && (
          <div className={styles.summaryRow}>
            <span>Discount (₹)</span>
            <input
              type="number"
              min="0"
              max={subtotal}
              value={discountAmount || ''}
              onChange={(e) => onDiscountChange(Number(e.target.value) || 0)}
              className="w-20 bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-right text-xs text-slate-900 font-bold"
              placeholder="0"
            />
          </div>
        )}

        <div className={styles.summaryRow}>
          <span>GST (5%)</span>
          <span>{formatBillCurrency(totalTax, true)}</span>
        </div>

        {roundOff !== 0 && (
          <div className={styles.summaryRow}>
            <span>Round Off</span>
            <span>{roundOff > 0 ? `+${formatBillCurrency(roundOff, true)}` : formatBillCurrency(roundOff, true)}</span>
          </div>
        )}

        <div className={styles.grandTotalRow}>
          <span>TOTAL</span>
          <span className={styles.grandTotalAmount}>₹{grandTotal}</span>
        </div>
      </div>

      {/* Action Buttons Row */}
      <ActionButtons
        isDisabled={cart.length === 0}
        heldCount={heldCount}
        onHold={onHold}
        onOpenHeld={onOpenHeld}
        onSendKOT={onSendKOT}
        onSaveBill={onSaveBill}
      />
    </aside>
  );
}
