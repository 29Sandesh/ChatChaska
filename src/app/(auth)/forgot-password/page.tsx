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
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 select-none font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 space-y-6 animate-in fade-in duration-200">
        <div className="text-center space-y-2">
          <img src="/chaska-c-logo.png" alt="ChatChaska" className="w-12 h-12 rounded-2xl mx-auto shadow-sm object-contain" />
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reset Password</h1>
          <p className="text-xs text-slate-500 font-medium">
            {step === 'email' ? 'Enter your registered email to receive a reset code.' : 'Enter the 6-digit code and your new password.'}
          </p>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Registered Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@mycafe.com"
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl shadow-sm transition-all active:scale-98 cursor-pointer"
            >
              {loading ? 'Sending Code...' : 'Send Verification OTP →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">6-Digit Verification Code</label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-center font-mono font-bold text-base text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">New Password (min 6 characters)</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new secure password"
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl shadow-sm transition-all active:scale-98 cursor-pointer"
            >
              {loading ? 'Resetting...' : 'Set New Password & Log In'}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-100">
          <Link href="/login" className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
