'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export default function AdminMenuPreviewPage() {
  const [cafeSlug, setCafeSlug] = useState('chatchaska-cafe');
  const [cafeName, setCafeName] = useState('ChatChaska Cafe');
  const [cafeLogo, setCafeLogo] = useState<string>('');
  const [cafeBanner, setCafeBanner] = useState<string>('');
  
  // Dietary Settings
  const [restaurantType, setRestaurantType] = useState<'both' | 'pure_veg' | 'non_veg'>('both');
  const [showJain, setShowJain] = useState(true);
  const [allowCallWaiter, setAllowCallWaiter] = useState(true);
  
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [iframeKey, setIframeKey] = useState(1);

  // Cropper Modal States
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string>('');
  const [cropTarget, setCropTarget] = useState<'logo' | 'banner'>('logo');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetch('/api/cafe-config')
      .then((res) => res.json())
      .then((data) => {
        if (data.slug) setCafeSlug(data.slug);
        if (data.cafeName) setCafeName(data.cafeName);
      })
      .catch(() => setCafeSlug('chatchaska-cafe'));

    // Fetch existing settings
    Promise.all([
      fetch('/api/settings?key=restaurant_type').then((r) => r.json()),
      fetch('/api/settings?key=show_jain_filter').then((r) => r.json()),
      fetch('/api/settings?key=allow_call_waiter').then((r) => r.json()),
      fetch('/api/settings?key=cafe_logo').then((r) => r.json()),
      fetch('/api/settings?key=cafe_banner').then((r) => r.json()),
    ]).then(([dietData, jainData, waiterData, logoData, bannerData]) => {
      if (dietData.value) setRestaurantType(dietData.value);
      if (jainData.value != null) setShowJain(jainData.value === 'true');
      if (waiterData.value != null) setAllowCallWaiter(waiterData.value === 'true');
      if (logoData.value) setCafeLogo(logoData.value);
      if (bannerData.value) setCafeBanner(bannerData.value);
    }).catch(() => {});
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

  // Redraw Canvas for Cropping
  useEffect(() => {
    if (!cropModalOpen || !canvasRef.current || !rawImageSrc) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = rawImageSrc;
    img.onload = () => {
      imageObjRef.current = img;
      renderCanvas();
    };
  }, [cropModalOpen, rawImageSrc, zoom, pan, cropTarget]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const aspect = cropTarget === 'logo' ? 1 : 16 / 9;
    const targetW = canvas.width;
    const targetH = canvas.width / aspect;

    ctx.save();
    ctx.translate(canvas.width / 2 + pan.x, canvas.height / 2 + pan.y);
    ctx.scale(zoom, zoom);

    const imgAspect = img.width / img.height;
    let drawW = targetW;
    let drawH = targetW / imgAspect;

    if (drawH < targetH) {
      drawH = targetH;
      drawW = targetH * imgAspect;
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCropTarget(target);
    const reader = new FileReader();
    reader.onload = (event) => {
      setRawImageSrc(event.target?.result as string);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleApplyCrop = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const croppedDataUrl = canvas.toDataURL('image/png', 0.92);
    const key = cropTarget === 'logo' ? 'cafe_logo' : 'cafe_banner';

    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: croppedDataUrl }),
      });

      if (cropTarget === 'logo') setCafeLogo(croppedDataUrl);
      else setCafeBanner(croppedDataUrl);

      setCropModalOpen(false);
      setIframeKey((k) => k + 1);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    } catch {
      alert('Failed to save cropped image');
    }
  };

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
      setIframeKey((k) => k + 1);
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
          <span>✅</span> Display & branding preferences saved successfully!
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
              key={`${previewUrl}-${iframeKey}`}
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

          {/* Card 2: Restaurant Profile Picture & Logo Upload with Cropper */}
          <div className="bg-white border border-slate-200 rounded-md p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-900 text-[18px]">badge</span>
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Restaurant Profile & Logo
                </h2>
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Box Format</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Current Logo Preview Box (Very little round edge) */}
              <div className="w-20 h-20 bg-[#FAF7F2] border-2 border-dashed border-[#B2906A]/50 rounded-md flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                {cafeLogo ? (
                  <img src={cafeLogo} alt="Restaurant Logo" className="w-full h-full object-cover rounded-xs" />
                ) : (
                  <span className="text-2xl font-black text-[#8C6D47]">
                    {cafeName?.charAt(0) || 'C'}
                  </span>
                )}
              </div>

              {/* Upload & Crop Buttons */}
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <p className="text-xs font-bold text-slate-900">Upload Restaurant Logo / Icon</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Upload an image from your device and crop it to fit the box profile header perfectly.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                  <label className="bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 border border-[#B2906A] font-black px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95">
                    <span className="material-symbols-outlined text-[15px]">crop</span>
                    <span>Upload & Crop Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e, 'logo')}
                    />
                  </label>

                  {cafeLogo && (
                    <button
                      type="button"
                      onClick={async () => {
                        await fetch('/api/settings', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ key: 'cafe_logo', value: '' }),
                        });
                        setCafeLogo('');
                        setIframeKey((k) => k + 1);
                      }}
                      className="bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 border border-slate-200 font-bold px-2.5 py-1.5 rounded-md text-xs transition-all cursor-pointer"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>
              </div>
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

      {/* ── IMAGE CROPPER MODAL ── */}
      {cropModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-sm text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-900 text-[18px]">crop</span>
                <span>Crop {cropTarget === 'logo' ? 'Restaurant Logo' : 'Banner'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setCropModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Canvas Crop Area */}
            <div
              className="relative w-full aspect-square bg-slate-950 rounded-md overflow-hidden flex items-center justify-center cursor-move border border-slate-800"
              onMouseDown={(e) => {
                setIsDragging(true);
                setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
              }}
              onMouseMove={(e) => {
                if (!isDragging) return;
                setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
              }}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
            >
              <canvas
                ref={canvasRef}
                width={300}
                height={300}
                className="w-full h-full object-contain"
              />
              {/* 1:1 Square Crop Guide Frame with subtle round edges */}
              <div className="absolute inset-4 border-2 border-dashed border-[#C3A27C] rounded-md pointer-events-none shadow-2xl" />
            </div>

            {/* Zoom Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Zoom & Position</span>
                <span>{zoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-[#C3A27C] cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 text-center">
                Drag on the image to position inside the box.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCropModalOpen(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-md text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCrop}
                className="flex-1 bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 font-black py-2 rounded-md text-xs border border-[#B2906A] cursor-pointer shadow-sm active:scale-95 transition-all"
              >
                Apply & Save Logo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
