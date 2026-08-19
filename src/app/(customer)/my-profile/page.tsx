'use client';

import React, { useState } from 'react';

export default function CustomerProfilePage() {
  const [name, setName] = useState('Sandesh Agrawal');
  const [phone] = useState('+91 98765 43210');
  const [email, setEmail] = useState('29sandesh.agrawal@gmail.com');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 max-w-xl mx-auto space-y-6 pb-24">
      <div className="pt-4">
        <h1 className="text-2xl font-black">Customer Profile</h1>
        <p className="text-xs text-slate-400 mt-1">Manage your dining preferences and verified mobile number.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-black text-2xl flex items-center justify-center shadow-lg">
            {name[0] || 'S'}
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-100">{name}</h3>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">verified</span>
              <span>Verified Phone Session</span>
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Mobile Number (Verified)</label>
            <input
              type="text"
              value={phone}
              disabled
              className="w-full bg-slate-800/50 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white"
            />
          </div>

          {saved && (
            <p className="text-xs text-emerald-400 font-semibold text-center bg-emerald-500/10 p-2 rounded-xl">
              Profile details updated!
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all cursor-pointer"
          >
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
}
