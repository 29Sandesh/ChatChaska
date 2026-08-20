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
    <div className="relative min-h-screen w-full flex items-center justify-center lg:justify-end select-none font-sans overflow-hidden bg-white text-slate-900">
      {/* Full-Screen Graphic - Takes 100% of desktop view edge-to-edge */}
      <img
        src="/login-showcase.png"
        alt="ChatChaska — System Made to be Affordable, Reliable and Accessible"
        className="absolute inset-0 w-full h-full object-fill hidden lg:block pointer-events-none"
      />

      {/* RIGHT SIDE: Floating Minimal Sign In / Sign Up Panel */}
      <div className="w-full lg:w-[48%] xl:w-[42%] flex items-center justify-center p-6 sm:p-10 relative z-10 lg:mr-8 xl:mr-16">
        <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-6 animate-in fade-in duration-200">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-2">
              <img
                src="/chaska-c-logo.png"
                alt="ChatChaska"
                className="w-10 h-10 rounded-2xl object-contain shadow-xs"
              />
              <span className="font-black text-xl tracking-tight text-slate-900">ChatChaska</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Sign In to Terminal</h3>
            <p className="text-xs text-slate-500 font-medium">
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
                <p className="text-[11px] text-slate-400 text-center font-medium">Default Cashier PIN is 1234</p>
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
  );
}
