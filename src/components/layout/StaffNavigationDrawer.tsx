"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface StaffNavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StaffNavigationDrawer({ isOpen, onClose }: StaffNavigationDrawerProps) {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);
  const [kitchenCount, setKitchenCount] = useState(0);
  const [occupiedTables, setOccupiedTables] = useState(0);
  const [totalTables, setTotalTables] = useState(0);
  const [hasActiveShift, setHasActiveShift] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchBadges() {
      try {
        const [ordersRes, tablesRes, shiftsRes] = await Promise.all([
          fetch("/api/orders").catch(() => null),
          fetch("/api/tables").catch(() => null),
          fetch("/api/shifts").catch(() => null),
        ]);

        if (ordersRes?.ok) {
          const ordersData = await ordersRes.json();
          const list = Array.isArray(ordersData) ? ordersData : ordersData.orders || [];
          const pending = list.filter((o: any) => o.status === "pending").length;
          const kitchen = list.filter((o: any) => o.status === "preparing" || o.status === "ready").length;
          setPendingCount(pending);
          setKitchenCount(kitchen);
        }

        if (tablesRes?.ok) {
          const tablesData = await tablesRes.json();
          const list = Array.isArray(tablesData) ? tablesData : tablesData.tables || [];
          setTotalTables(list.length);
          setOccupiedTables(list.filter((t: any) => t.status === "occupied").length);
        }

        if (shiftsRes?.ok) {
          const shiftsData = await shiftsRes.json();
          setHasActiveShift(Boolean(shiftsData.activeShift));
        }
      } catch (err) {
        console.error("Failed to fetch badges", err);
      }
    }

    fetchBadges();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 select-none font-sans">
      {/* Backdrop Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Full-Height RIGHT Slide Drawer */}
      <aside className="fixed top-0 right-0 bottom-0 w-[310px] max-w-[85vw] bg-white shadow-2xl z-50 flex flex-col justify-between animate-in slide-in-from-right duration-300 border-l border-[#C3A27C]/30">
        <div>
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-[#FAF7F2]">
            <img
              src="/chatchaska-logo.png"
              alt="ChatChaska"
              className="h-8 w-auto max-w-[160px] object-contain drop-shadow-2xs"
            />
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-md bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer border border-[#C3A27C]/40 shadow-2xs"
              title="Close Menu"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Staff Info Banner */}
          <div className="px-4 py-3 bg-[#FAF7F2] border-b border-[#C3A27C]/20 flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-black text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">
              CC
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 truncate">Staff Terminal</h4>
              <p className="text-[11px] text-slate-500 font-medium truncate">ChatChaska POS</p>
            </div>
          </div>

          {/* Navigation Links with Sections */}
          <nav className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-220px)] no-scrollbar">
            {/* ESSENTIAL */}
            <div className="space-y-1">
              <div className="px-2 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                Essential
              </div>
              <Link
                href="/staff/pos"
                onClick={onClose}
                className={`flex items-center justify-between p-2.5 rounded-md transition-all cursor-pointer ${
                  pathname === "/staff/pos"
                    ? "bg-[#C3A27C] text-slate-950 font-bold shadow-2xs border border-[#B2906A]"
                    : "text-slate-700 hover:bg-[#FAF7F2] hover:text-slate-950 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px]">point_of_sale</span>
                  <span className="text-xs font-bold">POS Billing Terminal</span>
                </div>
              </Link>

              <Link
                href="/staff/orders"
                onClick={onClose}
                className={`flex items-center justify-between p-2.5 rounded-md transition-all cursor-pointer ${
                  pathname === "/staff/orders"
                    ? "bg-[#C3A27C] text-slate-950 font-bold shadow-2xs border border-[#B2906A]"
                    : "text-slate-700 hover:bg-[#FAF7F2] hover:text-slate-950 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                  <span className="text-xs font-bold">Orders Queue</span>
                </div>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-sm bg-amber-500 text-white font-black text-[11px] shadow-2xs">
                    {pendingCount}
                  </span>
                )}
              </Link>
            </div>

            {/* MORE TOOLS */}
            <div className="space-y-1">
              <div className="px-2 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                More Tools
              </div>
              <Link
                href="/staff/kitchen"
                onClick={onClose}
                className={`flex items-center justify-between p-2.5 rounded-md transition-all cursor-pointer ${
                  pathname === "/staff/kitchen"
                    ? "bg-[#C3A27C] text-slate-950 font-bold shadow-2xs border border-[#B2906A]"
                    : "text-slate-700 hover:bg-[#FAF7F2] hover:text-slate-950 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px]">soup_kitchen</span>
                  <span className="text-xs font-bold">Kitchen Display (KDS)</span>
                </div>
                {kitchenCount > 0 && (
                  <span className="px-2 py-0.5 rounded-sm bg-slate-900 text-white font-black text-[11px]">
                    {kitchenCount}
                  </span>
                )}
              </Link>

              <Link
                href="/staff/tables"
                onClick={onClose}
                className={`flex items-center justify-between p-2.5 rounded-md transition-all cursor-pointer ${
                  pathname === "/staff/tables"
                    ? "bg-[#C3A27C] text-slate-950 font-bold shadow-2xs border border-[#B2906A]"
                    : "text-slate-700 hover:bg-[#FAF7F2] hover:text-slate-950 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px]">grid_view</span>
                  <span className="text-xs font-bold">Tables Floor Map</span>
                </div>
                {totalTables > 0 && (
                  <span className="px-2 py-0.5 rounded-sm bg-slate-100 text-slate-800 border border-slate-200 font-bold text-[11px]">
                    {occupiedTables}/{totalTables}
                  </span>
                )}
              </Link>

              <Link
                href="/staff/history"
                onClick={onClose}
                className={`flex items-center justify-between p-2.5 rounded-md transition-all cursor-pointer ${
                  pathname === "/staff/history"
                    ? "bg-[#C3A27C] text-slate-950 font-bold shadow-2xs border border-[#B2906A]"
                    : "text-slate-700 hover:bg-[#FAF7F2] hover:text-slate-950 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px]">history</span>
                  <span className="text-xs font-bold">Bill History & Sales</span>
                </div>
              </Link>

              <Link
                href="/staff/shift"
                onClick={onClose}
                className={`flex items-center justify-between p-2.5 rounded-md transition-all cursor-pointer ${
                  pathname === "/staff/shift"
                    ? "bg-[#C3A27C] text-slate-950 font-bold shadow-2xs border border-[#B2906A]"
                    : "text-slate-700 hover:bg-[#FAF7F2] hover:text-slate-950 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px]">point_of_sale</span>
                  <span className="text-xs font-bold">Shift & Cash Drawer</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                    hasActiveShift
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {hasActiveShift ? "Active" : "No Shift"}
                </span>
              </Link>

              <Link
                href="/admin"
                onClick={onClose}
                className="flex items-center justify-between p-2.5 rounded-md text-slate-700 hover:bg-[#FAF7F2] hover:text-slate-950 transition-all border border-transparent"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px]">settings</span>
                  <span className="text-xs font-bold">Cafe Admin Console</span>
                </div>
              </Link>
            </div>
          </nav>
        </div>

        {/* Bottom Exit */}
        <div className="p-3 border-t border-slate-100 bg-[#FAF7F2]">
          <Link
            href="/login?logout=true"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-98"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Exit Terminal / Logout</span>
          </Link>
        </div>
      </aside>
    </div>
  );
}

export default StaffNavigationDrawer;
