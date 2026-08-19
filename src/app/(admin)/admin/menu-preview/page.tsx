'use client';

import React, { useState, useEffect } from 'react';

export default function AdminMenuPreviewPage() {
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [cafeSlug, setCafeSlug] = useState('');

  useEffect(() => {
    fetch('/api/cafe-config').then(res => res.json()).then(data => setCafeSlug(data.slug || 'chatchaska-cafe')).catch(() => setCafeSlug('chatchaska-cafe'));
  }, []);

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
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-900">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-3xl text-blue-600">visibility</span>
            <h1 className="text-2xl font-black tracking-tight">Customer Digital Menu Preview</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Live preview of how customers experience your digital menu on mobile and tablet screens.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Device Switcher */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 gap-1">
            <button
              onClick={() => setDevice('mobile')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                device === 'mobile' ? 'bg-blue-600 text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-base">smartphone</span>
              <span>Mobile</span>
            </button>

            <button
              onClick={() => setDevice('tablet')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                device === 'tablet' ? 'bg-blue-600 text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-base">tablet</span>
              <span>Tablet</span>
            </button>

            <button
              onClick={() => setDevice('desktop')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                device === 'desktop' ? 'bg-blue-600 text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-800'
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
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 text-slate-900 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">cloud_sync</span>
            <span>{syncing ? 'Syncing...' : 'Sync Menu to Cloud'}</span>
          </button>
        </div>
      </div>

      {syncStatus && (
        <div className="bg-white border border-slate-200 p-4 rounded-2xl text-xs font-semibold">
          {syncStatus}
        </div>
      )}

      {/* Frame Mockup Container */}
      <div className="flex justify-center items-center py-6 bg-slate-50/80 border border-slate-200/80 rounded-3xl shadow-inner min-h-[720px] overflow-hidden">
        <div
          className={`transition-all duration-300 bg-slate-100 rounded-[40px] p-3 shadow-md border-4 border-slate-200 relative overflow-hidden ${
            device === 'mobile'
              ? 'w-[375px] h-[720px]'
              : device === 'tablet'
              ? 'w-[640px] h-[720px]'
              : 'w-full max-w-5xl h-[720px]'
          }`}
        >
          {/* Speaker / Camera Notch Mockup */}
          {device === 'mobile' && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-50 rounded-full z-20" />
          )}

          {/* Live Iframe */}
          <iframe
            src={`/menu/${cafeSlug}?table=Table%2012`}
            title="Menu Preview"
            className="w-full h-full rounded-[30px] bg-white border-0"
          />
        </div>
      </div>
    </div>
  );
}
