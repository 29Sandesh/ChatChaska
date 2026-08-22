'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';

export default function SetupWizardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Cafe Info
  const [cafeName, setCafeName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
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

  // Step 4: Staff Credentials
  const [ownerPin, setOwnerPin] = useState('1234');
  const [cashierName, setCashierName] = useState('Counter Cashier');
  const [cashierPin, setCashierPin] = useState('1111');

  const handleNext = () => {
    if (step === 1 && !cafeName.trim()) {
      toast.warning('Please enter your cafe name');
      return;
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCompleteSetup = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cafeName,
          address,
          city,
          phone,
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
        toast.success('🎉 Setup complete! Opening your cafe dashboard...');
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-4 sm:p-6 font-sans select-none">
      <div className="max-w-xl mx-auto w-full space-y-5 pt-2 sm:pt-4">
        {/* Top Bar with Back to Login */}
        <div className="flex items-center justify-between pb-2">
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-2xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Login</span>
          </button>

          <div className="flex items-center gap-2">
            <img src="/chatchaska-logo.png" alt="ChatChaska" className="h-6 w-auto object-contain" />
          </div>
        </div>

        {/* Step Progress Pills */}
        <div className="bg-white p-3 rounded-md border border-slate-200 shadow-2xs">
          <div className="grid grid-cols-4 gap-2">
            {[
              { num: 1, label: 'Cafe Info' },
              { num: 2, label: 'Taxes & UPI' },
              { num: 3, label: 'Tables' },
              { num: 4, label: 'Staff PINs' },
            ].map((s) => {
              const isCurrent = step === s.num;
              const isDone = step > s.num;
              return (
                <div
                  key={s.num}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-[#FAF7F2] text-slate-950 border border-[#C3A27C]'
                      : isDone
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-50 text-slate-400 border border-slate-200'
                  }`}
                >
                  <span className="text-[11px] font-black">{isDone ? '✓' : s.num}</span>
                  <span className="truncate">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-md border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
          {/* STEP 1: CAFE DETAILS */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h2 className="text-base font-black text-slate-900">Cafe Profile</h2>
                <p className="text-xs text-slate-500">Information displayed on bills and customer menus.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cafe Name *</label>
                  <input
                    type="text"
                    value={cafeName}
                    onChange={(e) => setCafeName(e.target.value)}
                    placeholder="e.g. ChatChaska Cafe"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 focus:border-[#C3A27C] font-semibold outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Pune"
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 focus:border-[#C3A27C] font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 focus:border-[#C3A27C] font-semibold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Shop 4, Main Street"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 focus:border-[#C3A27C] font-semibold outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: TAXES & UPI PAYMENTS */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h2 className="text-base font-black text-slate-900">Taxes & UPI Payments</h2>
                <p className="text-xs text-slate-500">Configure your UPI ID for QR payments and tax rates.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">UPI Merchant VPA / ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. yourcafe@okaxis or 9876543210@paytm"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 font-semibold focus:border-[#C3A27C] outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Used to generate dynamic QR codes for customer table payments.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">GSTIN (Optional)</label>
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      placeholder="27AABCM1234A1Z5"
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 uppercase font-mono font-bold focus:border-[#C3A27C] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">FSSAI (Optional)</label>
                    <input
                      type="text"
                      value={fssai}
                      onChange={(e) => setFssai(e.target.value)}
                      placeholder="11521001000123"
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 font-mono font-semibold focus:border-[#C3A27C] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">CGST (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={cgstRate}
                      onChange={(e) => setCgstRate(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">SGST (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={sgstRate}
                      onChange={(e) => setSgstRate(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: TABLES & VIP CONFIGURATION */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h2 className="text-base font-black text-slate-900">Dining Tables</h2>
                <p className="text-xs text-slate-500">Configure Main Tables and optional VIP Lounge area.</p>
              </div>

              <div className="space-y-4">
                {/* 1. Main Tables Configuration */}
                <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-900 text-[18px]">table_restaurant</span>
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Main Dining Area</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Number of Tables</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={mainTableCount}
                        onChange={(e) => setMainTableCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs font-black text-slate-900 focus:border-[#C3A27C] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Seats Per Table</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={mainSeats}
                        onChange={(e) => setMainSeats(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs font-black text-slate-900 focus:border-[#C3A27C] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. VIP Section Toggle & Config */}
                <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#8C6D47] text-[18px]">hotel_class</span>
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">VIP Section</span>
                    </div>

                    {/* VIP Choice Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setHasVip(false)}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
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
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
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
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/80 animate-in fade-in duration-150">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">VIP Tables Count</label>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={vipTableCount}
                          onChange={(e) => setVipTableCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                          className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs font-black text-slate-900 focus:border-[#C3A27C] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Seats Per VIP Table</label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={vipSeats}
                          onChange={(e) => setVipSeats(Math.max(1, parseInt(e.target.value, 10) || 1))}
                          className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs font-black text-slate-900 focus:border-[#C3A27C] outline-none"
                        />
                      </div>
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
                    <span className="text-[11px] text-slate-500 font-medium">
                      ({mainTableCount} Main{hasVip ? ` + ${vipTableCount} VIP` : ''})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: STAFF PINS */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h2 className="text-base font-black text-slate-900">Staff Terminal PINs</h2>
                <p className="text-xs text-slate-500">4-digit access codes for POS terminals.</p>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-md border border-slate-200 bg-slate-50 space-y-1.5">
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
                    className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-center tracking-widest font-mono text-sm font-bold text-slate-900 outline-none"
                  />
                </div>

                <div className="p-3 rounded-md border border-slate-200 bg-slate-50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">Counter Cashier PIN</span>
                    <span className="text-[10px] font-black text-slate-900 bg-slate-200 px-2 py-0.5 rounded-md">
                      CASHIER
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={cashierName}
                      onChange={(e) => setCashierName(e.target.value)}
                      placeholder="Cashier Name"
                      className="bg-white border border-slate-200 rounded-md px-3 py-2 text-xs font-bold text-slate-900 outline-none"
                    />
                    <input
                      type="password"
                      maxLength={4}
                      value={cashierPin}
                      onChange={(e) => setCashierPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="4-digit PIN (1111)"
                      className="bg-white border border-slate-200 rounded-md px-3 py-2 text-center tracking-widest font-mono text-sm font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 rounded-md border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                ← Back
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 rounded-md bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 border border-[#B2906A] text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleCompleteSetup}
                className="px-6 py-2.5 rounded-md bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 border border-[#B2906A] text-xs font-black transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <span>Saving Configuration...</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">rocket_launch</span>
                    <span>Launch Workspace</span>
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
