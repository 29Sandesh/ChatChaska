'use client';

import React, { useState, useEffect } from 'react';
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

  // Allow physical keyboard typing for PIN
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (portalType !== 'staff') return;
      if (/^[0-9]$/.test(e.key)) {
        if (pin.length < 4) {
          setPin((prev) => prev + e.key);
        }
      } else if (e.key === 'Backspace') {
        setPin((prev) => prev.slice(0, -1));
      } else if (e.key === 'Enter' && pin.length === 4) {
        handleLogin();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [portalType, pin]);

  // Fast on-screen PIN pad click
  const handlePinDigit = (digit: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + digit);
    }
  };

  const handlePinBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handlePinClear = () => {
    setPin('');
  };

  // Quick Demo Auto-Fill
  const handleAutoFillSuperAdmin = () => {
    setPortalType('superadmin');
    setEmail('29sandesh.agrawal@gmail.com');
    setPassword('Sejal_2912');
    setErrorMsg('');
  };

  const handleAutoFillStaff = (role: StaffRole) => {
    setPortalType('staff');
    setStaffRole(role);
    setPin('1234');
    setErrorMsg('');
  };

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
    <div className="min-h-screen w-full bg-slate-950 text-white flex select-none font-sans overflow-x-hidden">
      {/* LEFT SIDEBAR HERO: Branding & Platform Showcase (Hidden on small mobile screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950/40 p-12 flex-col justify-between border-r border-slate-800/80 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Logo Bar */}
        <div className="flex items-center gap-3 relative z-10">
          <img
            src="/chaska-c-logo.png"
            alt="ChatChaska"
            className="w-11 h-11 rounded-2xl object-contain shadow-lg shadow-orange-500/20"
          />
          <div>
            <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
              ChatChaska
            </span>
            <span className="text-[11px] text-slate-400 font-semibold block tracking-wider uppercase">
              Smart POS & Discovery Ecosystem
            </span>
          </div>
        </div>

        {/* Center Showcase */}
        <div className="space-y-8 relative z-10 max-w-lg">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              <span>Next-Gen Restaurant Platform 2.0</span>
            </div>
            <h2 className="text-3xl xl:text-4xl font-black text-slate-100 leading-tight">
              One Unified System for Your Staff, Kitchen & Diners.
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Supercharge your restaurant with lightning-fast offline billing, tabletop QR self-ordering, real-time KOT routing, and Swiggy Dineout-style discovery.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1.5 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">bolt</span>
              </div>
              <h4 className="text-xs font-bold text-slate-200">Sub-100ms POS</h4>
              <p className="text-[11px] text-slate-400">Offline-first local SQLite cache with 0 lag.</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1.5 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">qr_code_2</span>
              </div>
              <h4 className="text-xs font-bold text-slate-200">5 Branded QR Codes</h4>
              <p className="text-[11px] text-slate-400">Table standees with anti-fake order OTP.</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1.5 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">contactless</span>
              </div>
              <h4 className="text-xs font-bold text-slate-200">Pay-at-Table UPI</h4>
              <p className="text-[11px] text-slate-400">Dynamic NPCI QR codes for 0 wait time.</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1.5 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">table_restaurant</span>
              </div>
              <h4 className="text-xs font-bold text-slate-200">Advance Bookings</h4>
              <p className="text-[11px] text-slate-400">Manage online table reservations live.</p>
            </div>
          </div>
        </div>

        {/* Bottom Social / Footer Notice */}
        <div className="relative z-10 text-xs text-slate-500 flex items-center justify-between">
          <span>© 2026 ChatChaska Technologies</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Live Cloud Sync Active
          </span>
        </div>
      </div>

      {/* RIGHT SIDEBAR: Fast Access Unified Login Console */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Branding (Only visible on small screens) */}
          <div className="lg:hidden text-center space-y-2 mb-6">
            <img
              src="/chaska-c-logo.png"
              alt="ChatChaska"
              className="w-12 h-12 rounded-2xl mx-auto shadow-md shadow-orange-500/10 object-contain"
            />
            <h1 className="text-2xl font-black text-white tracking-tight">ChatChaska</h1>
            <p className="text-xs text-slate-400 font-medium">Smart POS & Discovery Platform</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
            {/* Header */}
            <div>
              <h3 className="text-xl font-black text-slate-100 tracking-tight">Sign In to Terminal</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Select your access portal below
              </p>
            </div>

            {/* 3 Main Portal Tabs: Staff | Owner | Super Admin */}
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setPortalType('staff');
                  setErrorMsg('');
                  setPin('');
                }}
                className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  portalType === 'staff'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
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
                className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  portalType === 'owner'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
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
                className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  portalType === 'superadmin'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-sm">shield</span>
                <span>Admin</span>
              </button>
            </div>

            {/* Staff Role Switcher */}
            {portalType === 'staff' && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
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
                          ? 'border-orange-500 bg-orange-500/15 text-orange-400 shadow-sm'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 hover:border-slate-700'
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
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {portalType === 'superadmin' ? 'Master Admin Email' : 'Owner Email'}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={portalType === 'superadmin' ? '29sandesh.agrawal@gmail.com' : 'owner@cafe.com'}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-semibold text-slate-300">Password</label>
                      <Link
                        href="/forgot-password"
                        className="text-[11px] font-bold text-orange-400 hover:text-orange-300 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-hidden"
                      required
                    />
                  </div>
                </>
              )}

              {/* 4-Digit PIN for Staff with Touchscreen Keypad + Keyboard Support */}
              {portalType === 'staff' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 text-center">
                      Enter 4-Digit Terminal PIN
                    </label>
                    {/* Visual PIN Dots / Box */}
                    <div className="flex justify-center gap-3 my-2">
                      {[0, 1, 2, 3].map((idx) => {
                        const filled = pin.length > idx;
                        return (
                          <div
                            key={idx}
                            className={`w-12 h-13 rounded-2xl border flex items-center justify-center font-mono text-2xl font-black transition-all ${
                              filled
                                ? 'border-orange-500 bg-orange-500/20 text-orange-400 shadow-md'
                                : 'border-slate-800 bg-slate-950 text-slate-600'
                            }`}
                          >
                            {filled ? '•' : ''}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Touchscreen On-Screen Keypad for POS Devices */}
                  <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto pt-1">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => {
                          if (k === 'C') handlePinClear();
                          else if (k === '⌫') handlePinBackspace();
                          else handlePinDigit(k);
                        }}
                        className={`h-12 rounded-xl text-base font-black transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
                          k === 'C'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
                            : k === '⌫'
                            ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                            : 'bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-100 shadow-xs'
                        }`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 animate-in fade-in">
                  <span className="material-symbols-outlined text-base">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full font-black py-3.5 rounded-2xl text-sm transition-all shadow-xl cursor-pointer flex items-center justify-center gap-2 ${
                  portalType === 'superadmin'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
                } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    <span>Authenticating Terminal...</span>
                  </>
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
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            {/* Signup Link for New Cafe Owners */}
            <div className="text-center pt-1">
              <span className="text-xs text-slate-400">New cafe owner? </span>
              <Link
                href="/signup"
                className="text-xs font-bold text-orange-400 hover:text-orange-300 underline transition-colors"
              >
                Start 14-Day Free Trial →
              </Link>
            </div>

            {/* Quick Demo Autofill Links for Fast Testing */}
            <div className="pt-2 border-t border-slate-800/80 text-center space-y-2">
              <span className="text-[10px] text-slate-500 block font-semibold">1-CLICK DEMO SHORTCUTS:</span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoFillSuperAdmin}
                  className="bg-purple-950/60 border border-purple-500/40 text-purple-300 hover:bg-purple-900/60 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                >
                  ⚡ Super Admin Autofill
                </button>

                <button
                  type="button"
                  onClick={() => handleAutoFillStaff('cashier')}
                  className="bg-orange-950/60 border border-orange-500/40 text-orange-300 hover:bg-orange-900/60 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                >
                  ⚡ Cashier (PIN: 1234)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
