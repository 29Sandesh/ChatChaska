'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { StaffNavigationDrawer } from '@/components/layout/StaffNavigationDrawer';

interface NavLinkItem {
  id: string;
  label: string;
  href: string;
  icon: string;
}

const NAV_ITEMS: NavLinkItem[] = [
  { id: 'pos', label: 'POS Billing', href: '/staff/pos', icon: 'point_of_sale' },
  { id: 'tables', label: 'Tables Map', href: '/staff/tables', icon: 'grid_view' },
  { id: 'orders', label: 'Orders Queue', href: '/staff/orders', icon: 'receipt_long' },
  { id: 'kitchen', label: 'Kitchen Display', href: '/staff/kitchen', icon: 'soup_kitchen' },
  { id: 'history', label: 'Bill History', href: '/staff/history', icon: 'history' },
];

export function StaffNavbar() {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const isPOS = pathname === '/staff/pos';

  return (
    <>
      {!isPOS && (
        <header className="h-16 bg-white border-b border-[#EBEBEB] px-5 flex items-center justify-between gap-4 shrink-0 select-none shadow-2xs z-30 sticky top-0 font-sans">
          {/* Left: Official Logo */}
          <div className="flex items-center gap-4">
            <Link href="/staff/pos" className="flex items-center">
              <img
                src="/chatchaska-logo.png"
                alt="ChatChaska"
                className="h-8 w-auto max-w-[160px] object-contain drop-shadow-2xs"
              />
            </Link>
          </div>

          {/* Center: Navigation Tabs */}
          <nav className="flex items-center gap-1.5 bg-[#FAF9F7] p-1 rounded-2xl border border-slate-200/80">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
                    isActive
                      ? 'bg-black text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  )}
                >
                  <span className="material-symbols-outlined text-[17px]">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Quick POS Return + CC Avatar + Hamburger Menu ☰ */}
          <div className="flex items-center gap-3">
            <Link
              href="/staff/pos"
              className="px-3.5 py-2 bg-[#F8EFE7] hover:bg-[#F2E5D9] text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px]">
                arrow_back
              </span>
              <span>Back to POS</span>
            </Link>

            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              CC
            </div>

            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-900 transition-all cursor-pointer"
              title="Navigation Menu"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
          </div>
        </header>
      )}

      {/* Global Staff Left Navigation Drawer */}
      <StaffNavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
