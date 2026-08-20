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
  const [showPin, setShowPin] = useState<boolean>(true); // Default to visible for easy verification
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
    <div className="relative min-h-screen w-full flex items-center justify-center lg:justify-end select-none font-sans overflow-hidden bg-[#FAF7F2] text-[#2D241E]">
      {/* Full-Screen High-Resolution Product Artwork - Preserves 100% exact original proportions */}
      <Image
        src={loginShowcase}
        alt="ChatChaska — System Made to be Affordable, Reliable and Accessible"
        fill
        priority
        className="object-contain object-left hidden lg:block pointer-events-none"
      />

      {/* RIGHT SIDE: Floating Beige Minimal Sign In / Sign Up Panel (Shifted further right) */}
      <div className="w-full lg:w-[42%] xl:w-[36%] 2xl:w-[32%] flex items-center justify-center lg:justify-end p-4 sm:p-6 lg:pr-8 xl:pr-14 2xl:pr-20 relative z-10">
        <div className="w-full max-w-[390px] bg-[#FAF7F2]/95 backdrop-blur-md border border-[#E8DFC9] rounded-3xl p-6 sm:p-7 shadow-2xl shadow-[#D4C8AF]/40 space-y-5 animate-in fade-in duration-200">
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="lg:hidden flex items-center justify-center mb-2">
              <img
                src="/chatchaska-logo.png"
                alt="ChatChaska"
                className="h-8 w-auto object-contain"
              />
            </div>
            <h3 className="text-xl font-black text-[#2D241E] tracking-tight">Sign In to Terminal</h3>
            <p className="text-xs text-[#7C6E65] font-medium">
              Select your access portal below
            </p>
          </div>

          {/* 3 Main Portal Tabs: Staff | Owner | Super Admin */}
          <div className="grid grid-cols-3 gap-1 bg-[#EFE8DC] p-1.5 rounded-2xl border border-[#E2D8C7]">
            <button
              type="button"
              onClick={() => {
                setPortalType('staff');
                setErrorMsg('');
                setPin('');
              }}
              className={`py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                portalType === 'staff'
                  ? 'bg-gradient-to-r from-[#EA580C] to-[#D97706] text-white shadow-xs'
                  : 'text-[#6B5E55] hover:text-[#2D241E]'
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
              className={`py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                portalType === 'owner'
                  ? 'bg-gradient-to-r from-[#EA580C] to-[#D97706] text-white shadow-xs'
                  : 'text-[#6B5E55] hover:text-[#2D241E]'
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
              className={`py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                portalType === 'superadmin'
                  ? 'bg-[#7C3AED] text-white shadow-xs'
                  : 'text-[#6B5E55] hover:text-[#2D241E]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">shield</span>
              <span>Admin</span>
            </button>
          </div>

          {/* Staff Role Switcher */}
          {portalType === 'staff' && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7C6E65] block">
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
                    className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      staffRole === role.id
                        ? 'border-[#EA580C] bg-[#FEF3C7]/60 text-[#B45309] shadow-2xs font-bold'
                        : 'border-[#E2D8C7] bg-[#F5EFE6] text-[#6B5E55] hover:bg-[#EFE8DC]'
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
                  <label className="block text-xs font-bold text-[#4A3E35] mb-1">
                    {portalType === 'superadmin' ? 'Master Admin Email' : 'Owner Email'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={portalType === 'superadmin' ? '29sandesh.agrawal@gmail.com' : 'owner@cafe.com'}
                    className="w-full p-2.5 bg-[#F5EFE6] border border-[#DED4C3] rounded-xl text-xs font-medium text-[#2D241E] focus:outline-hidden focus:border-[#EA580C] focus:bg-[#FFFDF9] transition-all"
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-[#4A3E35]">Password</label>
                    <Link
                      href="/forgot-password"
                      className="text-[11px] font-bold text-[#EA580C] hover:underline"
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
                      className="w-full p-2.5 pr-10 bg-[#F5EFE6] border border-[#DED4C3] rounded-xl text-xs font-medium text-[#2D241E] focus:outline-hidden focus:border-[#EA580C] focus:bg-[#FFFDF9] transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7D72] hover:text-[#2D241E] cursor-pointer"
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
                  <label className="block text-xs font-bold text-[#4A3E35]">
                    Enter 4-Digit Terminal PIN
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="text-[11px] font-bold text-[#EA580C] hover:underline flex items-center gap-1 cursor-pointer"
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
                    autoFocus
                    required
                    placeholder="1234"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center text-2xl font-mono font-black tracking-widest p-3 bg-[#F5EFE6] border border-[#DED4C3] rounded-2xl text-[#2D241E] focus:outline-hidden focus:border-[#EA580C] focus:bg-[#FFFDF9] transition-all"
                  />
                </div>
                <p className="text-[11px] text-[#8C7D72] text-center font-medium">Default Cashier PIN is 1234</p>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 animate-in fade-in">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (portalType === 'staff' && pin.length !== 4)}
              className="w-full font-black py-3 rounded-2xl text-xs shadow-md shadow-[#EA580C]/20 cursor-pointer flex items-center justify-center gap-2 bg-gradient-to-r from-[#EA580C] to-[#D97706] hover:from-[#C2410C] hover:to-[#B45309] text-white disabled:opacity-50 transition-all active:scale-98"
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
          <div className="text-center pt-1 border-t border-[#E8DFC9]">
            <span className="text-xs text-[#7C6E65] font-medium">New cafe owner? </span>
            <Link
              href="/signup"
              className="text-xs font-bold text-[#EA580C] hover:underline"
            >
              Start 14-Day Free Trial →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
