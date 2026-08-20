'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface StaffNavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_LINKS = [
  {
    href: '/staff/pos',
    label: 'POS Billing Terminal',
    description: 'Create bills, KOTs & take orders',
    icon: 'point_of_sale',
  },
  {
    href: '/staff/tables',
    label: 'Tables Floor Map',
    description: 'Live table occupancy & status',
    icon: 'grid_view',
  },
  {
    href: '/staff/orders',
    label: 'Orders Queue',
    description: 'Incoming table QR & counter tickets',
    icon: 'receipt_long',
  },
  {
    href: '/staff/kitchen',
    label: 'Kitchen Display (KDS)',
    description: 'Live cooking orders & timers',
    icon: 'soup_kitchen',
  },
  {
    href: '/staff/history',
    label: 'Bill History & Sales',
    description: 'Past receipts, EOD & daily reports',
    icon: 'history',
  },
  {
    href: '/admin',
    label: 'Cafe Admin Console',
    description: 'Menu, UPI QR, Printer & Staff setup',
    icon: 'settings',
  },
];

export function StaffNavigationDrawer({ isOpen, onClose }: StaffNavigationDrawerProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 select-none font-sans">
      {/* 1. Backdrop Overlay to Hide/Dim the Rest of Page */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* 2. Full-Height Left Slide Drawer */}
      <aside className="fixed top-0 left-0 bottom-0 w-[300px] max-w-[85vw] bg-white shadow-2xl z-50 flex flex-col justify-between animate-in slide-in-from-left duration-300 border-r border-slate-200">
        {/* Top Header with Logo & Close Button */}
        <div>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <img
              src="/chatchaska-logo.png"
              alt="ChatChaska"
              className="h-8 w-auto max-w-[160px] object-contain drop-shadow-2xs"
            />
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
              title="Close Menu"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Staff Info Banner */}
          <div className="px-4 py-3 bg-[#FAF8F5] border-b border-[#EFE9DF] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
              CC
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 truncate">Staff Terminal</h4>
              <p className="text-[11px] text-slate-500 font-medium truncate">ChatChaska POS</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)] no-scrollbar">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-start gap-3 p-3 rounded-2xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#F8EFE7] text-slate-900 font-bold shadow-2xs border border-[#E8DFC9]'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[22px] shrink-0 mt-0.5 ${
                      isActive ? 'text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    {link.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold leading-snug">{link.label}</div>
                    <div className="text-[11px] text-slate-500 font-normal leading-tight mt-0.5">
                      {link.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Exit / Logout Link */}
        <div className="p-3 border-t border-slate-100 bg-slate-50">
          <Link
            href="/login?logout=true"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-98"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Exit Terminal / Logout</span>
          </Link>
        </div>
      </aside>
    </div>
  );
}
