'use client';

import React, { useState, useEffect } from 'react';

export default function AdminMenuPreviewPage() {
  const [cafeSlug, setCafeSlug] = useState('chatchaska-cafe');
  const [cafeName, setCafeName] = useState('ChatChaska Cafe');
  
  // Dietary Settings
  const [restaurantType, setRestaurantType] = useState<'both' | 'pure_veg' | 'non_veg'>('both');
  const [showJain, setShowJain] = useState(true);
  const [allowSelfOrder, setAllowSelfOrder] = useState(true);
  const [allowCallWaiter, setAllowCallWaiter] = useState(true);
  
  const [copied, setCopied] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    fetch('/api/cafe-config')
      .then((res) => res.json())
      .then((data) => {
        if (data.slug) setCafeSlug(data.slug);
        if (data.cafeName) setCafeName(data.cafeName);
      })
      .catch(() => setCafeSlug('chatchaska-cafe'));

    // Fetch existing dietary settings from database
    fetch('/api/settings?key=restaurant_type')
      .then((res) => res.json())
      .then((data) => {
        if (data.value) setRestaurantType(data.value);
      })
      .catch(() => {});

    fetch('/api/settings?key=show_jain_filter')
      .then((res) => res.json())
      .then((data) => {
        if (data.value != null) setShowJain(data.value === 'true');
      })
      .catch(() => {});
  }, []);

  const handleSaveSettings = async () => {
    try {
      await Promise.all([
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'restaurant_type', value: restaurantType }),
        }),
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'show_jain_filter', value: String(showJain) }),
        }),
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'allow_self_order', value: String(allowSelfOrder) }),
        }),
      ]);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    } catch {
      alert('Failed to save settings');
    }
  };

  const previewUrl = `/menu/${cafeSlug}?table=Table%201&type=${restaurantType}&jain=${showJain ? '1' : '0'}`;

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}${previewUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 select-none font-sans">
      {/* Toast */}
      {savedToast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white font-bold px-4 py-3 rounded-md shadow-2xl flex items-center gap-2 border border-slate-700 text-xs animate-in slide-in-from-top">
          <span>✅</span> Menu display preferences saved successfully!
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Menu Preview & Display Controls</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Test and customize how customers experience your digital QR menu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#FAF7F2] hover:bg-[#C3A27C]/20 text-slate-900 border border-[#C3A27C]/50 font-bold px-3.5 py-2 rounded-md text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            <span>Open Fullscreen</span>
          </a>

          <button
            onClick={handleSaveSettings}
            className="bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 border border-[#B2906A] font-extrabold px-4 py-2 rounded-md text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>Save Preferences</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid: Left = Mobile Frame, Right = Options */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Interactive Mobile Mockup */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="w-[360px] sm:w-[380px] h-[760px] bg-slate-950 rounded-[46px] p-3.5 shadow-2xl border-4 border-slate-800 relative overflow-hidden flex flex-col shrink-0">
            {/* Phone Speaker & Camera Notch */}
            <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-20 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800 mr-2" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            </div>

            {/* Live Customer Menu iFrame */}
            <iframe
              key={previewUrl}
              src={previewUrl}
              title="Live Customer QR Menu"
              className="w-full h-full rounded-[36px] bg-white border-0 overflow-hidden"
            />
          </div>

          <p className="text-[11px] text-slate-400 font-medium text-center mt-3 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">touch_app</span>
            Interactive live preview — click and test ordering inside the phone.
          </p>
        </div>

        {/* RIGHT COLUMN: Customization & Dietary Options */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card 1: Restaurant Dietary Classification */}
          <div className="bg-white border border-slate-200 rounded-md p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="material-symbols-outlined text-slate-900 text-[18px]">restaurant</span>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Restaurant Dietary Profile
              </h2>
            </div>
            <p className="text-xs text-slate-600">
              Select the primary dietary type of your kitchen. This adjusts customer filter toggles automatically.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {[
                {
                  id: 'both',
                  title: 'Both Veg & Non-Veg',
                  desc: 'Standard mixed menu with both veg & non-veg options',
                  badge: 'Mixed Kitchen',
                },
                {
                  id: 'pure_veg',
                  title: '🟢 Pure Veg Only',
                  desc: '100% vegetarian outlet; hides all non-veg filters',
                  badge: 'Pure Veg',
                },
                {
                  id: 'non_veg',
                  title: '🔴 Non-Veg Kitchen',
                  desc: 'Specialty non-veg & meat-focused kitchen',
                  badge: 'Non-Veg',
                },
              ].map((opt) => {
                const isSelected = restaurantType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setRestaurantType(opt.id as any)}
                    className={`p-3 rounded-md text-left transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-[#FAF7F2] border-[#C3A27C] ring-2 ring-[#C3A27C]/30 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-slate-900">{opt.title}</span>
                      {isSelected && <span className="text-xs font-bold text-[#8C6D47]">✓</span>}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 2: Special Dietary & Filter Toggles */}
          <div className="bg-white border border-slate-200 rounded-md p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="material-symbols-outlined text-slate-900 text-[18px]">tune</span>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Customer Dietary Filters & Badges
              </h2>
            </div>

            <div className="space-y-3">
              {/* Jain Option Toggle */}
              <label className="flex items-center justify-between p-3 rounded-md bg-slate-50 border border-slate-200 hover:bg-slate-100/60 transition-colors cursor-pointer">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Show Jain Food Option (🟡 Jain)</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-sm">Recommended</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Adds a &quot;Jain Friendly&quot; filter pill on your customer menu for dishes prepared without onion and garlic.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={showJain}
                  onChange={(e) => setShowJain(e.target.checked)}
                  className="w-4 h-4 rounded-md accent-[#C3A27C] cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Card 3: Service & Ordering Options */}
          <div className="bg-white border border-slate-200 rounded-md p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="material-symbols-outlined text-slate-900 text-[18px]">touch_app</span>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Customer Ordering & Service
              </h2>
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-md bg-slate-50 border border-slate-200 hover:bg-slate-100/60 transition-colors cursor-pointer">
                <div className="space-y-0.5 pr-4">
                  <span className="text-xs font-bold text-slate-900">Allow Self-Ordering from Phone (Instant POS sync)</span>
                  <p className="text-[11px] text-slate-500">
                    Customers can browse and place direct table orders to the POS and kitchen.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={allowSelfOrder}
                  onChange={(e) => setAllowSelfOrder(e.target.checked)}
                  className="w-4 h-4 rounded-md accent-[#C3A27C] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-md bg-slate-50 border border-slate-200 hover:bg-slate-100/60 transition-colors cursor-pointer">
                <div className="space-y-0.5 pr-4">
                  <span className="text-xs font-bold text-slate-900">Enable &quot;Call Waiter&quot; and &quot;Request Bill&quot; Buttons</span>
                  <p className="text-[11px] text-slate-500">
                    Allows guests to request physical assistance or their payment bill from their phone.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={allowCallWaiter}
                  onChange={(e) => setAllowCallWaiter(e.target.checked)}
                  className="w-4 h-4 rounded-md accent-[#C3A27C] cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Card 4: Quick Share & QR Link */}
          <div className="bg-slate-50 border border-slate-200 rounded-md p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="space-y-0.5 text-left w-full sm:w-auto">
              <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                <span>Live Menu Direct URL</span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono break-all">
                {typeof window !== 'undefined' ? window.location.origin : ''}{previewUrl}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleCopyLink}
                className="bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-bold px-3 py-1.5 rounded-md text-xs flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {copied ? 'check' : 'content_copy'}
                </span>
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
