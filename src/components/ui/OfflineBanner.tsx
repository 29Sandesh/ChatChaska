'use client';

import React, { useState, useEffect } from 'react';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== 'undefined') {
      setIsOffline(!window.navigator.onLine);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <aside aria-label="Offline Status" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom duration-300 select-none font-sans">
      <div className="bg-slate-950 text-white px-4 py-2 rounded-md shadow-2xl border border-amber-500/60 flex items-center gap-2.5 text-xs font-bold backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
        <span className="material-symbols-outlined text-[16px] text-amber-400">cloud_off</span>
        <span>Offline Mode Active — Local billing running smoothly. Cloud sync will resume on reconnect.</span>
      </div>
    </aside>
  );
}

export default OfflineBanner;
