'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { QRScannerSheet } from '@/components/customer/QRScannerSheet';

export default function CustomerAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const tabs = [
    { label: 'Explore', href: '/explore', icon: 'explore' },
    { label: 'Orders', href: '/my-orders', icon: 'receipt_long' },
    { label: 'Scan QR', action: () => setIsScannerOpen(true), icon: 'qr_code_scanner', isPrimary: true },
    { label: 'Profile', href: '/my-profile', icon: 'person' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      {/* Page Content */}
      <main className="flex-1">{children}</main>

      {/* Floating Bottom Navigation Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800/80 px-4 py-2 flex items-center justify-around max-w-lg mx-auto md:rounded-t-3xl shadow-2xl">
        {tabs.map((tab, idx) => {
          if (tab.action) {
            return (
              <button
                key={idx}
                onClick={tab.action}
                className="flex flex-col items-center justify-center -mt-5 bg-gradient-to-tr from-orange-500 to-amber-400 text-white w-13 h-13 rounded-full shadow-lg shadow-orange-500/30 hover:scale-105 transition-transform cursor-pointer"
              >
                <span className="material-symbols-outlined text-2xl">{tab.icon}</span>
              </button>
            );
          }

          const isActive = pathname.startsWith(tab.href!);
          return (
            <Link
              key={idx}
              href={tab.href!}
              className={`flex flex-col items-center justify-center py-1 px-3 text-[11px] font-semibold transition-colors ${
                isActive ? 'text-orange-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-xl mb-0.5">{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* QR Scanner Sheet */}
      <QRScannerSheet isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </div>
  );
}
