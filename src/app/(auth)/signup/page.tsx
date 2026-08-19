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

      toast.success('🎉 Cafe registered successfully! Please log in.');
      setTimeout(() => {
        router.push('/login?registered=true');
      }, 1200);
    } catch {
      setErrorMsg('Connection error. Please try again.');
      toast.error('Network connection error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 sm:p-6 font-sans select-none overflow-x-hidden relative">
      {/* Ambient background glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative z-10">
        {/* Branding Header */}
        <div className="text-center space-y-1.5">
          <img
            src="/chaska-c-logo.png"
            alt="ChatChaska"
            className="w-12 h-12 rounded-2xl mx-auto shadow-md shadow-orange-500/10"
          />
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Create Cafe Workspace</h1>
          <p className="text-xs text-slate-400 font-medium">
            Start your 14-day free trial • 0 setup fees
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <Link
            href="/login"
            className="py-2.5 text-center rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all"
          >
            Sign In
          </Link>
          <div className="py-2.5 text-center rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md">
            Start Free Trial
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 animate-in fade-in">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Cafe / Restaurant Name *</label>
            <input
              type="text"
              placeholder="e.g. Chai &amp; Bites Cafe"
              value={cafeName}
              onChange={(e) => setCafeName(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Owner Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email *</label>
              <input
                type="email"
                placeholder="owner@cafe.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Phone (10 digits) *</label>
              <input
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password (min 8 chars) *</label>
            <input
              type="password"
              placeholder="Create a secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black py-3.5 rounded-2xl text-xs shadow-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Registering Workspace...</span>
              ) : (
                <>
                  <span>Create Cafe &amp; Launch Trial</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </>
              )}
            </button>
          </div>

          <p className="text-center text-[10px] text-slate-500 mt-2">
            By signing up, you agree to ChatChaska Terms of Service.
          </p>
        </form>
      </div>
    </div>
  );
}
