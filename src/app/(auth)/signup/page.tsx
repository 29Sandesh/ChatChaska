'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function SignupPage() {
  const router = useRouter();
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

    try {
      // In production, this registers in Supabase platform_users and cafes tables
      // For now, simulate smooth onboarding with a 14-day free trial
      setTimeout(() => {
        setLoading(false);
        router.push('/login?registered=true');
      }, 700);
    } catch {
      setErrorMsg('Failed to create account. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 select-none font-sans">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">
        {/* Branding Header */}
        <div className="text-center space-y-2">
          <img
            src="/chaska-logo.png"
            alt="ChatChaska"
            className="h-12 object-contain mx-auto shadow-2xs"
          />
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">ChatChaska POS</h1>
          <p className="text-xs text-slate-500 font-medium">
            Start your 14-day free trial • No credit card required
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <Link
            href="/login"
            className="flex-1 py-2.5 text-center rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition-all"
          >
            Sign In
          </Link>
          <div className="flex-1 py-2.5 text-center rounded-xl text-xs font-bold bg-white text-blue-600 shadow-xs">
            Start Free Trial
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Cafe / Restaurant Name"
            icon="storefront"
            type="text"
            placeholder="e.g. Chai & Bites Cafe"
            value={cafeName}
            onChange={(e) => setCafeName(e.target.value)}
            required
          />

          <Input
            label="Owner Full Name"
            icon="person"
            type="text"
            placeholder="e.g. Rahul Sharma"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            required
          />

          <Input
            label="Work Email"
            icon="mail"
            type="email"
            placeholder="owner@mycafe.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Contact Phone"
            icon="phone"
            type="tel"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <Input
            label="Password"
            icon="lock"
            type="password"
            placeholder="Create a secure password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="Must be at least 6 characters long"
            required
          />

          <div className="pt-2">
            <Button type="submit" fullWidth loading={loading}>
              Create Cafe &amp; Start Trial →
            </Button>
          </div>

          <p className="text-center font-body-sm text-[11px] text-slate-400 mt-3">
            By signing up, you agree to ChatChaska terms of service.
          </p>
        </form>
      </div>
    </div>
  );
}
