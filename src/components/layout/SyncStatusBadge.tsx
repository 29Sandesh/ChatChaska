'use client';

import React, { useState, useEffect } from 'react';

export function SyncStatusBadge() {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    const updateOnlineStatus = () => {
      if (typeof window !== 'undefined' && navigator) {
        setIsOnline(navigator.onLine);
      }
    };

    updateOnlineStatus();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Periodically check desktop Electron network status if available
    const interval = setInterval(async () => {
      if (window.electronAPI?.getNetworkStatus) {
        try {
          const res = await window.electronAPI.getNetworkStatus();
          setIsOnline(res.online);
        } catch (e) {
          // fallback
        }
      }
    }, 10000);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
        isOnline
          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
      }`}
      title={isOnline ? 'Online — SQLite persistent & synced' : 'Offline Mode — Operating on Local SQLite DB'}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
        }`}
      />
      <span>{isOnline ? 'SQLite Synced' : 'Offline DB Active'}</span>
    </div>
  );
}
