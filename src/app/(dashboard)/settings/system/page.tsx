'use client';

import React, { useState, useEffect } from 'react';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  pin: string;
  phone?: string;
}

interface ActiveShift {
  id: string;
  cashier_name: string;
  opened_at: string;
  opening_cash: number;
  status: string;
}

interface ShiftMetrics {
  cashSales: number;
  upiSales: number;
  cardSales: number;
  totalSales: number;
  expectedCash: number;
}

export default function StaffAndShiftsPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [activeShift, setActiveShift] = useState<ActiveShift | null>(null);
  const [metrics, setMetrics] = useState<ShiftMetrics>({
    cashSales: 0,
    upiSales: 0,
    cardSales: 0,
    totalSales: 0,
    expectedCash: 0,
  });

  // Forms state
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Cashier');
  const [newStaffPin, setNewStaffPin] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');

  const [openCashierName, setOpenCashierName] = useState('Rahul Kumar');
  const [openingCashInput, setOpeningCashInput] = useState<number>(1000);

  const [closingCashInput, setClosingCashInput] = useState<number>(0);
  const [closeNotes, setCloseNotes] = useState<string>('');

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/staff');
      const data = await res.json();
      if (data.staff) setStaffList(data.staff);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchShift = async () => {
    try {
      const res = await fetch('/api/shifts');
      const data = await res.json();
      if (data.activeShift) setActiveShift(data.activeShift);
      else setActiveShift(null);

      if (data.metrics) setMetrics(data.metrics);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchShift();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !newStaffPin) return;

    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStaffName,
          role: newStaffRole,
          pin: newStaffPin,
          phone: newStaffPhone,
        }),
      });

      if (res.ok) {
        showToast(`Staff ${newStaffName} added!`);
        setNewStaffName('');
        setNewStaffPin('');
        setNewStaffPhone('');
        fetchStaff();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'open',
          cashierName: openCashierName,
          openingCash: openingCashInput,
        }),
      });

      if (res.ok) {
        showToast('Shift Register Opened!');
        fetchShift();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;

    try {
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'close',
          id: activeShift.id,
          closingCash: closingCashInput,
          expectedCash: metrics.expectedCash,
          totalSales: metrics.totalSales,
          notes: closeNotes,
        }),
      });

      if (res.ok) {
        showToast('Shift Register Closed!');
        fetchShift();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const diffCash = closingCashInput - metrics.expectedCash;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 bg-slate-50 min-h-screen text-slate-900">
      {/* Page Title */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <span className="material-symbols-outlined text-[32px] text-blue-600">settings</span>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Staff & Shift Register Management</h1>
          <p className="text-xs text-slate-500 font-medium">Manage cashier PINs, open/close daily shifts, and reconcile cash drawer</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section 1: Shift Register */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900">
              <span className="material-symbols-outlined text-amber-600">event_available</span>
              Daily Shift Register
            </h2>
            {activeShift ? (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold animate-pulse">
                🟢 SHIFT OPEN
              </span>
            ) : (
              <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">
                🔴 SHIFT CLOSED
              </span>
            )}
          </div>

          {!activeShift ? (
            /* Open Shift Form */
            <form onSubmit={handleOpenShift} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Active Cashier Name</label>
                <input
                  type="text"
                  value={openCashierName}
                  onChange={(e) => setOpenCashierName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm text-slate-900 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Opening Cash Drawer Float (₹)</label>
                <input
                  type="number"
                  value={openingCashInput}
                  onChange={(e) => setOpeningCashInput(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm text-slate-900 font-medium"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg text-sm transition-colors shadow-sm"
              >
                Start Shift Register
              </button>
            </form>
          ) : (
            /* Shift Active & Close Form */
            <div className="space-y-6">
              {/* Shift Metrics Cards */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-slate-500 block font-medium">Cashier</span>
                  <span className="font-bold text-slate-900 text-sm">{activeShift.cashier_name}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-slate-500 block font-medium">Opening Cash</span>
                  <span className="font-bold text-emerald-600 text-sm">₹{activeShift.opening_cash}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-slate-500 block font-medium">Total Shift Sales</span>
                  <span className="font-bold text-slate-900 text-sm">₹{metrics.totalSales}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-slate-500 block font-medium">Expected Cash</span>
                  <span className="font-bold text-amber-600 text-sm">₹{metrics.expectedCash}</span>
                </div>
              </div>

              {/* Close Shift Form */}
              <form onSubmit={handleCloseShift} className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="font-bold text-sm text-slate-800">Close Shift & Cash Reconciliation</h3>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Counted Actual Drawer Cash (₹)
                  </label>
                  <input
                    type="number"
                    value={closingCashInput || ''}
                    onChange={(e) => setClosingCashInput(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm text-slate-900"
                    placeholder="Enter counted physical cash..."
                    required
                  />
                </div>

                {closingCashInput > 0 && (
                  <div className={`p-3 rounded-lg border text-xs font-bold flex justify-between ${
                    diffCash >= 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}>
                    <span>Drawer Discrepancy:</span>
                    <span>{diffCash >= 0 ? `+₹${diffCash} (Surplus)` : `-₹${Math.abs(diffCash)} (Shortage)`}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Shift Notes / Remarks</label>
                  <input
                    type="text"
                    value={closeNotes}
                    onChange={(e) => setCloseNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm text-slate-900"
                    placeholder="Optional notes..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-lg text-sm transition-colors shadow-sm"
                >
                  Close Shift & Save Report
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Section 2: Staff Roster */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900">
              <span className="material-symbols-outlined text-blue-600">badge</span>
              Staff Members ({staffList.length})
            </h2>
          </div>

          {/* Staff Roster List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {staffList.length === 0 ? (
              <div className="text-xs text-slate-400 py-4 text-center">No staff members created yet</div>
            ) : (
              staffList.map((st) => (
                <div key={st.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{st.name}</div>
                    <div className="text-slate-500">{st.role} • PIN: ****</div>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded font-mono font-bold">
                    {st.role}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Add Staff Form */}
          <form onSubmit={handleAddStaff} className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="font-bold text-sm text-slate-800">Add Staff Member</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Staff Name</label>
                <input
                  type="text"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                  placeholder="e.g. Amit Singh"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Role</label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                >
                  <option value="Cashier">Cashier</option>
                  <option value="Waiter">Waiter</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">4-Digit PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  value={newStaffPin}
                  onChange={(e) => setNewStaffPin(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs tracking-widest font-mono text-slate-900"
                  placeholder="1234"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Phone</label>
                <input
                  type="text"
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                  placeholder="Optional"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-xs transition-colors shadow-sm"
            >
              Add Staff Member
            </button>
          </form>
        </div>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-lg border border-slate-700 text-xs font-bold z-50 shadow-2xl animate-in fade-in">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
