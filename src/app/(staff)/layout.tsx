'use client';

import React from 'react';

export default function StaffPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-screen bg-slate-50 text-slate-900 flex font-sans relative overflow-hidden">
      {/* Full screen edge-to-edge content */}
      <main className="flex-1 h-screen overflow-y-auto no-scrollbar">
        {children}
      </main>
    </div>
  );
}
