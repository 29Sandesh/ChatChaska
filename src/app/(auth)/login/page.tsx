'use client';

import React, { useState } from 'react';
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      let body: Record<string, string>;

      if (portalType === 'superadmin' || portalType === 'owner') {
        // Email + Password login
        if (!email || !password) {
          setErrorMsg('Email and password are required');
          setLoading(false);
          return;
        }
        body = { loginType: 'email', email, password };
      } else {
        // Staff PIN login
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
        router.push('/login');
      }
    } catch {
      setErrorMsg('Connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 select-none font-sans">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <img
            src="/chaska-logo.png"
            alt="ChatChaska"
            className="h-12 object-contain mx-auto shadow-2xs"
          />
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">ChatChaska POS</h1>
          <p className="text-xs text-slate-500 font-medium">Secure login — select your portal</p>
        </div>

        {/* Portal Type Switcher */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => { setPortalType('staff'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              portalType === 'staff' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] align-middle mr-1">badge</span>
            Staff
          </button>
          <button
            type="button"
            onClick={() => { setPortalType('owner'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              portalType === 'owner' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] align-middle mr-1">storefront</span>
            Owner
          </button>
          <button
            type="button"
            onClick={() => { setPortalType('superadmin'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              portalType === 'superadmin' ? 'bg-white text-purple-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] align-middle mr-1">shield_person</span>
            Admin
          </button>
        </div>

        {/* Staff Role Selector (If Staff Portal) */}
        {portalType === 'staff' && (
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-600">Select Your Staff Role:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStaffRole('cashier')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  staffRole === 'cashier'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">restaurant_menu</span>
                Cashier
              </button>

              <button
                type="button"
                onClick={() => setStaffRole('waiter')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  staffRole === 'waiter'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">tablet_mac</span>
                Waiter
              </button>

              <button
                type="button"
                onClick={() => setStaffRole('kitchen')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  staffRole === 'kitchen'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">soup_kitchen</span>
                Kitchen
              </button>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email + Password for Owner & Super Admin */}
          {(portalType === 'owner' || portalType === 'superadmin') && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  {portalType === 'superadmin' ? 'Platform Admin Email' : 'Owner Email'}
                </label>
                <input
                  type="email"
                  id="login-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={portalType === 'superadmin' ? 'admin@chatchaska.com' : 'owner@cafe.com'}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Password</label>
                <input
                  type="password"
                  id="login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                  required
                  autoComplete="current-password"
                />
              </div>
            </>
          )}

          {/* PIN for Staff */}
          {portalType === 'staff' && (
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Staff 4-Digit PIN</label>
              <input
                type="password"
                id="login-pin"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter your PIN"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-center tracking-widest font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                required
                autoComplete="off"
                inputMode="numeric"
                pattern="\d{4}"
              />
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {errorMsg}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full font-extrabold py-3.5 rounded-xl text-sm transition-all shadow-md active:scale-95 ${
              portalType === 'superadmin'
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Authenticating...
              </span>
            ) : (
              <>
                Log In to{' '}
                {portalType === 'superadmin'
                  ? 'Platform Control'
                  : portalType === 'owner'
                  ? 'Owner Dashboard'
                  : 'Staff Workspace'}{' '}
                →
              </>
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="text-center">
          <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[12px]">lock</span>
            Secured with encrypted sessions & rate limiting
          </p>
        </div>
      </div>
    </div>
  );
}
