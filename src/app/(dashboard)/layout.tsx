'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { POSLayout } from '@/components/layout/POSLayout';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isLicenseActive, setIsLicenseActive] = useState<boolean>(true);
  const [licenseKeyInput, setLicenseKeyInput] = useState<string>('');
  const [licenseMsg, setLicenseMsg] = useState<string>('');
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }

    // Supreme Control: Verify software license status
    fetch('/api/license')
      .then((res) => res.json())
      .then((data) => {
        if (data.license && data.license.isActive === false) {
          setIsLicenseActive(false);
        }
      })
      .catch(() => {});
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', JSON.stringify(next));
      return next;
    });
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'activate', licenseKey: licenseKeyInput }),
      });
      const data = await res.json();
      if (data.success) {
        setIsLicenseActive(true);
        setLicenseMsg('License activated successfully!');
      } else {
        setLicenseMsg(data.message || 'Activation failed');
      }
    } catch (err) {
      setLicenseMsg('Activation request failed');
    }
  };

  // Supreme Control Lock Overlay
  if (!isLicenseActive) {
    return (
      <div className="fixed inset-0 z-50 bg-black text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-500">
            <span className="material-symbols-outlined text-[36px]">lock_reset</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">ChatChaska License Locked</h1>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your software license has expired or has been suspended by remote administrator control.
            </p>
          </div>

          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs text-zinc-400 font-mono">
            Support Line: +91 98765 43210<br />
            Email: billing@chatchaska.app
          </div>

          <form onSubmit={handleActivate} className="space-y-3 pt-2">
            <input
              type="text"
              placeholder="Enter License Key (e.g. MNT-PRO-2026)..."
              value={licenseKeyInput}
              onChange={(e) => setLicenseKeyInput(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs font-mono text-center uppercase text-white"
              required
            />
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg text-xs transition-colors"
            >
              Re-activate Software License
            </button>
          </form>

          {licenseMsg && (
            <div className="text-xs font-bold text-amber-400">{licenseMsg}</div>
          )}
        </div>
      </div>
    );
  }

  const isPOSRoute = pathname?.startsWith('/pos') || pathname?.startsWith('/kitchen') || pathname?.startsWith('/table-orders');

  if (isPOSRoute) {
    return <POSLayout>{children}</POSLayout>;
  }

  return (
    <div className="min-h-screen flex bg-background text-on-background">
      <Sidebar isCollapsed={isCollapsed} onToggleCollapse={handleToggleCollapse} />
      <div
        className={cn(
          'flex flex-col min-h-screen w-full transition-all duration-300',
          isCollapsed ? 'md:ml-[72px]' : 'md:ml-[260px]'
        )}
      >
        <MobileHeader />
        <main className="flex-1 w-full">{children}</main>
      </div>
    </div>
  );
}
