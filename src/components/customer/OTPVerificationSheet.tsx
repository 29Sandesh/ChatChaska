'use client';

import React, { useState, useEffect, useRef } from 'react';

interface OTPVerificationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (session: { phone: string; name: string; sessionToken: string }) => void;
  cafeId?: string;
  tableNumber?: string;
  purpose?: 'order' | 'review';
}

export function OTPVerificationSheet({
  isOpen,
  onClose,
  onSuccess,
  cafeId,
  tableNumber,
  purpose = 'order',
}: OTPVerificationSheetProps) {
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devHint, setDevHint] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isOpen) return null;

  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, cafe_id: cafeId, table_number: tableNumber, purpose }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

      if (data.devOtp) {
        setDevHint(`Test OTP: ${data.devOtp}`);
      }
      setStep('otp');
      setTimer(30);
      setTimeout(() => inputRefs.current[0]?.focus(), 200);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Paste handling
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        newOtp[i] = d;
      });
      setOtp(newOtp);
      const nextIdx = Math.min(digits.length, 5);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: fullOtp, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      setStep('success');
      setTimeout(() => {
        onSuccess({
          phone,
          name: data.customer?.name || name || 'Guest',
          sessionToken: data.sessionToken,
        });
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full sm:max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl relative text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        {/* Step 1: Phone Input */}
        {step === 'phone' && (
          <form onSubmit={handleSendOTP} className="space-y-5">
            <div className="text-center pt-2">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-2xl">verified_user</span>
              </div>
              <h3 className="text-xl font-bold text-slate-100">Verify Your Phone</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your mobile number to securely place your order and prevent fake bookings.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Name (Optional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mobile Number *</label>
                <div className="flex gap-2">
                  <span className="bg-slate-800/80 border border-slate-700 px-3 py-3 rounded-xl text-sm font-semibold text-slate-300 flex items-center">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    maxLength={10}
                    autoFocus
                    required
                    className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-orange-500 tracking-wider font-semibold"
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading || phone.length !== 10}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                  <span>Sending OTP...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: 6-Digit OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div className="text-center pt-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-2xl">sms</span>
              </div>
              <h3 className="text-xl font-bold text-slate-100">Enter 6-Digit Code</h3>
              <p className="text-xs text-slate-400 mt-1">
                We sent a verification code to <span className="font-semibold text-slate-200">+91 {phone}</span>
              </p>
              {devHint && <p className="text-[11px] text-amber-400 mt-1 font-mono">{devHint}</p>}
            </div>

            {/* 6 Digit Input Boxes */}
            <div className="flex justify-between gap-2 my-4">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-11 h-13 text-center text-xl font-bold bg-slate-800 border border-slate-700 focus:border-orange-500 rounded-xl text-white focus:outline-hidden transition-all shadow-inner"
                />
              ))}
            </div>

            {error && <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify & Proceed</span>
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                </>
              )}
            </button>

            {/* Resend & Change Phone */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="hover:text-slate-200 underline cursor-pointer"
              >
                Change Number
              </button>
              {timer > 0 ? (
                <span>Resend code in {timer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOTP()}
                  className="text-orange-400 font-semibold hover:underline cursor-pointer"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </form>
        )}

        {/* Step 3: Success Screen */}
        {step === 'success' && (
          <div className="text-center py-6 space-y-3 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-4xl animate-bounce">check_circle</span>
            </div>
            <h3 className="text-xl font-bold text-emerald-400">Verified Successfully!</h3>
            <p className="text-xs text-slate-300">Your table session is active. Confirming order...</p>
          </div>
        )}
      </div>
    </div>
  );
}
