'use client';

import React, { useState, useEffect } from 'react';

export interface OrderTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTable: string;
  orderType: 'DINE_IN' | 'PICKUP';
  onProceed: (orderType: 'DINE_IN' | 'PICKUP', tableNumber: string) => void;
}

export function OrderTypeModal({
  isOpen,
  onClose,
  selectedTable: initialTable,
  orderType: initialOrderType,
  onProceed,
}: OrderTypeModalProps) {
  const [orderType, setOrderType] = useState<'DINE_IN' | 'PICKUP'>(initialOrderType || 'DINE_IN');
  const [selectedTable, setSelectedTable] = useState<string>(initialTable || 'Table 1');
  const [unoccupiedTables, setUnoccupiedTables] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      setOrderType(initialOrderType || 'DINE_IN');
      setSelectedTable(initialTable || 'Table 1');
      setLoading(true);

      fetch('/api/tables')
        .then((res) => res.json())
        .then((data) => {
          if (data.tables && Array.isArray(data.tables)) {
            // Filter only unoccupied (free) tables
            const free = data.tables
              .filter((t: any) => t.status === 'free')
              .map((t: any) => t.name || t.id);

            if (free.length > 0) {
              setUnoccupiedTables(free);
              if (!free.includes(selectedTable)) {
                setSelectedTable(free[0]);
              }
            } else {
              setUnoccupiedTables(data.tables.map((t: any) => t.name || t.id));
            }
          } else {
            setUnoccupiedTables(['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Table 6']);
          }
        })
        .catch(() => {
          setUnoccupiedTables(['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Table 6']);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, initialTable, initialOrderType]);

  if (!isOpen) return null;

  const handleContinue = () => {
    onProceed(orderType, orderType === 'DINE_IN' ? selectedTable : 'Pick Up');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 select-none font-sans">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-2xl border border-[#E8DFC9] overflow-hidden flex flex-col">
        
        {/* Brand Themed Header (Box Shaped) */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#FAF9F7] border-b border-[#E8DFC9]">
          <h3 className="text-sm font-bold text-black">Select Order Type</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-sm hover:bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4 bg-white">
          {/* Order Type Toggle: Dine In vs Pick Up (Box-Shaped) */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setOrderType('DINE_IN')}
              className={`py-3 px-3 rounded-md border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                orderType === 'DINE_IN'
                  ? 'bg-[#F8EFE7] border-[#D9C4B0] text-black shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-[#FAF9F7]'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">table_restaurant</span>
              <span>Dine In</span>
            </button>

            <button
              type="button"
              onClick={() => setOrderType('PICKUP')}
              className={`py-3 px-3 rounded-md border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                orderType === 'PICKUP'
                  ? 'bg-[#F8EFE7] border-[#D9C4B0] text-black shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-[#FAF9F7]'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
              <span>Pick Up</span>
            </button>
          </div>

          {/* Unoccupied Table Selector (Only when Dine In is active) */}
          {orderType === 'DINE_IN' && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Available Tables</span>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm font-semibold border border-emerald-200">
                  {unoccupiedTables.length} Free
                </span>
              </div>

              {loading ? (
                <div className="text-center py-4 text-xs text-slate-400">Loading tables...</div>
              ) : unoccupiedTables.length === 0 ? (
                <div className="text-center py-4 text-xs text-amber-800 font-semibold bg-amber-50 rounded-md border border-amber-200">
                  All tables currently occupied
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto no-scrollbar">
                  {unoccupiedTables.map((tbl) => {
                    const isSelected = selectedTable === tbl;
                    return (
                      <button
                        key={tbl}
                        type="button"
                        onClick={() => setSelectedTable(tbl)}
                        className={`py-2 px-1 text-xs font-bold rounded-sm transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-black text-white shadow-xs'
                            : 'bg-[#FAF9F7] border border-[#E8DFC9] text-slate-800 hover:bg-[#F2E5D9]'
                        }`}
                      >
                        {tbl.replace('Table ', 'T')}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Brand Themed Footer Actions: Box-Shaped */}
        <div className="p-4 bg-[#FAF9F7] border-t border-[#E8DFC9] flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-md border border-[#D9C4B0] bg-white hover:bg-[#F2E5D9] text-slate-800 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="flex-1 py-2.5 rounded-md bg-black hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-xs"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
