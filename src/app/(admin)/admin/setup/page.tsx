'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';

interface StaffItem {
  id: string;
  name: string;
  role: 'cashier' | 'waiter' | 'kitchen' | 'manager';
  pin: string;
  showPin: boolean;
}

export default function SetupWizardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Owner (Private) & Cafe (Public) Info (No Email)
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
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

  // Step 3: Tables (Main & VIP - No seats)
  const [mainTableCount, setMainTableCount] = useState<number>(8);
  const [hasVip, setHasVip] = useState<boolean>(false);
  const [vipTableCount, setVipTableCount] = useState<number>(2);

  // Step 4: Menu Setup (Multi-image AI upload)
  const [isScanning, setIsScanning] = useState(false);
  const [menuUploadedCount, setMenuUploadedCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Step 5: Staff PINs & Dynamic Staff Accounts
  const [ownerPin, setOwnerPin] = useState('1234');
  const [showOwnerPin, setShowOwnerPin] = useState(false);
  const [staffList, setStaffList] = useState<StaffItem[]>([
    { id: '1', name: 'Counter Cashier', role: 'cashier', pin: '1111', showPin: false },
  ]);

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

  const handleAddStaff = () => {
    const newId = String(Date.now());
    setStaffList((prev) => [
      ...prev,
      { id: newId, name: '', role: 'waiter', pin: '1234', showPin: false },
    ]);
  };

  const handleRemoveStaff = (id: string) => {
    setStaffList((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdateStaff = (id: string, field: keyof StaffItem, val: any) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: val } : s))
    );
  };

  const handleMenuPhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsScanning(true);
    let totalAdded = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/ai/extract-menu', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.itemsAdded > 0) {
          totalAdded += data.itemsAdded;
        }
      }

      if (totalAdded > 0) {
        setMenuUploadedCount(totalAdded);
        toast.success(`🎉 Vision AI added ${totalAdded} dishes from your menu photos!`);
      } else {
        toast.error('Could not extract dishes from the uploaded photo(s)');
      }
    } catch {
      toast.error('Network error during menu photo extraction');
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
          hasVip,
          vipTableCount: hasVip ? vipTableCount : 0,
          ownerPin,
          staffMembers: staffList.map((s) => ({
            name: s.name || 'Staff',
            role: s.role,
            pin: s.pin || '1111',
          })),
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col p-3 sm:p-5 lg:p-6 font-sans select-none">
      <div className="max-w-3xl mx-auto w-full space-y-3.5 pt-0">
        {/* Top Bar with Back to Login */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 bg-white border border-slate-200 hover:border-slate-300 px-3.5 py-1.5 rounded-md shadow-2xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Login</span>
          </button>

          <div className="flex items-center gap-2">
            <img src="/chatchaska-logo.png" alt="ChatChaska" className="h-6 w-auto object-contain" />
          </div>
        </div>

        {/* Step Progress Indicators */}
        <div className="bg-white p-2.5 rounded-md border border-slate-200 shadow-2xs">
          <div className="grid grid-cols-6 gap-1.5">
            {[
              { num: 1, label: 'Profile' },
              { num: 2, label: 'Taxes & UPI' },
              { num: 3, label: 'Tables' },
              { num: 4, label: 'Menu' },
              { num: 5, label: 'Staff PINs' },
              { num: 6, label: 'Terms' },
            ].map((s) => {
              const isCurrent = step === s.num;
              const isDone = step > s.num;
              return (
                <div
                  key={s.num}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-1 rounded-md text-xs font-bold transition-all ${
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

        {/* Main Form Card */}
        <div className="bg-white rounded-md border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
          {/* STEP 1: OWNER & CAFE DETAILS - NO EMAIL */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              {/* Section 1: Owner Details */}
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-900 text-[18px]">person</span>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Owner Details</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Owner Full Name *</label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="e.g. Sandesh Agrawal"
                      className="w-full bg-white border border-slate-300 focus:border-[#C3A27C] rounded-md px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Owner Contact Number *</label>
                    <input
                      type="tel"
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full bg-white border border-slate-300 focus:border-[#C3A27C] rounded-md px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Cafe Outlet Details */}
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-900 text-[18px]">storefront</span>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Cafe Outlet Details</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Cafe Business Name *</label>
                    <input
                      type="text"
                      value={cafeName}
                      onChange={(e) => setCafeName(e.target.value)}
                      placeholder="e.g. ChatChaska Cafe"
                      className="w-full bg-white border border-slate-300 focus:border-[#C3A27C] rounded-md px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Cafe Phone / Helpline</label>
                    <input
                      type="tel"
                      value={cafePhone}
                      onChange={(e) => setCafePhone(e.target.value)}
                      placeholder="e.g. 020-12345678 or 9876543210"
                      className="w-full bg-white border border-slate-300 focus:border-[#C3A27C] rounded-md px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Pune"
                      className="w-full bg-white border border-slate-300 focus:border-[#C3A27C] rounded-md px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Outlet Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Shop No. 4, Main Market, MG Road..."
                      className="w-full bg-white border border-slate-300 focus:border-[#C3A27C] rounded-md px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: TAXES & UPI PAYMENTS */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-900 text-[18px]">account_balance_wallet</span>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">UPI Merchant Payment Settings</h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">UPI Merchant VPA / ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. yourcafe@okaxis or 9876543210@paytm"
                    className="w-full bg-white border border-slate-300 focus:border-[#C3A27C] rounded-md px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Used for customer table QR payments (0% platform commission, direct to bank).</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-900 text-[18px]">receipt_long</span>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Tax Registrations & Rates</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">GSTIN Number (Optional)</label>
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      placeholder="27AABCM1234A1Z5"
                      className="w-full bg-white border border-slate-300 focus:border-[#C3A27C] rounded-md px-3.5 py-2 text-xs font-mono font-bold text-slate-900 uppercase outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">FSSAI License (Optional)</label>
                    <input
                      type="text"
                      value={fssai}
                      onChange={(e) => setFssai(e.target.value)}
                      placeholder="11521001000123"
                      className="w-full bg-white border border-slate-300 focus:border-[#C3A27C] rounded-md px-3.5 py-2 text-xs font-mono font-semibold text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-white p-3 rounded-md border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">CGST Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={cgstRate}
                      onChange={(e) => setCgstRate(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-black text-slate-900 outline-none"
                    />
                  </div>

                  <div className="bg-white p-3 rounded-md border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">SGST Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={sgstRate}
                      onChange={(e) => setSgstRate(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-black text-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: TABLES & VIP CONFIGURATION (NO SEATS PER TABLE) */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              {/* 1. Main Tables Configuration */}
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-900 text-[18px]">table_restaurant</span>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Main Dining Tables</h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Number of Main Tables</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={mainTableCount}
                    onChange={(e) => setMainTableCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full bg-white border border-slate-300 focus:border-[#C3A27C] rounded-md px-3.5 py-2 text-xs font-black text-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* 2. VIP Section Toggle & Config */}
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#8C6D47] text-[18px]">hotel_class</span>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">VIP Section</h3>
                  </div>

                  {/* VIP Choice Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setHasVip(false)}
                      className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        !hasVip
                          ? 'bg-[#C3A27C] text-slate-950 shadow-2xs border border-[#B2906A]'
                          : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      No VIP
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasVip(true)}
                      className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
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
                  <div className="pt-2.5 border-t border-slate-200 animate-in fade-in duration-150">
                    <label className="block text-xs font-bold text-slate-600 mb-1">Number of VIP Tables</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={vipTableCount}
                      onChange={(e) => setVipTableCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full bg-white border border-slate-300 focus:border-[#C3A27C] rounded-md px-3.5 py-2 text-xs font-black text-slate-900 outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Table Summary */}
              <div className="p-3 bg-[#FAF7F2] border border-[#C3A27C]/40 rounded-md flex items-center justify-between text-xs font-bold text-slate-900">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#8C6D47] text-[18px]">domain_verification</span>
                  <span>Total Configured Tables</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-[#C3A27C] text-slate-950 px-2 py-0.5 rounded-md font-black">
                    {totalTables} Tables
                  </span>
                  <span className="text-[11px] text-slate-600 font-medium">
                    ({mainTableCount} Main{hasVip ? ` + ${vipTableCount} VIP` : ''})
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: MENU SETUP (MULTI-IMAGE AI VISION & SKIP) */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="border-2 border-dashed border-[#C3A27C]/60 bg-[#FAF7F2] rounded-md p-6 text-center space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  capture="environment"
                  onChange={handleMenuPhotosUpload}
                  className="hidden"
                  id="setup-menu-photo-upload"
                  disabled={isScanning}
                />

                <div className="w-12 h-12 rounded-full bg-[#C3A27C]/20 border border-[#C3A27C]/40 flex items-center justify-center mx-auto text-[#8C6D47]">
                  <span className="material-symbols-outlined text-2xl">document_scanner</span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-slate-900">Upload or Click Pictures of Your Menu</h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Select one or more photos of your menu card. Our Vision AI will automatically extract all dish names, prices, and categories.
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
                      <span>Processing menu photos with AI...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
                      <span>Upload Menu Photos</span>
                    </>
                  )}
                </label>

                {menuUploadedCount !== null && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-xs font-bold animate-in fade-in">
                    ✅ Vision AI imported {menuUploadedCount} dishes to your menu catalog!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: STAFF ACCOUNTS & PINS WITH VISIBILITY TOGGLE */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in">
              {/* Owner Manager PIN */}
              <div className="p-3.5 rounded-md border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-900 text-[18px]">admin_panel_settings</span>
                    <span className="font-bold text-xs text-slate-900">Owner Manager PIN</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-900 bg-slate-200 px-2 py-0.5 rounded-md">
                    ADMIN
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showOwnerPin ? 'text' : 'password'}
                    maxLength={4}
                    value={ownerPin}
                    onChange={(e) => setOwnerPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="4-digit PIN (default 1234)"
                    className="w-full bg-white border border-slate-300 focus:border-[#C3A27C] rounded-md px-3.5 py-2 text-center tracking-widest font-mono text-base font-bold text-slate-900 outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOwnerPin(!showOwnerPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showOwnerPin ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Dynamic Staff Accounts List */}
              <div className="p-3.5 rounded-md border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-900 text-[18px]">badge</span>
                    <span className="font-bold text-xs text-slate-900">Staff Accounts & Access PINs</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddStaff}
                    className="flex items-center gap-1 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 px-2.5 py-1 rounded-md text-xs font-bold shadow-2xs transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    <span>Add Staff</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {staffList.map((staff, idx) => (
                    <div
                      key={staff.id}
                      className="p-2.5 bg-white border border-slate-200 rounded-md grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                    >
                      <div className="sm:col-span-5">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Staff Name</label>
                        <input
                          type="text"
                          value={staff.name}
                          onChange={(e) => handleUpdateStaff(staff.id, 'name', e.target.value)}
                          placeholder={`Staff #${idx + 1} Name`}
                          className="w-full bg-slate-50 border border-slate-300 focus:border-[#C3A27C] rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-900 outline-none"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Role</label>
                        <select
                          value={staff.role}
                          onChange={(e) => handleUpdateStaff(staff.id, 'role', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 focus:border-[#C3A27C] rounded-md px-2 py-1.5 text-xs font-bold text-slate-800 outline-none"
                        >
                          <option value="cashier">Cashier</option>
                          <option value="waiter">Waiter</option>
                          <option value="kitchen">Kitchen</option>
                          <option value="manager">Manager</option>
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">4-Digit PIN</label>
                        <div className="relative">
                          <input
                            type={staff.showPin ? 'text' : 'password'}
                            maxLength={4}
                            value={staff.pin}
                            onChange={(e) => handleUpdateStaff(staff.id, 'pin', e.target.value.replace(/\D/g, ''))}
                            placeholder="PIN"
                            className="w-full bg-slate-50 border border-slate-300 focus:border-[#C3A27C] rounded-md px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 outline-none pr-8 text-center"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateStaff(staff.id, 'showPin', !staff.showPin)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {staff.showPin ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="sm:col-span-1 flex justify-end pt-3 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveStaff(staff.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                          title="Remove staff"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {staffList.length === 0 && (
                    <div className="p-3 text-center text-xs text-slate-400 bg-white border border-dashed border-slate-200 rounded-md">
                      No staff accounts added yet. Click &quot;Add Staff&quot; above to create cashier or waiter logins.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: TERMS & CONDITIONS & FINAL LAUNCH */}
          {step === 6 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-3 text-xs text-slate-700 max-h-[260px] overflow-y-auto">
                <div className="space-y-0.5">
                  <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                    <span className="text-[#8C6D47]">✓</span> 1. 100% Free Forever for Small Cafes
                  </h4>
                  <p className="text-slate-600 leading-relaxed pl-5 text-[11px]">
                    Outlets processing under 100 bills per day enjoy permanent free access to all core POS features with zero subscription fees.
                  </p>
                </div>

                <div className="space-y-0.5">
                  <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                    <span className="text-[#8C6D47]">✓</span> 2. Device Privacy & Offline-First Storage
                  </h4>
                  <p className="text-slate-600 leading-relaxed pl-5 text-[11px]">
                    Your sales, orders, and customer data are saved directly on your device (Local Database & Browser Storage) with automated cloud backup, ensuring your billing never stops even during internet downtime.
                  </p>
                </div>

                <div className="space-y-0.5">
                  <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                    <span className="text-[#8C6D47]">✓</span> 3. Direct UPI QR Settlements
                  </h4>
                  <p className="text-slate-600 leading-relaxed pl-5 text-[11px]">
                    Customer QR payments settle directly into your linked UPI VPA with 0% platform commission.
                  </p>
                </div>

                <div className="space-y-0.5">
                  <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                    <span className="text-[#8C6D47]">✓</span> 4. Owner Contact Confidentiality
                  </h4>
                  <p className="text-slate-600 leading-relaxed pl-5 text-[11px]">
                    Owner personal contact number is kept private for platform security and support.
                  </p>
                </div>
              </div>

              {/* Agreement Checkbox */}
              <label className="flex items-start gap-2.5 p-3 bg-[#FAF7F2] border border-[#C3A27C]/40 rounded-md cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded-md accent-[#C3A27C] cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-900">
                  I agree to ChatChaska&apos;s Fair Usage Policy, Data Privacy Agreement, and Terms of Service.
                </span>
              </label>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 rounded-md border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                ← Back
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              {/* Skip button for Step 4 (Menu) */}
              {step === 4 && (
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="px-4 py-2.5 rounded-md border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Skip for now
                </button>
              )}

              {step < 6 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={step === 4 && (menuUploadedCount === null || menuUploadedCount === 0)}
                  className="px-6 py-2.5 rounded-md bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 border border-[#B2906A] text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting || !agreedToTerms}
                  onClick={handleCompleteSetup}
                  className="px-7 py-2.5 rounded-md bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 border border-[#B2906A] text-xs font-black transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
    </div>
  );
}
