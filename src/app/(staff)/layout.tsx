'use client';

import React, { useState } from 'react';
import { StaffRightSidebar } from '@/components/layout/StaffRightSidebar';

export default function StaffPortalLayout({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <div className="h-screen w-screen bg-slate-50 text-slate-900 flex font-sans relative overflow-hidden">
      {/* Main Content Area - Bounded height with internal scrollbar so browser scrollbar never thickens right sidebar */}
      <main className="flex-1 h-screen overflow-y-auto mr-[72px] no-scrollbar">
        {children}
      </main>

      {/* Dark & Dull Backdrop Overlay when sidebar is expanded */}
      {isExpanded && (
        <div
          onClick={() => setIsExpanded(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1.5px] z-40 transition-all duration-300 animate-in fade-in cursor-pointer"
        />
      )}

      {/* Right-Hand Navigation Sidebar - Overlaps on top when expanded */}
      <StaffRightSidebar
        isExpanded={isExpanded}
        onToggleExpand={() => setIsExpanded((prev) => !prev)}
      />
    </div>
  );
}
