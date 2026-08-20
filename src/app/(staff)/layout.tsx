'use client';

import React from 'react';
import { StaffNavbar } from '@/components/layout/StaffNavbar';

export default function StaffPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative overflow-hidden">
      {/* Top Navigation Bar with Logo, Tabs, and ☰ Menu */}
      <StaffNavbar />

      {/* Main Page Content */}
      <main className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
}
