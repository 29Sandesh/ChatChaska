"use client";

import React, { useState, useEffect } from "react";

export default function SettingsPage() {
  const [dailyThreshold, setDailyThreshold] = useState(100);
  const [breachDays, setBreachDays] = useState(3);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [twoFactorActive, setTwoFactorActive] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/superadmin/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.growthBillThreshold) setDailyThreshold(data.growthBillThreshold);
          if (data.growthBreachDays) setBreachDays(data.growthBreachDays);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    }
    loadSettings();
  }, []);

  const handleSaveGrowthSettings = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/superadmin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          growthBillThreshold: dailyThreshold,
          growthBreachDays: breachDays,
        }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl select-none font-sans">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Platform Settings</h1>
        <p className="text-slate-500 mt-1 font-medium">Configure fair usage billing thresholds, platform rules, and tiers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fair Growth & Usage Billing Settings */}
        <div className="bg-white border border-slate-200 rounded-md shadow-2xs p-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-700 text-lg">monitoring</span>
            </div>
            Fair Usage & Growth Model
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Daily Bill Free Limit (Bills / Day)
              </label>
              <input 
                type="number" 
                value={dailyThreshold}
                onChange={(e) => setDailyThreshold(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:border-[#C3A27C] transition-colors" 
              />
              <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed">
                Small cafes generating under <strong className="text-slate-900">{dailyThreshold} bills/day</strong> remain <strong className="text-emerald-700">100% Free Forever</strong> with no timer or expiry.
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Breach Days Before Upgrade Prompt
              </label>
              <input 
                type="number" 
                value={breachDays}
                onChange={(e) => setBreachDays(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:border-[#C3A27C] transition-colors" 
              />
              <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed">
                Prompt cafe to upgrade only after they exceed {dailyThreshold} bills/day on <strong className="text-slate-900">{breachDays} separate days</strong>.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button 
                onClick={handleSaveGrowthSettings}
                disabled={saving}
                className="bg-[#C3A27C] hover:bg-[#B3926C] disabled:opacity-50 text-slate-950 font-bold px-4 py-2 rounded-md border border-[#B2906A] text-sm transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                {saving ? "Saving..." : "Save Limits"}
              </button>
              {saveSuccess && (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Saved to database!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profile / Security */}
        <div className="bg-white border border-slate-200 rounded-md shadow-2xs p-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-md bg-purple-50 border border-purple-200 flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-700 text-lg">shield_person</span>
            </div>
            Admin Security
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-bold text-slate-500">SuperAdmin Master Email</p>
              <p className="font-bold text-slate-900 mt-0.5">admin@chatchaska.com</p>
            </div>
            <div className="pt-2 flex flex-col gap-3">
              <button className="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-900 px-4 py-2.5 rounded-md text-sm font-bold transition-colors w-full text-left flex justify-between items-center cursor-pointer">
                Change Master Password
                <span className="material-symbols-outlined text-[18px] text-slate-400">chevron_right</span>
              </button>
              <div className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-md flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-slate-900">Two-Factor Authentication</p>
                  <p className="text-xs text-slate-500 font-medium">Extra security for admin console</p>
                </div>
                <div 
                  onClick={() => setTwoFactorActive(!twoFactorActive)}
                  className={`w-11 h-6 rounded-full relative cursor-pointer border transition-colors ${
                    twoFactorActive 
                      ? 'bg-[#C3A27C] border-[#B2906A]' 
                      : 'bg-slate-300 border-slate-400'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${
                    twoFactorActive ? 'right-1' : 'left-1'
                  }`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing & Usage Tiers */}
      <div className="bg-white border border-slate-200 rounded-md shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-700 text-lg">sell</span>
              </div>
              Pricing & Usage Tiers
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Automatic threshold classification based on daily billing volume.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-4 text-xs uppercase font-bold text-slate-500">Plan Tier</th>
                <th className="p-4 text-xs uppercase font-bold text-slate-500">Monthly Price</th>
                <th className="p-4 text-xs uppercase font-bold text-slate-500">Daily Bill Threshold</th>
                <th className="p-4 text-xs uppercase font-bold text-slate-500">Max Devices</th>
                <th className="p-4 text-xs uppercase font-bold text-slate-500">Ideal For</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/80 transition-colors bg-emerald-50/30">
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">Free Forever</span>
                    <span className="px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-300">NO CHARGE</span>
                  </div>
                </td>
                <td className="p-4 font-mono font-black text-emerald-700">₹0</td>
                <td className="p-4 font-bold text-slate-700">Up to 100 bills/day</td>
                <td className="p-4 font-medium text-slate-600">2 Devices</td>
                <td className="p-4 text-xs text-slate-500 font-medium">Chai stalls, bakeries, small cafes</td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-bold text-slate-900">Starter</td>
                <td className="p-4 font-mono font-bold text-slate-700">₹999/mo</td>
                <td className="p-4 font-bold text-slate-700">101 – 500 bills/day</td>
                <td className="p-4 font-medium text-slate-600">2 Devices</td>
                <td className="p-4 text-xs text-slate-500 font-medium">Growing fast-casual outlets</td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-bold text-slate-900">Growth Pro</td>
                <td className="p-4 font-mono font-bold text-slate-700">₹2,499/mo</td>
                <td className="p-4 font-bold text-slate-700">501 – 1,500 bills/day</td>
                <td className="p-4 font-medium text-slate-600">5 Devices</td>
                <td className="p-4 text-xs text-slate-500 font-medium">Busy dining restaurants & lounges</td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-bold text-slate-900">Enterprise</td>
                <td className="p-4 font-mono font-bold text-slate-700">₹4,999/mo</td>
                <td className="p-4 font-bold text-slate-700">Unlimited</td>
                <td className="p-4 font-medium text-slate-600">Unlimited Devices</td>
                <td className="p-4 text-xs text-slate-500 font-medium">Multi-chain franchises & food courts</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Diagnostics / Platform Info */}
      <div className="flex justify-between items-center px-4 py-3 bg-slate-50 border border-slate-200 rounded-md">
        <p className="text-xs font-bold text-slate-500">ChatChaska Platform v2.2.0 • Usage-Based Model</p>
        <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Real-time billing engine active
        </p>
      </div>
    </div>
  );
}
