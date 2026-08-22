'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';

export default function SetupWizardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Owner (Private) & Cafe (Public) Info
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [cafeName, setCafeName] = useState('');
  const [cafePhone, setCafePhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');

  // Step 2: Taxes & UPI
  const [upiId, setUpiId] = useState('');
  const [gstin, setGstin] = useState('');
  const [fssai, setFssai] = useState('');
  const [cgstRate, setCgstRate] = useState(2.5);
  const [sgstRate, setSgstRate] = useState(2.5);

  // Step 3: Tables (Main & VIP)
  const [mainTableCount, setMainTableCount] = useState<number>(8);
  const [mainSeats, setMainSeats] = useState<number>(4);
  const [hasVip, setHasVip] = useState<boolean>(false);
  const [vipTableCount, setVipTableCount] = useState<number>(2);
  const [vipSeats, setVipSeats] = useState<number>(6);

  // Step 4: Menu Setup
  const [isScanning, setIsScanning] = useState(false);
  const [menuUploadedCount, setMenuUploadedCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Step 5: Staff Credentials
  const [ownerPin, setOwnerPin] = useState('1234');
  const [cashierName, setCashierName] = useState('Counter Cashier');
  const [cashierPin, setCashierPin] = useState('1111');

  // Step 6: Terms & Agreement
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleNext = () => {
    if (step === 1) {
      if (!ownerName.trim()) {
        toast.warning('Please enter owner name');
        return;
      }
      if (!ownerPhone.trim()) {
        toast.warning('Please enter owner personal contact number');
        return;
      }
      if (!cafeName.trim()) {
        toast.warning('Please enter cafe business name');
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 6));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleMenuPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/ai/extract-menu', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.itemsAdded > 0) {
        setMenuUploadedCount(data.itemsAdded);
        toast.success(`🎉 Vision AI added ${data.itemsAdded} dishes to your menu!`);
      } else {
        toast.error(data.error || 'Could not extract menu items from photo');
      }
    } catch {
      toast.error('Network error during menu photo scanning');
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCompleteSetup = async () => {
    if (!agreedToTerms) {
      toast.warning('Please accept the Terms & Conditions to complete setup');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerName,
          ownerPhone,
          ownerEmail,
          cafeName,
          cafePhone: cafePhone || ownerPhone,
          address,
          city,
          gstin,
          fssai,
          upiId,
          cgstRate,
          sgstRate,
          mainTableCount,
          mainSeats,
          hasVip,
          vipTableCount: hasVip ? vipTableCount : 0,
          vipSeats: hasVip ? vipSeats : 0,
          ownerPin,
          cashierName,
          cashierPin,
        }),
      });

      if (res.ok) {
        toast.success('🎉 Cafe setup complete! Opening your workspace...');
        setTimeout(() => {
          router.push('/admin');
        }, 1000);
      } else {
        toast.error('Setup failed to save. Please try again.');
      }
    } catch {
      toast.error('Network error during setup.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalTables = mainTableCount + (hasVip ? vipTableCount : 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-4 sm:p-8 lg:p-12 font-sans select-none">
      <div className="max-w-3xl mx-auto w-full space-y-6 pt-2 sm:pt-4">
        {/* Top Bar with Back to Login */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-950 bg-white border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-md shadow-2xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to Login</span>
          </button>

          <div className="flex items-center gap-3">
            <img src="/chatchaska-logo.png" alt="ChatChaska" className="h-7 w-auto object-contain" />
          </div>
        </div>

        {/* Step Progress Indicators */}
        <div className="bg-white p-3.5 rounded-md border border-slate-200 shadow-2xs">
          <div className="grid grid-cols-6 gap-1.5">
            {[
              { num: 1, label: 'Profile' },
              { num: 2, label: 'Taxes & UPI' },
              { num: 3, label: 'Tables' },
              { num: 4, label: 'Menu' },
              { num: 5, label: 'PINs' },
              { num: 6, label: 'Terms' },
            ].map((s) => {
              const isCurrent = step === s.num;
              const isDone = step > s.num;
              return (
                <div
                  key={s.num}
                  className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-md text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-[#FAF7F2] text-slate-950 border-2 border-[#C3A27C]'
                      : isDone
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-50 text-slate-400 border border-slate-200'
                  }`}
                >
                  <span className="text-xs font-black">{isDone ? '✓' : s.num}</span>
                  <span className="truncate hidden sm:inline">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Form Card (Spacious & Clean) */}
        <div className="bg-white rounded-md border border-slate-200 p-6 sm:p-8 md:p-10 shadow-sm space-y-6">
          {/* STEP 1: OWNER (PRIVATE) & CAFE (PUBLIC) DETAILS */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-xl font-black text-slate-900">Owner & Cafe Profile</h2>
                <p className="text-xs text-slate-500 mt-0.5">Separate sections for owner account credentials and public customer outlet details.</p>
              </div>

              {/* Section 1: Owner Details (Private) */}
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-900 text-[18px]">person</span>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Owner Account Details</h3>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">lock</span> Private (Saved For Platform)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Owner Full Name *</label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="e.g. Sandesh Agrawal"
                      className="w-full bg-white border border-slate-300 focus:border-[#C3A27C] rounded-md px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Owner Personal Contact *</label>
                    <input
                      type="tel"
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full bg-white border border-slate-300 focus:border-[#C3A27C] rounded-md px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none"
                      required
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Kept private for account recovery & system support.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Owner Email (Optional)</label>
                  <input
                    type="email"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder="e.g. owner@gmail.com"
                    className="w-full bg-white border border-slate-300 focus:border-[#C3A27C] rounded-md px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Section 2: Cafe Outlet Details (Public) */}
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-900 text-[18px]">storefront</span>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Cafe Outlet Details</h3>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">public</span> Public (Shown on Bills & QR)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Cafe Business Name *</label>
                    <input
                      type="text"
                      value={cafeName}
                      onChange={(e) => setCafeName(e.target.value)}
                      placeholder="e.g. ChatChaska Cafe"
                      className="w-full bg-white border border-slate-300 focus:border-[#C3A27C] rounded-md px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Cafe Public Helpline / Phone</label>
                    <input
                      type="tel"
                      value={cafePhone}
                      onChange={(e) => setCafePhone(e.target.value)}
                      placeholder="e.g. 020-12345678 or 9876543210"
                      className="w-full bg-white border border-slate-300 focus:border-[#C3A27C] rounded-md px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Printed on receipts, invoices, and customer menus.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Pune"
                      className="w-full bg-white border border-slate-300 focus:border-[#C3A27C] rounded-md px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Outlet Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Shop No. 4, Main Market, MG Road..."
                      className="w-full bg-white border border-slate-300 focus:border-[#C3A27C] rounded-md px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: TAXES & UPI PAYMENTS */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-xl font-black text-slate-900">Taxes & UPI Payments</h2>
                <p className="text-xs text-slate-500 mt-0.5">Configure your UPI ID for direct QR payments and tax rates.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">UPI Merchant VPA / ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. yourcafe@okaxis or 9876543210@paytm"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-[#C3A27C] rounded-md px-4 py-3 text-sm text-slate-900 font-semibold outline-none transition-colors"
                  />
                  <p className="text-xs text-slate-400 mt-1">This UPI ID is used when generating table QR pay codes for instant 0% commission direct settlements.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">GSTIN Number (Optional)</label>
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      placeholder="27AABCM1234A1Z5"
                      className="w-full bg-slate-50 border border-slate-300 focus:border-[#C3A27C] rounded-md px-4 py-3 text-sm text-slate-900 uppercase font-mono font-bold outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">FSSAI License (Optional)</label>
                    <input
                      type="text"
                      value={fssai}
                      onChange={(e) => setFssai(e.target.value)}
                      placeholder="11521001000123"
                      className="w-full bg-slate-50 border border-slate-300 focus:border-[#C3A27C] rounded-md px-4 py-3 text-sm text-slate-900 font-mono font-semibold outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="bg-slate-50 p-3.5 rounded-md border border-slate-200">
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">CGST Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={cgstRate}
                      onChange={(e) => setCgstRate(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm font-bold text-slate-900 outline-none"
                    />
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-md border border-slate-200">
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">SGST Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={sgstRate}
                      onChange={(e) => setSgstRate(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: TABLES & VIP CONFIGURATION */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-xl font-black text-slate-900">Dining Tables & Sections</h2>
                <p className="text-xs text-slate-500 mt-0.5">Configure Main Dining Tables and optional VIP Lounge area with direct numeric inputs.</p>
              </div>

              <div className="space-y-4">
                {/* 1. Main Tables Configuration */}
                <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-900 text-[20px]">table_restaurant</span>
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Main Dining Tables</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Number of Main Tables</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={mainTableCount}
                        onChange={(e) => setMainTableCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-full bg-white border border-slate-300 focus:border-[#C3A27C] rounded-md px-4 py-2.5 text-sm font-black text-slate-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Seats Per Main Table</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={mainSeats}
                        onChange={(e) => setMainSeats(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-full bg-white border border-slate-300 focus:border-[#C3A27C] rounded-md px-4 py-2.5 text-sm font-black text-slate-900 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. VIP Section Toggle & Config */}
                <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#8C6D47] text-[20px]">hotel_class</span>
                      <div>
                        <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">VIP Section</span>
                        <span className="text-[11px] text-slate-500 font-normal">Separate private lounge / cabin tables</span>
                      </div>
                    </div>

                    {/* VIP Choice Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setHasVip(false)}
                        className={`px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          !hasVip
                            ? 'bg-[#C3A27C] text-slate-950 shadow-2xs border border-[#B2906A]'
                            : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        No VIP Section
                      </button>
                      <button
                        type="button"
                        onClick={() => setHasVip(true)}
                        className={`px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          hasVip
                            ? 'bg-[#C3A27C] text-slate-950 shadow-2xs border border-[#B2906A]'
                            : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Yes, Have VIP
                      </button>
                    </div>
                  </div>

                  {hasVip && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200 animate-in fade-in duration-150">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Number of VIP Tables</label>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={vipTableCount}
                          onChange={(e) => setVipTableCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                          className="w-full bg-white border border-slate-300 focus:border-[#C3A27C] rounded-md px-4 py-2.5 text-sm font-black text-slate-900 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Seats Per VIP Table</label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={vipSeats}
                          onChange={(e) => setVipSeats(Math.max(1, parseInt(e.target.value, 10) || 1))}
                          className="w-full bg-white border border-slate-300 focus:border-[#C3A27C] rounded-md px-4 py-2.5 text-sm font-black text-slate-900 outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Table Summary */}
                <div className="p-3.5 bg-[#FAF7F2] border border-[#C3A27C]/40 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-slate-900">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#8C6D47] text-[20px]">domain_verification</span>
                    <span>Total Configured Dining Capacity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#C3A27C] text-slate-950 px-2.5 py-1 rounded-md font-black">
                      {totalTables} Tables
                    </span>
                    <span className="text-xs text-slate-600 font-medium">
                      ({mainTableCount} Main ({mainSeats} seats){hasVip ? ` + ${vipTableCount} VIP (${vipSeats} seats)` : ''})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: MENU SETUP */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-xl font-black text-slate-900">Menu Setup</h2>
                <p className="text-xs text-slate-500 mt-0.5">Upload a photo of your paper menu or manage dishes in the admin dashboard.</p>
              </div>

              <div className="space-y-4">
                {/* AI Scanner Upload Box */}
                <div className="border-2 border-dashed border-[#C3A27C]/60 bg-[#FAF7F2] rounded-md p-6 text-center space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleMenuPhotoUpload}
                    className="hidden"
                    id="setup-menu-photo-upload"
                    disabled={isScanning}
                  />

                  <div className="w-12 h-12 rounded-full bg-[#C3A27C]/20 border border-[#C3A27C]/40 flex items-center justify-center mx-auto text-[#8C6D47]">
                    <span className="material-symbols-outlined text-2xl">document_scanner</span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Scan Menu Card with AI</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-0.5">
                      Upload a photo of your menu; AI will automatically extract dish names, prices, and categories into your catalog.
                    </p>
                  </div>

                  <label
                    htmlFor="setup-menu-photo-upload"
                    className={`inline-flex items-center gap-2 bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 font-bold px-5 py-2.5 rounded-md text-xs border border-[#B2906A] shadow-2xs transition-all cursor-pointer ${
                      isScanning ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    {isScanning ? (
                      <>
                        <span className="animate-spin text-xs">⏳</span>
                        <span>Extracting dishes with AI...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                        <span>Upload Menu Photo</span>
                      </>
                    )}
                  </label>

                  {menuUploadedCount !== null && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-xs font-bold animate-in fade-in">
                      ✅ {menuUploadedCount} dishes successfully imported and categorized!
                    </div>
                  )}
                </div>

                {/* Dashboard Manual Info */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-md flex items-start gap-3 text-xs">
                  <span className="material-symbols-outlined text-slate-500 text-[20px] shrink-0 mt-0.5">info</span>
                  <div className="text-slate-600 space-y-0.5">
                    <p className="font-bold text-slate-800">Don&apos;t have a paper menu photo right now?</p>
                    <p>You can skip this step and manually add items, categories, and prices at any time in the <strong>Menu & Dishes</strong> admin tab.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: STAFF PINS */}
          {step === 5 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-xl font-black text-slate-900">Staff Terminal PINs</h2>
                <p className="text-xs text-slate-500 mt-0.5">4-digit access codes for POS terminals and manager overrides.</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-md border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">Owner Manager PIN</span>
                    <span className="text-[10px] font-black text-slate-900 bg-slate-200 px-2 py-0.5 rounded-md">
                      ADMIN
                    </span>
                  </div>
                  <input
                    type="password"
                    maxLength={4}
                    value={ownerPin}
                    onChange={(e) => setOwnerPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="4-digit PIN (default 1234)"
                    className="w-full bg-white border border-slate-300 focus:border-[#C3A27C] rounded-md px-4 py-2.5 text-center tracking-widest font-mono text-base font-bold text-slate-900 outline-none"
                  />
                </div>

                <div className="p-4 rounded-md border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">Counter Cashier PIN</span>
                    <span className="text-[10px] font-black text-slate-900 bg-slate-200 px-2 py-0.5 rounded-md">
                      CASHIER
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={cashierName}
                      onChange={(e) => setCashierName(e.target.value)}
                      placeholder="Cashier Name"
                      className="bg-white border border-slate-300 focus:border-[#C3A27C] rounded-md px-3 py-2.5 text-xs font-bold text-slate-900 outline-none"
                    />
                    <input
                      type="password"
                      maxLength={4}
                      value={cashierPin}
                      onChange={(e) => setCashierPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="4-digit PIN (1111)"
                      className="bg-white border border-slate-300 focus:border-[#C3A27C] rounded-md px-3 py-2.5 text-center tracking-widest font-mono text-base font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: TERMS & CONDITIONS & FINAL LAUNCH */}
          {step === 6 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-xl font-black text-slate-900">Terms of Service & Usage Policy</h2>
                <p className="text-xs text-slate-500 mt-0.5">Please review the fair usage terms and privacy agreement for your ChatChaska account.</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-md p-5 space-y-4 text-xs text-slate-700 max-h-[300px] overflow-y-auto">
                <div className="space-y-1">
                  <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                    <span className="text-[#8C6D47]">✓</span> 1. 100% Free Forever for Small Cafes
                  </h4>
                  <p className="text-slate-600 leading-relaxed pl-5">
                    ChatChaska operates on a fair usage policy. Outlets processing under 100 bills per day enjoy permanent free access to all core POS features with zero subscription fees.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                    <span className="text-[#8C6D47]">✓</span> 2. Local Data Privacy & Sovereignty
                  </h4>
                  <p className="text-slate-600 leading-relaxed pl-5">
                    All customer order history, bills, and menu items are stored locally in your offline-first SQLite database. Your confidential sales records are not sold or monetized.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                    <span className="text-[#8C6D47]">✓</span> 3. Direct UPI QR Settlements
                  </h4>
                  <p className="text-slate-600 leading-relaxed pl-5">
                    All QR code customer payments settle directly into your linked UPI Merchant VPA at 0% platform commission without middleman delays or wallet deductions.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                    <span className="text-[#8C6D47]">✓</span> 4. Owner Contact Confidentiality
                  </h4>
                  <p className="text-slate-600 leading-relaxed pl-5">
                    The Owner Personal Phone number provided is kept strictly confidential for system security, account recovery, and critical platform notifications.
                  </p>
                </div>
              </div>

              {/* Agreement Checkbox */}
              <label className="flex items-start gap-3 p-3.5 bg-[#FAF7F2] border border-[#C3A27C]/40 rounded-md cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded-md accent-[#C3A27C] cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-900">
                  I have read and agree to ChatChaska&apos;s Fair Usage Policy, Data Privacy Agreement, and Terms of Service.
                </span>
              </label>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 rounded-md border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                ← Back
              </button>
            ) : <div />}

            {step < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-7 py-3 rounded-md bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 border border-[#B2906A] text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting || !agreedToTerms}
                onClick={handleCompleteSetup}
                className="px-8 py-3.5 rounded-md bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 border border-[#B2906A] text-xs font-black transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <span>Saving Configuration...</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">rocket_launch</span>
                    <span>Launch My Cafe Workspace</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
