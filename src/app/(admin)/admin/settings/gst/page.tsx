'use client';

import React, { useState, useEffect } from 'react';

export default function AdminGSTSettingsPage() {
  const [gstin, setGstin] = useState('27AABCM1234A1Z5');
  const [fssai, setFssai] = useState('11521001000123');
  const [upiId, setUpiId] = useState('paytmqr6z1f01@ptys');
  const [ownerPhone, setOwnerPhone] = useState('9876543210');
  const [ownerEmail, setOwnerEmail] = useState('owner@chatchaska.com');
  const [cgstRate, setCgstRate] = useState(2.5);
  const [sgstRate, setSgstRate] = useState(2.5);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const keys = ['gstin', 'fssai', 'merchant_upi_id', 'owner_phone', 'owner_email', 'cgst_rate', 'sgst_rate'];
        const results = await Promise.all(
          keys.map((k) => fetch(`/api/settings?key=${k}`).then((r) => r.json()))
        );

        results.forEach((res) => {
          if (res.key === 'gstin' && res.value) setGstin(res.value);
          if (res.key === 'fssai' && res.value) setFssai(res.value);
          if (res.key === 'merchant_upi_id' && res.value) setUpiId(res.value);
          if (res.key === 'owner_phone' && res.value) setOwnerPhone(res.value);
          if (res.key === 'owner_email' && res.value) setOwnerEmail(res.value);
          if (res.key === 'cgst_rate' && res.value) setCgstRate(Number(res.value));
          if (res.key === 'sgst_rate' && res.value) setSgstRate(Number(res.value));
        });
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = [
        { key: 'gstin', value: gstin },
        { key: 'fssai', value: fssai },
        { key: 'merchant_upi_id', value: upiId },
        { key: 'owner_phone', value: ownerPhone },
        { key: 'owner_email', value: ownerEmail },
        { key: 'cgst_rate', value: String(cgstRate) },
        { key: 'sgst_rate', value: String(sgstRate) },
      ];

      await Promise.all(
        payload.map((item) =>
          fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
          })
        )
      );

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 select-none">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900">Tax & Payment Settings</h1>
        <p className="text-xs text-slate-500 font-medium">Configure your cafe's GST number, UPI QR payment ID, and owner contact details</p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-md p-6 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">GST Number (GSTIN)</label>
            <input
              type="text"
              value={gstin}
              placeholder="e.g. 27AABCM1234A1Z5"
              onChange={(e) => setGstin(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-md p-2.5 text-xs font-mono font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">FSSAI License Number</label>
            <input
              type="text"
              value={fssai}
              placeholder="e.g. 11521001000123"
              onChange={(e) => setFssai(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-md p-2.5 text-xs font-mono font-bold text-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Cafe UPI ID (PhonePe / GPay / Paytm QR)</label>
          <input
            type="text"
            placeholder="e.g. paytmqr6z1f01@ptys or restaurant@okicici"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-md p-2.5 text-xs font-mono font-bold text-blue-700"
          />
          <p className="text-[11px] text-slate-400 mt-1">Customers will scan this UPI QR code on the POS screen to pay their bills.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Owner WhatsApp Number</label>
            <input
              type="tel"
              value={ownerPhone}
              placeholder="e.g. 9876543210"
              onChange={(e) => setOwnerPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-md p-2.5 text-xs font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Owner Backup Email</label>
            <input
              type="email"
              value={ownerEmail}
              placeholder="e.g. owner@gmail.com"
              onChange={(e) => setOwnerEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-md p-2.5 text-xs font-medium text-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">CGST Tax Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={cgstRate}
              onChange={(e) => setCgstRate(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-md p-2.5 text-xs font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">SGST Tax Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={sgstRate}
              onChange={(e) => setSgstRate(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-md p-2.5 text-xs font-bold text-slate-900"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 border border-[#B2906A] disabled:opacity-50 text-white font-extrabold py-3 rounded-md text-xs shadow-sm mt-4 transition-all active:scale-95"
        >
          {loading ? 'Saving Settings...' : 'Save Settings'}
        </button>

        {saved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-md text-center">
            Settings Saved Successfully!
          </div>
        )}
      </form>
    </div>
  );
}

