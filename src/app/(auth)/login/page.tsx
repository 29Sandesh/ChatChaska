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
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex select-none font-sans overflow-x-hidden">
      {/* LEFT COLUMN: Product Showcase & Value Proposition */}
      <div className="hidden lg:flex lg:w-1/2 bg-white p-12 flex-col justify-between border-r border-slate-200/90 relative overflow-hidden">
        {/* Top Logo Bar */}
        <div className="flex items-center gap-3 relative z-10">
          <img
            src="/chaska-c-logo.png"
            alt="ChatChaska"
            className="w-11 h-11 rounded-2xl object-contain shadow-sm shadow-blue-500/10"
          />
          <div>
            <span className="font-black text-2xl tracking-tight text-slate-900">
              ChatChaska
            </span>
            <span className="text-[11px] text-slate-500 font-semibold block tracking-wider uppercase">
              Smart POS &amp; Discovery Ecosystem
            </span>
          </div>
        </div>

        {/* Center Showcase */}
        <div className="space-y-8 relative z-10 max-w-lg">
          <div className="space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Next-Gen Restaurant Platform 2.0</span>
            </div>
            <h2 className="text-3xl xl:text-4xl font-black text-slate-900 leading-tight">
              One Unified System for Your Staff, Kitchen &amp; Diners.
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Supercharge your restaurant with lightning-fast offline billing, tabletop QR self-ordering, real-time KOT routing, and Swiggy Dineout-style discovery.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200/90 p-4.5 rounded-2xl space-y-1.5 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">bolt</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">Sub-100ms POS</h4>
              <p className="text-[11px] text-slate-500 font-medium">Offline-first local SQLite cache with 0 lag.</p>
            </div>

            <div className="bg-slate-50 border border-slate-200/90 p-4.5 rounded-2xl space-y-1.5 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">qr_code_2</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">5 Branded QR Codes</h4>
              <p className="text-[11px] text-slate-500 font-medium">Table standees with anti-fake order OTP.</p>
            </div>

            <div className="bg-slate-50 border border-slate-200/90 p-4.5 rounded-2xl space-y-1.5 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">contactless</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">Pay-at-Table UPI</h4>
              <p className="text-[11px] text-slate-500 font-medium">Dynamic NPCI QR codes for 0 wait time.</p>
            </div>

            <div className="bg-slate-50 border border-slate-200/90 p-4.5 rounded-2xl space-y-1.5 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">table_restaurant</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">Advance Bookings</h4>
              <p className="text-[11px] text-slate-500 font-medium">Manage online table reservations live.</p>
            </div>
          </div>
        </div>

        {/* Bottom Footer Notice */}
        <div className="relative z-10 text-xs text-slate-400 font-medium flex items-center justify-between">
          <span>© 2026 ChatChaska Technologies</span>
          <span className="flex items-center gap-1.5 text-slate-500 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Live Cloud Sync Active
          </span>
        </div>
      </div>

      {/* RIGHT COLUMN: Minimal White Login Console */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-slate-50">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Branding (Only visible on small mobile screens) */}
          <div className="lg:hidden text-center space-y-2 mb-4">
            <img
              src="/chaska-c-logo.png"
              alt="ChatChaska"
              className="w-12 h-12 rounded-2xl mx-auto shadow-sm object-contain"
            />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">ChatChaska</h1>
            <p className="text-xs text-slate-500 font-medium">Smart POS &amp; Cafe Management</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-6">
            {/* Card Header */}
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Sign In to Terminal</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Select your access portal below
              </p>
            </div>

            {/* 3 Main Portal Tabs: Staff | Owner | Super Admin */}
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setPortalType('staff');
                  setErrorMsg('');
                  setPin('');
                }}
                className={`py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  portalType === 'staff'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-sm">badge</span>
                <span>Staff</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPortalType('owner');
                  setErrorMsg('');
                  setEmail('owner@cafe.com');
                  setPassword('password');
                }}
                className={`py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  portalType === 'owner'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-sm">storefront</span>
                <span>Owner</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPortalType('superadmin');
                  setErrorMsg('');
                  setEmail('29sandesh.agrawal@gmail.com');
                  setPassword('Sejal_2912');
                }}
                className={`py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  portalType === 'superadmin'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-sm">shield</span>
                <span>Admin</span>
              </button>
            </div>

            {/* Staff Role Switcher */}
            {portalType === 'staff' && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Terminal Role:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cashier', label: 'Cashier', icon: 'point_of_sale' },
                    { id: 'waiter', label: 'Waiter', icon: 'tablet' },
                    { id: 'kitchen', label: 'Kitchen', icon: 'soup_kitchen' },
                  ].map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => {
                        setStaffRole(role.id as StaffRole);
                        setPin('');
                      }}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        staffRole === role.id
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl block mb-1">
                        {role.icon}
                      </span>
                      <span className="text-xs font-bold block">{role.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email & Password for Owner and Super Admin */}
              {(portalType === 'owner' || portalType === 'superadmin') && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {portalType === 'superadmin' ? 'Master Admin Email' : 'Owner Email'}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={portalType === 'superadmin' ? '29sandesh.agrawal@gmail.com' : 'owner@cafe.com'}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-slate-700">Password</label>
                      <Link
                        href="/forgot-password"
                        className="text-[11px] font-bold text-blue-600 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>
              )}

              {/* 4-Digit PIN for Staff (Clean Input without Dialpad) */}
              {portalType === 'staff' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Enter 4-Digit Terminal PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    autoFocus
                    required
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center text-2xl font-mono font-black tracking-widest p-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all"
                  />
                  <p className="text-[11px] text-slate-400 text-center">Default Cashier PIN is 1234</p>
                </div>
              )}

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 animate-in fade-in">
                  <span className="material-symbols-outlined text-base">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || (portalType === 'staff' && pin.length !== 4)}
                className="w-full font-black py-3.5 rounded-2xl text-xs shadow-sm cursor-pointer flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-all active:scale-98"
              >
                {loading ? (
                  <span>Authenticating Terminal...</span>
                ) : (
                  <>
                    <span>
                      Unlock{' '}
                      {portalType === 'superadmin'
                        ? 'Super Admin Control'
                        : portalType === 'owner'
                        ? 'Cafe Admin Console'
                        : `${staffRole.toUpperCase()} Terminal`}
                    </span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            {/* Signup Link for New Cafe Owners */}
            <div className="text-center pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-medium">New cafe owner? </span>
              <Link
                href="/signup"
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Start 14-Day Free Trial →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
