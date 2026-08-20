'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { StaffNavigationDrawer } from '@/components/layout/StaffNavigationDrawer';

export function StaffNavbar() {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Pages with their own customized full-width top headers
  const isCustomHeader =
    pathname === '/staff/pos' ||
    pathname === '/staff/orders' ||
    pathname === '/staff/kitchen';

  return (
    <>
      {!isCustomHeader && (
        <header className="h-16 bg-white border-b border-[#EBEBEB] px-5 flex items-center justify-between gap-4 shrink-0 select-none shadow-2xs z-30 sticky top-0 font-sans">
          {/* Left: Official Brand Logo */}
          <div className="flex items-center gap-4">
            <Link href="/staff/pos" className="flex items-center">
              <img
                src="/chatchaska-logo.png"
                alt="ChatChaska"
                className="h-8 w-auto max-w-[160px] object-contain drop-shadow-2xs"
              />
            </Link>
          </div>

          {/* Right: POS Quick Button + Right Navigation Drawer Trigger */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/staff/pos"
              className="px-3.5 py-1.5 bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs border border-[#B2906A]"
            >
              <span className="material-symbols-outlined text-[16px]">
                point_of_sale
              </span>
              <span>POS</span>
            </Link>

            {/* Hamburger ☰ (Opens Navigation Drawer from the RIGHT) */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="w-9 h-9 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-900 transition-all cursor-pointer border border-slate-200"
              title="Navigation Menu"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
          </div>
        </header>
      )}

      {/* Global Staff Right Navigation Drawer */}
      <StaffNavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
