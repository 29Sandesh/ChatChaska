'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { SyncStatusBadge } from '@/components/layout/SyncStatusBadge';

export interface TopBarProps {
  title?: string;
  actions?: React.ReactNode;
}

export function TopBar({ title = 'Dashboard', actions }: TopBarProps) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI?.isDesktop) {
      setIsDesktop(true);
    }
  }, []);

  const handleMinimize = () => {
    if (window.electronAPI?.minimizeToTray) {
      window.electronAPI.minimizeToTray();
    }
  };

  return (
    <header className="topbar flex items-center justify-between px-6 py-3 bg-surface border-b border-outline-variant/20">
      <div className="flex items-center gap-3">
        <h1 className="font-headline-md text-headline-md text-on-background">{title}</h1>
        <SyncStatusBadge />
        {isDesktop && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Desktop POS Mode
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {actions}
        {isDesktop && (
          <button
            onClick={handleMinimize}
            className="btn-icon text-outline hover:text-on-background"
            title="Minimize to System Tray"
          >
            <span className="material-symbols-outlined text-[20px]">minimize</span>
          </button>
        )}
        <Link href="/notifications" className="btn-icon relative">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary-container" />
        </Link>
        <Link href="/profile" className="w-9 h-9 rounded-full overflow-hidden border border-outline-variant/30">
          <div className="w-full h-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">
            JD
          </div>
        </Link>
      </div>
    </header>
  );
}
