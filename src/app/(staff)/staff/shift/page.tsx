'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { StaffNavigationDrawer } from '@/components/layout/StaffNavigationDrawer';

export default function ShiftManagementPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeShift, setActiveShift] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>({
    cashSales: 0,
    upiSales: 0,
    cardSales: 0,
    totalSales: 0,
    expectedCash: 0,
  });

  // Open Shift Form State
  const [cashierName, setCashierName] = useState('Rahul (Cashier)');
  const [openingCash, setOpeningCash] = useState<number>(1000);
  const [openingSubmitting, setOpeningSubmitting] = useState(false);

  // Close Shift Form State
  const [closingCash, setClosingCash] = useState<number>(0);
  const [closingNotes, setClosingNotes] = useState('');
  const [closingSubmitting, setClosingSubmitting] = useState(false);
  const [showZReport, setShowZReport] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('');

  useEffect(() => {
    if (!activeShift?.created_at) return;
    const tick = () => {
      const start = new Date(activeShift.created_at).getTime();
      const diff = Date.now() - start;
      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      setElapsedTime(hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [activeShift?.created_at]);

  const loadShiftData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/shifts');
      const data = await res.json();
      if (data.activeShift) {
        setActiveShift(data.activeShift);
        setMetrics(data.metrics || {});
        setClosingCash(data.metrics?.expectedCash || 0);
      } else {
        setActiveShift(null);
      }
    } catch {
      toast.error('Failed to load shift status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShiftData();
  }, []);

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpeningSubmitting(true);
    try {
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'open',
          cashierName,
          openingCash,
        }),
      });

      if (res.ok) {
        toast.success('🎉 Shift opened! Opening POS Terminal...');
        await loadShiftData();
        setTimeout(() => router.push('/staff/pos'), 1200);
      } else {
        toast.error('Failed to start shift');
      }
    } catch {
      toast.error('Network error starting shift');
    } finally {
      setOpeningSubmitting(false);
    }
  };

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setClosingSubmitting(true);
    try {
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'close',
          id: activeShift.id,
          closingCash: Number(closingCash),
          expectedCash: metrics.expectedCash,
          totalSales: metrics.totalSales,
          notes: closingNotes,
        }),
      });

      if (res.ok) {
        toast.success('✅ Shift closed successfully! Z-Report generated.');
        setShowZReport(true);
      } else {
        toast.error('Failed to close shift');
      }
    } catch {
      toast.error('Network error closing shift');
    } finally {
      setClosingSubmitting(false);
    }
  };

  const cashDifference = Number(closingCash) - (metrics.expectedCash || 0);

  return (
    <div className="flex-1 flex flex-col h-full w-full select-none font-sans bg-slate-50 overflow-hidden">
      {/* Custom Header */}
      <header className="h-16 bg-white border-b border-[#EBEBEB] px-5 flex items-center justify-between gap-4 shrink-0 shadow-2xs z-30 sticky top-0">
        {/* Left: Logo */}
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/staff/pos" className="flex items-center">
            <img src="/chatchaska-logo.png" alt="ChatChaska" className="h-8 w-auto max-w-[160px] object-contain drop-shadow-2xs" />
          </Link>
        </div>

        {/* Center: Shift Status Badge */}
        <div className="flex items-center gap-2">
          {activeShift && !showZReport ? (
            <>
              <span className="px-2.5 py-1 rounded-sm bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active • {activeShift.cashier_name}{elapsedTime ? ` • ${elapsedTime}` : ''}
              </span>
              <span className="px-2.5 py-1 rounded-sm bg-[#FAF7F2] text-slate-950 border border-[#C3A27C]/50 text-[11px] font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">payments</span>
                ₹{metrics.totalSales || 0}
              </span>
            </>
          ) : (
            <span className="px-2.5 py-1 rounded-sm bg-slate-100 text-slate-500 border border-slate-200 text-[11px] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              No Active Shift
            </span>
          )}
        </div>

        {/* Right: POS + Menu */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/staff/pos"
            className="px-3.5 py-1.5 bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs border border-[#B2906A]"
          >
            <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
            <span>POS</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="w-9 h-9 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-900 transition-all cursor-pointer border border-slate-200"
            title="Navigation Menu"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-5">

        {loading ? (
          <div className="bg-white p-12 rounded-md border border-slate-200 text-center space-y-2">
            <span className="material-symbols-outlined text-3xl text-slate-400 animate-spin">progress_activity</span>
            <p className="text-xs text-slate-400 font-bold">Checking shift status...</p>
          </div>
        ) : !activeShift ? (
          /* NO ACTIVE SHIFT: OPEN SHIFT SCREEN */
          <div className="bg-white rounded-md border border-slate-200 p-6 shadow-2xs space-y-6 animate-in fade-in">
            <div className="text-center space-y-2 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-md bg-[#FAF7F2] text-slate-900 flex items-center justify-center mx-auto shadow-2xs">
                <span className="material-symbols-outlined text-3xl">lock_open</span>
              </div>
              <h2 className="text-lg font-black text-slate-900">Start Your Cashier Shift</h2>
              <p className="text-xs text-slate-500">
                Count your physical cash float in the register drawer before starting billing for the day.
              </p>
            </div>

            <form onSubmit={handleOpenShift} className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cashier On Duty *</label>
                <input
                  type="text"
                  value={cashierName}
                  onChange={(e) => setCashierName(e.target.value)}
                  required
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-50 border border-slate-300 rounded-md px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#C3A27C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Opening Cash Float (₹) *</label>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={openingCash}
                  onChange={(e) => setOpeningCash(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-md px-4 py-3 text-lg font-black text-slate-900 text-center focus:outline-none focus:border-[#C3A27C]"
                />
                <p className="text-[11px] text-slate-400 mt-1 text-center">Initial change in drawer (100s, 50s, coins)</p>
              </div>

              <div className="flex gap-2">
                {[500, 1000, 2000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setOpeningCash(amt)}
                    className="flex-1 py-1.5 rounded-md border border-[#C3A27C]/50 bg-[#FAF7F2] hover:bg-[#C3A27C]/20 text-slate-800 text-[11px] font-bold cursor-pointer transition-colors"
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={openingSubmitting}
                className="w-full bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 border border-[#B2906A] font-black py-3 rounded-md shadow-2xs text-xs transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {openingSubmitting ? (
                  <span>Opening Drawer...</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                    <span>Start Active Shift &amp; Open POS</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : showZReport ? (
          /* Z-REPORT SUMMARY SCREEN */
          <div className="bg-white rounded-md border border-slate-200 p-6 shadow-2xs space-y-6 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
              <span className="material-symbols-outlined text-3xl">receipt_long</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Shift Z-Reading Complete</h2>
              <p className="text-xs text-slate-500 mt-0.5">Shift successfully closed and reconciled.</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-md border border-slate-200 max-w-md mx-auto text-left space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Cashier:</span>
                <span className="font-bold text-slate-900">{activeShift.cashier_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Opening Cash:</span>
                <span className="font-bold text-slate-900">₹{activeShift.opening_cash}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Total Shift Sales:</span>
                <span className="font-bold text-slate-900">₹{metrics.totalSales}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Cash Collected:</span>
                <span className="font-bold text-emerald-600">₹{metrics.cashSales}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">UPI / QR Sales:</span>
                <span className="font-bold text-slate-700">₹{metrics.upiSales}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Actual Closing Cash:</span>
                <span className="font-bold text-slate-900">₹{closingCash}</span>
              </div>
              <div className="flex justify-between py-1 pt-2 font-bold text-sm">
                <span>Variance (Over / Short):</span>
                <span className={cashDifference >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  {cashDifference >= 0 ? `+₹${cashDifference}` : `-₹${Math.abs(cashDifference)}`}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowZReport(false);
                setActiveShift(null);
                loadShiftData();
              }}
              className="px-6 py-2.5 bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 border border-[#B2906A] rounded-md font-bold text-xs cursor-pointer"
            >
              Start New Shift
            </button>
          </div>
        ) : (
          /* ACTIVE SHIFT: DASHBOARD & CLOSE CONTROLS */
          <div className="space-y-6 animate-in fade-in">
            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-md border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Opening Float</span>
                <div className="text-lg font-black text-slate-900 mt-1">₹{activeShift.opening_cash || 0}</div>
              </div>

              <div className="bg-white p-4 rounded-md border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold text-emerald-600 uppercase">Cash Sales</span>
                <div className="text-lg font-black text-emerald-600 mt-1">₹{metrics.cashSales || 0}</div>
              </div>

              <div className="bg-white p-4 rounded-md border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-700 uppercase">UPI / QR Sales</span>
                <div className="text-lg font-black text-slate-900 mt-1">₹{metrics.upiSales || 0}</div>
              </div>

              <div className="bg-white p-4 rounded-md border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-700 uppercase">Expected in Drawer</span>
                <div className="text-lg font-black text-slate-900 mt-1">₹{metrics.expectedCash || 0}</div>
              </div>
            </div>

            {/* Shift Close Form */}
            <div className="bg-white rounded-md border border-slate-200 p-6 shadow-2xs space-y-6">
              <div>
                <h2 className="text-base font-black text-slate-900">Close Current Shift (Z-Reading)</h2>
                <p className="text-xs text-slate-500">
                  Count physical cash in the drawer and enter below to reconcile drawer variance.
                </p>
              </div>

              <form onSubmit={handleCloseShift} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Actual Physical Cash Count (₹) *</label>
                    <input
                      type="number"
                      step={10}
                      value={closingCash}
                      onChange={(e) => setClosingCash(parseFloat(e.target.value) || 0)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-md px-4 py-2.5 text-base font-black text-slate-900 focus:outline-none focus:border-[#C3A27C]"
                    />
                  </div>

                  <div className="bg-slate-50 p-3 rounded-md border border-slate-200 flex flex-col justify-center">
                    <span className="text-[11px] font-bold text-slate-500">Drawer Reconciliation:</span>
                    <div className={`text-base font-black mt-0.5 flex items-center gap-1.5 ${cashDifference >= 0 ? (cashDifference === 0 ? 'text-emerald-600' : 'text-emerald-600') : 'text-rose-600'}`}>
                      {cashDifference === 0 ? (
                        <>
                          <span className="material-symbols-outlined text-lg">check_circle</span>
                          <span>Perfect Match (₹0 Variance)</span>
                        </>
                      ) : cashDifference > 0 ? (
                        <>
                          <span className="material-symbols-outlined text-lg">trending_up</span>
                          <span>Surplus: +₹{cashDifference}</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-lg">trending_down</span>
                          <span>Shortage: -₹{Math.abs(cashDifference)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Shift Notes / Handover Comments</label>
                  <textarea
                    rows={2}
                    value={closingNotes}
                    onChange={(e) => setClosingNotes(e.target.value)}
                    placeholder="e.g. ₹200 paid to supplier for ice, petty cash voucher #12"
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-3 text-xs text-slate-900 focus:outline-none focus:border-[#C3A27C]"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => router.push('/staff/pos')}
                    className="flex-1 py-3 rounded-md border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    Keep Shift Open &amp; Go to POS
                  </button>

                  <button
                    type="submit"
                    disabled={closingSubmitting}
                    className="flex-1 py-3 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {closingSubmitting ? (
                      <span>Reconciling...</span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">lock</span>
                        <span>Close Shift &amp; Generate Z-Report</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      </div>
      <StaffNavigationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}
