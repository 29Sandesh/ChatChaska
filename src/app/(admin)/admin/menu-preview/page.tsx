'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

export default function AdminMenuPreviewPage() {
  const [cafeSlug, setCafeSlug] = useState('chatchaska-cafe');
  const [cafeName, setCafeName] = useState('ChatChaska Cafe');
  
  // Dietary Settings
  const [restaurantType, setRestaurantType] = useState<'both' | 'pure_veg' | 'non_veg'>('both');
  const [showJain, setShowJain] = useState(true);
  const [allowCallWaiter, setAllowCallWaiter] = useState(true);
  
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
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

  const previewUrl = `/menu/${cafeSlug}?table=Table%201&type=${restaurantType}&jain=${showJain ? '1' : '0'}`;

  // Generate QR Code dynamically
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fullUrl = `${window.location.origin}${previewUrl}`;
      QRCode.toDataURL(fullUrl, {
        width: 240,
        margin: 1,
        color: {
          dark: '#020617',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error('Failed to generate QR:', err));
    }
  }, [previewUrl]);

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
          body: JSON.stringify({ key: 'allow_call_waiter', value: String(allowCallWaiter) }),
        }),
      ]);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    } catch {
      alert('Failed to save settings');
    }
  };

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}${previewUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrCodeUrl) return;
    const a = document.createElement('a');
    a.href = qrCodeUrl;
    a.download = `${cafeSlug}-menu-qr.png`;
    a.click();
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
              className="w-full h-full rounded-[36px] bg-white border-0 overflow-y-auto hide-scrollbar no-scrollbar"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            />
          </div>

          <p className="text-[11px] text-slate-400 font-medium text-center mt-3 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">touch_app</span>
            Interactive live preview — click and scroll inside the phone.
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
                },
                {
                  id: 'pure_veg',
                  title: '🟢 Pure Veg Only',
                  desc: '100% vegetarian outlet; hides all non-veg filters',
                },
                {
                  id: 'non_veg',
                  title: '🔴 Non-Veg Kitchen',
                  desc: 'Specialty non-veg & meat-focused kitchen',
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

          {/* Half-Length Split: Left = Jain & Service Buttons, Right = QR Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {/* LEFT HALF: Jain Filter & Service Buttons */}
            <div className="space-y-4 flex flex-col justify-between">
              {/* Jain Option Toggle Card */}
              <div className="bg-white border border-slate-200 rounded-md p-4 shadow-2xs space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-amber-600">eco</span>
                    Jain Food Filter
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-sm">
                    Recommended
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Adds a &quot;Jain Friendly&quot; filter pill on your customer menu for dishes prepared without onion and garlic.
                </p>
                <label className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 border border-slate-200 hover:bg-slate-100/60 transition-colors cursor-pointer mt-2">
                  <span className="text-xs font-bold text-slate-900">Show Jain Option (🟡 Jain)</span>
                  <input
                    type="checkbox"
                    checked={showJain}
                    onChange={(e) => setShowJain(e.target.checked)}
                    className="w-4 h-4 rounded-md accent-[#C3A27C] cursor-pointer"
                  />
                </label>
              </div>

              {/* Call Waiter & Request Bill Card */}
              <div className="bg-white border border-slate-200 rounded-md p-4 shadow-2xs space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-slate-900">room_service</span>
                    Customer Service
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Allows guests to request physical waiter assistance or request their payment bill from their phone.
                </p>
                <label className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 border border-slate-200 hover:bg-slate-100/60 transition-colors cursor-pointer mt-2">
                  <span className="text-xs font-bold text-slate-900">Call Waiter & Bill Buttons</span>
                  <input
                    type="checkbox"
                    checked={allowCallWaiter}
                    onChange={(e) => setAllowCallWaiter(e.target.checked)}
                    className="w-4 h-4 rounded-md accent-[#C3A27C] cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* RIGHT HALF: Real-Time Scannable QR Code */}
            <div className="bg-white border border-slate-200 rounded-md p-5 shadow-2xs flex flex-col items-center justify-between text-center space-y-3">
              <div>
                <div className="flex items-center justify-center gap-1.5 text-xs font-black text-slate-900 uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                  <span>Scan to Test on Phone</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Point your phone camera to test live on mobile
                </p>
              </div>

              {/* QR Image Box */}
              <div className="p-2.5 bg-white border-2 border-slate-200 rounded-md shadow-inner flex items-center justify-center">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="Menu QR Code"
                    className="w-36 h-36 object-contain rounded-sm"
                  />
                ) : (
                  <div className="w-36 h-36 bg-slate-100 animate-pulse rounded-sm flex items-center justify-center text-xs text-slate-400">
                    Generating QR...
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full pt-1">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 font-bold py-2 px-2.5 rounded-md text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                  <span>{copied ? 'Copied' : 'Copy Link'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="flex-1 bg-[#FAF7F2] hover:bg-[#C3A27C]/20 text-slate-900 border border-[#C3A27C]/50 font-bold py-2 px-2.5 rounded-md text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <span className="material-symbols-outlined text-[14px]">download</span>
                  <span>Save QR</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
