'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [cafeName, setCafeName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // Clean phone
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cafeName: cafeName.trim(),
          ownerName: ownerName.trim(),
          email: email.trim().toLowerCase(),
          phone: cleanPhone,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Registration failed');
        toast.error(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      toast.success('Cafe workspace created! Launching setup wizard...');
      router.push(data.redirect || '/admin/setup');
    } catch {
      setErrorMsg('Network connection error. Please try again.');
      toast.error('Network connection error');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 select-none font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 space-y-6 animate-in fade-in duration-200">
        {/* Branding Header */}
        <div className="text-center space-y-1.5">
          <img
            src="/chaska-c-logo.png"
            alt="ChatChaska"
            className="w-12 h-12 rounded-2xl mx-auto shadow-sm object-contain"
          />
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Cafe Workspace</h1>
          <p className="text-xs text-slate-500 font-medium">
            Start your 14-day free trial • 0 setup fees
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1.5 rounded-2xl">
          <Link
            href="/login"
            className="py-2.5 text-center rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
          >
            Sign In
          </Link>
          <div className="py-2.5 text-center rounded-xl text-xs font-bold bg-white text-slate-900 shadow-xs">
            Start Free Trial
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 animate-in fade-in">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Cafe / Restaurant Name *</label>
            <input
              type="text"
              placeholder="e.g. Chai &amp; Bites Cafe"
              required
              value={cafeName}
              onChange={(e) => setCafeName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Owner / Manager Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              required
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Work Email *</label>
              <input
                type="email"
                placeholder="owner@cafe.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Mobile Number *</label>
              <input
                type="tel"
                placeholder="10-digit number"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Password *</label>
            <input
              type="password"
              placeholder="Minimum 6 characters"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl shadow-sm transition-all active:scale-98 cursor-pointer mt-2"
          >
            {loading ? 'Creating Workspace...' : 'Create My Cafe Workspace →'}
          </button>
        </form>

        {/* Benefits Footer */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-slate-500">
          <div>⚡ 0 Setup Fees</div>
          <div>📱 Tabletop QR</div>
          <div>🖨️ Thermal Billing</div>
        </div>
      </div>
    </div>
  );
}
