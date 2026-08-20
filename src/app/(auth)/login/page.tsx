'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type PortalType = 'staff' | 'owner' | 'superadmin';
type StaffRole = 'cashier' | 'waiter' | 'kitchen';

export default function UnifiedLoginPage() {
  const router = useRouter();
  const [portalType, setPortalType] = useState<PortalType>('staff');
  const [staffRole, setStaffRole] = useState<StaffRole>('cashier');
  const [pin, setPin] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      let body: Record<string, string>;

      if (portalType === 'superadmin' || portalType === 'owner') {
        if (!email || !password) {
          setErrorMsg('Email and password are required');
          setLoading(false);
          return;
        }
        body = { loginType: 'email', email, password };
      } else {
        if (!pin || pin.length !== 4) {
          setErrorMsg('Enter a valid 4-digit PIN');
          setLoading(false);
          return;
        }
        body = { loginType: 'pin', pin, staffRole };
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Redirect based on server response
      if (data.redirect) {
        router.push(data.redirect);
      } else {
        router.push(portalType === 'staff' ? '/staff/pos' : portalType === 'owner' ? '/admin' : '/superadmin');
      }
    } catch {
      setErrorMsg('Connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 select-none font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 space-y-6 animate-in fade-in duration-200">
        {/* Minimal Header */}
        <div className="text-center space-y-2">
          <img
            src="/chaska-c-logo.png"
            alt="ChatChaska"
            className="w-12 h-12 rounded-2xl mx-auto shadow-sm object-contain"
          />
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">ChatChaska</h1>
            <p className="text-xs text-slate-500 font-medium">Smart POS & Cafe Management</p>
          </div>
        </div>

        {/* 3 Portal Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => { setPortalType('staff'); setErrorMsg(''); setPin(''); }}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              portalType === 'staff'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Staff PIN
          </button>

          <button
            type="button"
            onClick={() => { setPortalType('owner'); setErrorMsg(''); setEmail('owner@cafe.com'); setPassword('password'); }}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              portalType === 'owner'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Cafe Owner
          </button>

          <button
            type="button"
            onClick={() => { setPortalType('superadmin'); setErrorMsg(''); setEmail('29sandesh.agrawal@gmail.com'); setPassword('Sejal_2912'); }}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              portalType === 'superadmin'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Super Admin
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 animate-in fade-in">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleLogin} className="space-y-4">
          {portalType === 'staff' ? (
            /* Staff PIN Login */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Select Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['cashier', 'waiter', 'kitchen'] as StaffRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setStaffRole(r)}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border capitalize transition-all cursor-pointer ${
                        staffRole === r
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Enter 4-Digit PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  autoFocus
                  required
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-2xl font-mono font-black tracking-widest p-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all"
                />
                <p className="text-[11px] text-slate-400 text-center mt-1">Default Cashier PIN is 1234</p>
              </div>

              <button
                type="submit"
                disabled={loading || pin.length !== 4}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl shadow-sm transition-all active:scale-98 cursor-pointer"
              >
                {loading ? 'Verifying PIN...' : 'Sign In to POS →'}
              </button>
            </div>
          ) : (
            /* Owner & Super Admin Login */
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@cafe.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-600">Password</label>
                  {portalType === 'owner' && (
                    <Link
                      href="/forgot-password"
                      className="text-[11px] font-bold text-blue-600 hover:underline"
                    >
                      Forgot?
                    </Link>
                  )}
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl shadow-sm transition-all active:scale-98 cursor-pointer"
              >
                {loading
                  ? 'Signing in...'
                  : portalType === 'superadmin'
                  ? 'Access Super Admin Console →'
                  : 'Sign In to Cafe Admin →'}
              </button>
            </div>
          )}
        </form>

        {/* Footer Link */}
        <div className="pt-2 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500 font-medium">
            New cafe owner?{' '}
            <Link href="/signup" className="text-blue-600 font-bold hover:underline">
              Create Account (14-day free trial)
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
