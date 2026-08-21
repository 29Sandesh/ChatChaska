'use client';

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminMobileNav } from '@/components/layout/AdminMobileNav';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { cn } from '@/lib/utils';

interface AccessInfo {
  allowed: boolean;
  reason: string;
  daysLeft: number;
  status: string;
  showWarning: boolean;
  warningMessage: string | null;
}

export default function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [accessInfo, setAccessInfo] = useState<AccessInfo | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed');
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }

    // Check subscription / trial access
    fetch('/api/subscription/check')
      .then((res) => res.json())
      .then((data) => {
        if (data.access) {
          setAccessInfo(data.access);
        }
      })
      .catch(() => {
        // Silently ignore or assume normal access in offline mode
      });
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(next));
      return next;
    });
  };

  return (
    <>
      <AdminMobileNav />
      <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans">
        <AdminSidebar isCollapsed={isCollapsed} onToggleCollapse={handleToggleCollapse} />
        <div
        className={cn(
          'flex flex-col min-h-screen w-full transition-all duration-300',
          isCollapsed ? 'md:ml-[72px]' : 'md:ml-[240px]'
        )}
      >
        {/* Trial / Payment Warning Banner */}
        {accessInfo?.showWarning && accessInfo.warningMessage && (
          <div className="bg-amber-500 text-slate-950 font-bold px-4 py-2 text-xs flex items-center justify-between shadow-sm select-none border-b border-amber-600">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              <span>{accessInfo.warningMessage}</span>
            </div>
            <a
              href="mailto:billing@chatchaska.com?subject=ChatChaska Subscription Upgrade"
              className="bg-slate-950 hover:bg-slate-800 text-white px-3 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wide transition-all shadow-xs"
            >
              Contact Support / Upgrade
            </a>
          </div>
        )}

        {/* Lockout Screen if Access Expired or Suspended */}
        {accessInfo && !accessInfo.allowed && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-md p-8 max-w-md w-full text-center space-y-5 shadow-2xl border border-slate-200">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-md flex items-center justify-center mx-auto shadow-inner">
                <span className="material-symbols-outlined text-[36px]">lock</span>
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl font-black text-slate-900">Access Restricted</h2>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {accessInfo.reason}
                </p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-md text-left space-y-2 text-xs">
                <div className="font-bold text-slate-700">How to reactivate your cafe POS:</div>
                <div className="text-slate-500">• Reach out to the ChatChaska platform admin</div>
                <div className="text-slate-500">• Clear overdue invoices or choose a custom plan</div>
              </div>
              <div className="flex flex-col gap-2">
                <a
                  href="mailto:support@chatchaska.com?subject=Reactivate My Cafe Account"
                  className="w-full bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 border border-[#B2906A] font-black py-3 rounded-md text-xs transition-all shadow-md"
                >
                  Contact Support (support@chatchaska.com)
                </a>
                <a
                  href="/login"
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold py-1"
                >
                  Back to Login
                </a>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 w-full">{children}</main>
      </div>
    </div>
    <OfflineBanner />
    </>
  );
}
