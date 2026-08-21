'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function AdminSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { label: 'Public Profile & Discovery', href: '/admin/settings/profile', icon: 'storefront' },
    { label: 'GST, Taxes & UPI', href: '/admin/settings/gst', icon: 'receipt_long' },
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Settings Navigation Tabs */}
      <div className="mb-6 flex border-b border-slate-200/60 gap-2 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap',
                isActive
                  ? 'border-[#C3A27C] text-slate-950 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-600'
              )}
            >
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
