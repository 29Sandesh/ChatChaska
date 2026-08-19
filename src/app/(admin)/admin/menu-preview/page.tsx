'use client';

import React, { useState } from 'react';

export default function AdminMenuPreviewPage() {
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleSyncToCloud = async () => {
    setSyncing(true);
    setSyncStatus(null);
    try {
      const res = await fetch('/api/admin/menu-sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncStatus(`✅ Successfully synced ${data.synced.items} items and ${data.synced.categories} categories to Cloud!`);
      } else {
        setSyncStatus(`❌ Sync failed: ${data.error}`);
      }
    } catch (err: any) {
      setSyncStatus(`❌ Sync error: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-white">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-3xl text-orange-400">visibility</span>
            <h1 className="text-2xl font-black tracking-tight">Customer Digital Menu Preview</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Live preview of how customers experience your digital menu on mobile and tablet screens.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Device Switcher */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1 gap-1">
            <button
              onClick={() => setDevice('mobile')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                device === 'mobile' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-base">smartphone</span>
              <span>Mobile</span>
            </button>

            <button
              onClick={() => setDevice('tablet')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                device === 'tablet' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-base">tablet</span>
              <span>Tablet</span>
            </button>

            <button
              onClick={() => setDevice('desktop')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                device === 'desktop' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-base">desktop_windows</span>
              <span>Full Screen</span>
            </button>
          </div>

          {/* Sync to Cloud Button */}
          <button
            onClick={handleSyncToCloud}
            disabled={syncing}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">cloud_sync</span>
            <span>{syncing ? 'Syncing...' : 'Sync Menu to Cloud'}</span>
          </button>
        </div>
      </div>

      {syncStatus && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-xs font-semibold">
          {syncStatus}
        </div>
      )}

      {/* Frame Mockup Container */}
      <div className="flex justify-center items-center py-6 bg-slate-950/80 border border-slate-800/80 rounded-3xl shadow-inner min-h-[720px] overflow-hidden">
        <div
          className={`transition-all duration-300 bg-black rounded-[40px] p-3 shadow-2xl border-4 border-slate-700 relative overflow-hidden ${
            device === 'mobile'
              ? 'w-[375px] h-[720px]'
              : device === 'tablet'
              ? 'w-[640px] h-[720px]'
              : 'w-full max-w-5xl h-[720px]'
          }`}
        >
          {/* Speaker / Camera Notch Mockup */}
          {device === 'mobile' && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-800 rounded-full z-20" />
          )}

          {/* Live Iframe */}
          <iframe
            src="/menu/chatchaska-cafe?table=Table%2012"
            title="Menu Preview"
            className="w-full h-full rounded-[30px] bg-white border-0"
          />
        </div>
      </div>
    </div>
  );
}
