'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';

export default function SetupWizardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [cafeName, setCafeName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  // Tax & Payments
  const [gstin, setGstin] = useState('');
  const [fssai, setFssai] = useState('');
  const [upiId, setUpiId] = useState('');
  const [cgstRate, setCgstRate] = useState(2.5);
  const [sgstRate, setSgstRate] = useState(2.5);

  // Table Configuration
  const [tableCount, setTableCount] = useState(8);
  const [sections, setSections] = useState<string[]>(['Main Floor', 'Outdoor']);

  // Staff Credentials
  const [ownerPin, setOwnerPin] = useState('1234');
  const [cashierName, setCashierName] = useState('Counter Cashier');
  const [cashierPin, setCashierPin] = useState('1111');

  const handleNext = () => {
    if (step === 1 && !cafeName) {
      toast.warning('Please enter your cafe name');
      return;
    }
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const toggleSection = (sec: string) => {
    if (sections.includes(sec)) {
      if (sections.length > 1) {
        setSections(sections.filter((s) => s !== sec));
      } else {
        toast.warning('At least one section is required');
      }
    } else {
      setSections([...sections, sec]);
    }
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
          whatsapp,
          gstin,
          fssai,
          upiId,
          cgstRate,
          sgstRate,
          tableCount,
          sections,
          ownerPin,
          cashierName,
          cashierPin,
        }),
      });

      if (res.ok) {
        toast.success('🎉 Cafe setup completed! Welcome to ChatChaska.');
        setTimeout(() => {
          router.push('/admin');
        }, 1200);
      } else {
        toast.error('Setup failed to save. Please try again.');
      }
    } catch {
      toast.error('Network error during setup.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-4 sm:p-8 font-sans">
      <div className="max-w-2xl mx-auto w-full space-y-6 pt-6">
        {/* Header Branding */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2">
            <img src="/chaska-c-logo.png" alt="ChatChaska" className="w-9 h-9 rounded-xl shadow-xs" />
            <h1 className="text-2xl font-black text-slate-900">Welcome to ChatChaska</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium">Let&apos;s get your cafe set up for billing and orders in 2 minutes.</p>
        </div>

        {/* Step Indicator */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between relative mb-2">
            {[
              { num: 1, label: 'Cafe Info' },
              { num: 2, label: 'Taxes & UPI' },
              { num: 3, label: 'Tables' },
              { num: 4, label: 'Menu' },
              { num: 5, label: 'Staff PINs' },
            ].map((s) => (
              <div key={s.num} className="flex flex-col items-center gap-1 z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === s.num
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : step > s.num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {step > s.num ? '✓' : s.num}
                </div>
                <span
                  className={`text-[10px] font-bold hidden sm:block ${
                    step === s.num ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300 ease-out"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          {/* STEP 1: CAFE DETAILS */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h2 className="text-lg font-black text-slate-900">Step 1: Your Cafe Profile</h2>
                <p className="text-xs text-slate-500">This information will appear on printed bills and customer QR menus.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cafe Name *</label>
                  <input
                    type="text"
                    value={cafeName}
                    onChange={(e) => setCafeName(e.target.value)}
                    placeholder="e.g. Chai & Bites Cafe"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Pune"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Address</label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Shop No. 4, Main Market, MG Road..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: TAXES & UPI PAYMENTS */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h2 className="text-lg font-black text-slate-900">Step 2: Taxes & UPI Payments</h2>
                <p className="text-xs text-slate-500">Configure GST tax rates and UPI VPA for customer dynamic QR codes.</p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">GSTIN Number (Optional)</label>
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      placeholder="27AABCM1234A1Z5"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 uppercase font-mono font-bold focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">FSSAI License (Optional)</label>
                    <input
                      type="text"
                      value={fssai}
                      onChange={(e) => setFssai(e.target.value)}
                      placeholder="11521001000123"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono font-medium focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">UPI Merchant VPA / ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. yourcafe@okaxis or 9876543210@paytm"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">This UPI ID is used when generating table QR pay codes.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">CGST Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={cgstRate}
                      onChange={(e) => setCgstRate(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-black text-slate-900"
                    />
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">SGST Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={sgstRate}
                      onChange={(e) => setSgstRate(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-black text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: TABLES & SECTIONS */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h2 className="text-lg font-black text-slate-900">Step 3: Tables & Dining Areas</h2>
                <p className="text-xs text-slate-500">Configure your dining sections and number of customer tables.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">How many total dining tables?</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={2}
                      max={30}
                      value={tableCount}
                      onChange={(e) => setTableCount(parseInt(e.target.value, 10))}
                      className="flex-1 accent-blue-600 cursor-pointer"
                    />
                    <span className="text-sm font-black text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl min-w-16 text-center">
                      {tableCount} Tables
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Dining Sections</label>
                  <div className="flex flex-wrap gap-2">
                    {['Main Floor', 'Outdoor', 'AC Section', 'Rooftop', 'Bar Counter'].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => toggleSection(sec)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          sections.includes(sec)
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {sec}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: MENU SETUP GUIDANCE */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h2 className="text-lg font-black text-slate-900">Step 4: Add Your Menu Items</h2>
                <p className="text-xs text-slate-500">You can scan your paper menu card using Vision AI or add items manually.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-2xl border-2 border-blue-200 bg-blue-50/50 space-y-2 text-center">
                  <span className="material-symbols-outlined text-3xl text-blue-600">document_scanner</span>
                  <h3 className="font-bold text-xs text-blue-900">Scan Menu Card with AI</h3>
                  <p className="text-[11px] text-slate-600">
                    Snap a photo of your paper menu; AI extracts all dish names, prices, and categories automatically.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2 text-center">
                  <span className="material-symbols-outlined text-3xl text-slate-600">edit_note</span>
                  <h3 className="font-bold text-xs text-slate-900">Add Manually in Menu Tab</h3>
                  <p className="text-[11px] text-slate-500">
                    You can quickly add dishes, categories, and prices at any time from your Admin Menu dashboard.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: STAFF SECURITY & PINS */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h2 className="text-lg font-black text-slate-900">Step 5: Staff PINs for Terminal</h2>
                <p className="text-xs text-slate-500">Set 4-digit PINs for your owner console and counter cashier.</p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">Owner Manager PIN</span>
                    <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                      ADMIN
                    </span>
                  </div>
                  <input
                    type="password"
                    maxLength={4}
                    value={ownerPin}
                    onChange={(e) => setOwnerPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="4-digit PIN (default 1234)"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-center tracking-widest font-mono text-sm font-bold text-slate-900"
                  />
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">Cashier 1 PIN</span>
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      CASHIER
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={cashierName}
                      onChange={(e) => setCashierName(e.target.value)}
                      placeholder="Cashier Name"
                      className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                    <input
                      type="password"
                      maxLength={4}
                      value={cashierPin}
                      onChange={(e) => setCashierPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="4-digit PIN"
                      className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-center tracking-widest font-mono text-sm font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                ← Back
              </button>
            ) : <div />}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleCompleteSetup}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white text-xs font-black transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
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
