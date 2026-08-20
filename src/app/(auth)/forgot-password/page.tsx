'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_otp', email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('OTP sent! Check your email or console.');
        if (data.devOtp) {
          toast.info(`Dev Mode OTP: ${data.devOtp}`);
        }
        setStep('otp');
      } else {
        toast.error(data.error || 'Failed to send reset code');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset',
          email,
          otp,
          newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('🎉 Password reset successfully! Redirecting to login...');
        setTimeout(() => router.push('/login'), 1500);
      } else {
        toast.error(data.error || 'Password reset failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white flex items-center justify-center p-4 font-sans select-none">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <img src="/chaska-c-logo.png" alt="ChatChaska" className="w-12 h-12 rounded-2xl mx-auto shadow-md object-contain" />
          <h1 className="text-xl font-black text-slate-100">Reset Password</h1>
          <p className="text-xs text-slate-400">
            {step === 'email' ? 'Enter your registered email to receive a reset code.' : 'Enter the 6-digit code and your new password.'}
          </p>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Registered Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@mycafe.com"
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-bold py-3.5 rounded-xl text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Sending Code...' : 'Send Verification OTP →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">6-Digit Verification Code</label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-4 py-2.5 text-center font-mono font-bold text-base text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">New Password (min 6 characters)</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new secure password"
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-bold py-3.5 rounded-xl text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Set New Password & Log In'}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-800">
          <Link href="/login" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
