'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';

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
        toast.success(`🎉 Shift opened with ₹${openingCash} opening cash!`);
        await loadShiftData();
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
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-blue-600">point_of_sale</span>
              <h1 className="text-xl font-black text-slate-900">Shift &amp; Cash Drawer Reconciliation</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Track opening cash float, real-time drawer balance, and perform end-of-shift Z-readings.
            </p>
          </div>

          <button
            onClick={() => router.push('/staff/pos')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Return to POS</span>
          </button>
        </div>

        {loading ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
            <span className="material-symbols-outlined text-3xl text-blue-600 animate-spin">progress_activity</span>
            <p className="text-xs text-slate-400 font-bold">Checking shift status...</p>
          </div>
        ) : !activeShift ? (
          /* NO ACTIVE SHIFT: OPEN SHIFT SCREEN */
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
            <div className="text-center space-y-2 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-lg font-black text-slate-900 text-center focus:outline-none focus:border-blue-600"
                />
                <p className="text-[11px] text-slate-400 mt-1 text-center">Initial change in drawer (100s, 50s, coins)</p>
              </div>

              <div className="flex gap-2">
                {[500, 1000, 2000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setOpeningCash(amt)}
                    className="flex-1 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-600 cursor-pointer"
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={openingSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-xl text-xs transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
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
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 text-center animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
              <span className="material-symbols-outlined text-3xl">receipt_long</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Shift Z-Reading Complete</h2>
              <p className="text-xs text-slate-500 mt-0.5">Shift successfully closed and reconciled.</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 max-w-md mx-auto text-left space-y-2 text-xs">
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
                <span className="font-bold text-blue-600">₹{metrics.totalSales}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Cash Collected:</span>
                <span className="font-bold text-emerald-600">₹{metrics.cashSales}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">UPI / QR Sales:</span>
                <span className="font-bold text-purple-600">₹{metrics.upiSales}</span>
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
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Start New Shift
            </button>
          </div>
        ) : (
          /* ACTIVE SHIFT: DASHBOARD & CLOSE CONTROLS */
          <div className="space-y-6 animate-in fade-in">
            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Opening Float</span>
                <div className="text-lg font-black text-slate-900 mt-1">₹{activeShift.opening_cash || 0}</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-emerald-600 uppercase">Cash Sales</span>
                <div className="text-lg font-black text-emerald-600 mt-1">₹{metrics.cashSales || 0}</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-purple-600 uppercase">UPI / QR Sales</span>
                <div className="text-lg font-black text-purple-600 mt-1">₹{metrics.upiSales || 0}</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-blue-600 uppercase">Expected in Drawer</span>
                <div className="text-lg font-black text-blue-600 mt-1">₹{metrics.expectedCash || 0}</div>
              </div>
            </div>

            {/* Shift Close Form */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
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
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-base font-black text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-col justify-center">
                    <span className="text-[11px] font-bold text-slate-500">Drawer Reconciliation:</span>
                    <div className={`text-base font-black mt-0.5 ${cashDifference >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {cashDifference === 0
                        ? '✅ Perfect Match (₹0 Variance)'
                        : cashDifference > 0
                        ? `🟢 Surplus: +₹${cashDifference}`
                        : `🔴 Shortage: -₹${Math.abs(cashDifference)}`}
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => router.push('/staff/pos')}
                    className="flex-1 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Keep Shift Open &amp; Go to POS
                  </button>

                  <button
                    type="submit"
                    disabled={closingSubmitting}
                    className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
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
  );
}
