'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import loginShowcase from '@/../public/login-showcase.png';

type PortalType = 'staff' | 'owner' | 'superadmin';
type StaffRole = 'cashier' | 'waiter' | 'kitchen';

export default function UnifiedLoginPage() {
  const router = useRouter();
  const [portalType, setPortalType] = useState<PortalType>('staff');
  const [staffRole, setStaffRole] = useState<StaffRole>('cashier');
  const [pin, setPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
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
    <div className="relative min-h-screen w-full flex items-center justify-center lg:justify-end select-none font-sans overflow-hidden bg-[#FAF7F2] text-slate-900">
      {/* Desktop Left Showcase Artwork */}
      <div className="hidden lg:flex flex-1 items-center justify-center h-full p-8 relative pointer-events-none">
        <Image
          src={loginShowcase}
          alt="ChatChaska Showcase"
          priority
          className="max-h-[90vh] w-auto object-contain drop-shadow-xl"
        />
      </div>

      {/* Right Minimalist Sign In Card */}
      <div className="w-full lg:w-[420px] xl:w-[450px] flex items-center justify-center p-4 sm:p-6 lg:mr-10 relative z-10">
        <div className="w-full max-w-[380px] bg-white border border-slate-200 rounded-md p-6 sm:p-7 shadow-xl space-y-5 animate-in fade-in duration-200">
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center mb-2">
              <img
                src="/chatchaska-logo.png"
                alt="ChatChaska"
                className="h-8 w-auto object-contain drop-shadow-2xs"
              />
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Sign In to Terminal</h3>
            <p className="text-xs text-slate-500 font-medium">
              Select your access portal below
            </p>
          </div>

          {/* 3 Main Portal Tabs: Staff | Owner | Super Admin */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-md border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setPortalType('staff');
                setErrorMsg('');
                setPin('');
              }}
              className={`py-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                portalType === 'staff'
                  ? 'bg-[#C3A27C] text-slate-950 shadow-2xs border border-[#B2906A]'
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
              className={`py-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                portalType === 'owner'
                  ? 'bg-[#C3A27C] text-slate-950 shadow-2xs border border-[#B2906A]'
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
              className={`py-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                portalType === 'superadmin'
                  ? 'bg-black text-white shadow-2xs border border-slate-800'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-sm">shield</span>
              <span>Admin</span>
            </button>
          </div>

          {/* Staff Role Switcher */}
          {portalType === 'staff' && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
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
                      setErrorMsg('');
                    }}
                    className={`p-2.5 rounded-md border text-center transition-all cursor-pointer ${
                      staffRole === role.id
                        ? 'border-2 border-[#C3A27C] bg-[#FAF7F2] text-slate-950 shadow-2xs font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg block mb-0.5">
                      {role.icon}
                    </span>
                    <span className="text-xs font-bold block">{role.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            {/* Email & Password for Owner and Super Admin */}
            {(portalType === 'owner' || portalType === 'superadmin') && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {portalType === 'superadmin' ? 'Master Admin Email' : 'Owner Email'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={portalType === 'superadmin' ? '29sandesh.agrawal@gmail.com' : 'owner@cafe.com'}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-900 focus:outline-none focus:border-[#C3A27C] focus:bg-white transition-all"
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-700">Password</label>
                    <Link
                      href="/forgot-password"
                      className="text-[11px] font-bold text-slate-900 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full p-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-900 focus:outline-none focus:border-[#C3A27C] focus:bg-white transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 4-Digit PIN for Staff (With Visibility Toggle) */}
            {portalType === 'staff' && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-700">
                    Enter 4-Digit Terminal PIN
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="text-[11px] font-bold text-slate-700 hover:text-slate-950 flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {showPin ? 'visibility_off' : 'visibility'}
                    </span>
                    <span>{showPin ? 'Hide PIN' : 'Show PIN'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    maxLength={4}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoFocus
                    required
                    placeholder="1234"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center text-2xl font-mono font-black tracking-widest p-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:border-[#C3A27C] focus:bg-white transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-400 text-center font-medium">Default Cashier PIN is 1234</p>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-md text-center flex items-center justify-center gap-1.5 animate-in fade-in">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (portalType === 'staff' && pin.length !== 4)}
              className="w-full font-black py-3 rounded-md text-xs shadow-2xs cursor-pointer flex items-center justify-center gap-2 bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 border border-[#B2906A] disabled:opacity-50 transition-all active:scale-98"
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
              className="text-xs font-bold text-slate-900 hover:underline"
            >
              Start 14-Day Free Trial →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
