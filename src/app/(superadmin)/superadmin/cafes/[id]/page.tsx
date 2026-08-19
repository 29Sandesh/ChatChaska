'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface CafeDetails {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  city: string;
  address: string;
  gstin: string;
  fssai: string;
  plan: 'trial' | 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'trial' | 'suspended' | 'expired';
  trialDaysLeft: number;
  monthlyAmount: number;
  maxDevices: number;
  activeDevices: number;
  totalBills: number;
  totalRevenue: number;
  todaySales: number;
  todayBills: number;
  createdAt: string;
  lastActive: string;
}

const MOCK_CAFES_MAP: Record<string, CafeDetails> = {
  'cafe-1': {
    id: 'cafe-1',
    name: 'Chai Point Express',
    slug: 'chai-point-express',
    ownerName: 'Rahul Sharma',
    ownerEmail: 'rahul@chaipoint.com',
    ownerPhone: '+91 98765 43210',
    city: 'Mumbai',
    address: 'Shop 4, Bandra West, Mumbai 400050',
    gstin: '27AAAAA0000A1Z5',
    fssai: '11518018000123',
    plan: 'pro',
    status: 'active',
    trialDaysLeft: 0,
    monthlyAmount: 2499,
    maxDevices: 5,
    activeDevices: 3,
    totalBills: 4120,
    totalRevenue: 540200,
    todaySales: 18450,
    todayBills: 42,
    createdAt: '2026-01-15',
    lastActive: '5 mins ago',
  },
  'cafe-2': {
    id: 'cafe-2',
    name: 'Spice Garden Cafe',
    slug: 'spice-garden',
    ownerName: 'Amit Verma',
    ownerEmail: 'amit@spicegarden.in',
    ownerPhone: '+91 91234 56789',
    city: 'Delhi',
    address: 'Plot 12, Connaught Place, New Delhi 110001',
    gstin: '07BBBBB1111B1Z2',
    fssai: '10721001000456',
    plan: 'trial',
    status: 'trial',
    trialDaysLeft: 5,
    monthlyAmount: 2499,
    maxDevices: 2,
    activeDevices: 2,
    totalBills: 680,
    totalRevenue: 98400,
    todaySales: 6300,
    todayBills: 18,
    createdAt: '2026-08-01',
    lastActive: '12 mins ago',
  },
  'cafe-3': {
    id: 'cafe-3',
    name: 'The Breakfast Club',
    slug: 'breakfast-club',
    ownerName: 'Sneha Patel',
    ownerEmail: 'sneha@breakfastclub.com',
    ownerPhone: '+91 99887 76655',
    city: 'Bangalore',
    address: 'Indiranagar 100ft Road, Bangalore 560038',
    gstin: '29CCCCC2222C1Z8',
    fssai: '11220002000789',
    plan: 'basic',
    status: 'active',
    trialDaysLeft: 0,
    monthlyAmount: 999,
    maxDevices: 2,
    activeDevices: 1,
    totalBills: 2150,
    totalRevenue: 280000,
    todaySales: 9200,
    todayBills: 24,
    createdAt: '2026-03-10',
    lastActive: '1 hour ago',
  },
  'cafe-4': {
    id: 'cafe-4',
    name: 'Midnight Kitchen',
    slug: 'midnight-kitchen',
    ownerName: 'Kunal Deshmukh',
    ownerEmail: 'kunal@midnightkitchen.in',
    ownerPhone: '+91 97654 32109',
    city: 'Pune',
    address: 'FC Road, Deccan Gymkhana, Pune 411004',
    gstin: '27DDDDD3333D1Z4',
    fssai: '11519003000999',
    plan: 'trial',
    status: 'suspended',
    trialDaysLeft: 0,
    monthlyAmount: 1999,
    maxDevices: 2,
    activeDevices: 0,
    totalBills: 340,
    totalRevenue: 45000,
    todaySales: 0,
    todayBills: 0,
    createdAt: '2026-07-10',
    lastActive: '6 days ago',
  },
  'cafe-5': {
    id: 'cafe-5',
    name: 'Royal Dhaba',
    slug: 'royal-dhaba',
    ownerName: 'Vikram Singh',
    ownerEmail: 'vikram@royaldhaba.com',
    ownerPhone: '+91 94567 89012',
    city: 'Indore',
    address: 'AB Road, Vijay Nagar, Indore 452010',
    gstin: '23EEEEE4444E1Z0',
    fssai: '11422004000111',
    plan: 'enterprise',
    status: 'active',
    trialDaysLeft: 0,
    monthlyAmount: 4999,
    maxDevices: 10,
    activeDevices: 5,
    totalBills: 9800,
    totalRevenue: 1420000,
    todaySales: 34500,
    todayBills: 78,
    createdAt: '2025-11-20',
    lastActive: 'Just now',
  },
};

export default function CafeDeepDivePage() {
  const params = useParams();
  const router = useRouter();
  const cafeId = (params?.id as string) || 'cafe-1';

  const initialCafe = MOCK_CAFES_MAP[cafeId] || MOCK_CAFES_MAP['cafe-1'];
  const [cafe, setCafe] = useState<CafeDetails>(initialCafe);
  const [selectedPlan, setSelectedPlan] = useState(cafe.plan);
  const [customPrice, setCustomPrice] = useState(cafe.monthlyAmount.toString());
  const [extraTrialDays, setExtraTrialDays] = useState('7');
  const [suspendReason, setSuspendReason] = useState('');
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [saveToast, setSaveToast] = useState('');

  const showNotification = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(''), 3000);
  };

  const handleUpdatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    setCafe((prev) => ({
      ...prev,
      plan: selectedPlan,
      monthlyAmount: parseFloat(customPrice) || prev.monthlyAmount,
    }));
    showNotification(`Plan updated to ${selectedPlan.toUpperCase()} (₹${customPrice}/mo)`);
  };

  const handleExtendTrial = () => {
    const added = parseInt(extraTrialDays, 10) || 7;
    setCafe((prev) => ({
      ...prev,
      plan: 'trial',
      status: 'trial',
      trialDaysLeft: prev.trialDaysLeft + added,
    }));
    showNotification(`Trial extended by ${added} days!`);
  };

  const handleToggleSuspend = () => {
    if (cafe.status === 'suspended') {
      setCafe((prev) => ({ ...prev, status: 'active' }));
      showNotification('Cafe account reactivated!');
    } else {
      setCafe((prev) => ({ ...prev, status: 'suspended' }));
      setShowSuspendModal(false);
      showNotification(`Cafe suspended: ${suspendReason || 'Platform Admin Action'}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-6 right-6 z-50 bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          {saveToast}
        </div>
      )}

      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/superadmin/cafes"
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all border border-slate-700"
            title="Back to All Cafes"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">{cafe.name}</h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                  cafe.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : cafe.status === 'trial'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}
              >
                {cafe.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {cafe.city} • Owner: {cafe.ownerName} ({cafe.ownerPhone})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {cafe.status === 'suspended' ? (
            <button
              onClick={handleToggleSuspend}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">lock_open</span>
              Reactivate Account
            </button>
          ) : (
            <button
              onClick={() => setShowSuspendModal(true)}
              className="bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">block</span>
              Suspend Cafe
            </button>
          )}

          <a
            href="/admin"
            target="_blank"
            rel="noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">visibility</span>
            Mirror Live Dashboard
          </a>
        </div>
      </div>

      {/* Live Cafe KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today&apos;s Revenue</div>
          <div className="text-2xl font-black text-white mt-1">₹{cafe.todaySales.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">{cafe.todayBills} bills processed today</div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lifetime Sales</div>
          <div className="text-2xl font-black text-white mt-1">₹{cafe.totalRevenue.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">{cafe.totalBills.toLocaleString('en-IN')} total orders</div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Connected Devices</div>
          <div className="text-2xl font-black text-white mt-1">{cafe.activeDevices} / {cafe.maxDevices}</div>
          <div className="text-[11px] text-emerald-400 font-bold mt-0.5">🟢 Online now</div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Monthly Billing</div>
          <div className="text-2xl font-black text-white mt-1">₹{cafe.monthlyAmount.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-blue-400 font-bold mt-0.5 uppercase">{cafe.plan} Tier</div>
        </div>
      </div>

      {/* Control Grid: Subscription & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Subscription & Custom Charges */}
        <div className="lg:col-span-2 space-y-6">
          {/* Plan & Pricing Management */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400">payments</span>
                <h3 className="text-base font-bold text-white">Subscription & Custom Pricing</h3>
              </div>
              <span className="text-xs text-slate-400">Per-cafe custom pricing override</span>
            </div>

            <form onSubmit={handleUpdatePlan} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Assigned Plan Tier</label>
                  <select
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value as CafeDetails['plan'])}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="trial">Free Trial Tier</option>
                    <option value="basic">Basic Tier (1-2 Devices)</option>
                    <option value="pro">Pro Tier (Multi-Device & AI)</option>
                    <option value="enterprise">Enterprise Tier (Unlimited)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Custom Monthly Charge (₹)</label>
                  <input
                    type="number"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder="2499"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  Save Subscription Changes
                </button>
              </div>
            </form>
          </div>

          {/* Trial Extension Control */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-700/50 pb-3">
              <span className="material-symbols-outlined text-amber-400">hourglass_top</span>
              <h3 className="text-base font-bold text-white">Free Trial Control</h3>
            </div>

            <p className="text-xs text-slate-400">
              Current trial status: <strong className="text-white">{cafe.trialDaysLeft} days remaining</strong>. Extend this specific cafe&apos;s trial duration without charging them.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setCafe((prev) => ({ ...prev, status: 'expired', trialDaysLeft: 0 }));
                  showNotification('Trial ended! Cafe will now require a paid plan.');
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition-all"
              >
                0 Days (End Trial Now)
              </button>
              <button
                type="button"
                onClick={() => {
                  setCafe((prev) => ({ ...prev, status: 'trial', trialDaysLeft: prev.trialDaysLeft + 7 }));
                  showNotification('Added +7 Days Trial!');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition-all"
              >
                +7 Days
              </button>
              <button
                type="button"
                onClick={() => {
                  setCafe((prev) => ({ ...prev, status: 'trial', trialDaysLeft: prev.trialDaysLeft + 14 }));
                  showNotification('Added +14 Days Trial!');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition-all"
              >
                +14 Days
              </button>
              <button
                type="button"
                onClick={() => {
                  setCafe((prev) => ({ ...prev, status: 'trial', trialDaysLeft: prev.trialDaysLeft + 30 }));
                  showNotification('Added +30 Days (1 Month) Trial!');
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs font-bold transition-all"
              >
                +30 Days (1 Mo)
              </button>
              <button
                type="button"
                onClick={() => {
                  setCafe((prev) => ({ ...prev, status: 'trial', trialDaysLeft: prev.trialDaysLeft + 60 }));
                  showNotification('Added +60 Days (2 Months) Trial!');
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs font-bold transition-all"
              >
                +60 Days (2 Mos)
              </button>
              <button
                type="button"
                onClick={() => {
                  setCafe((prev) => ({ ...prev, status: 'trial', trialDaysLeft: prev.trialDaysLeft + 90 }));
                  showNotification('Added +90 Days (3 Months) Trial!');
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-extrabold transition-all"
              >
                +90 Days (3 Mos)
              </button>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="number"
                value={extraTrialDays}
                onChange={(e) => setExtraTrialDays(e.target.value)}
                placeholder="Custom Days"
                className="w-36 bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleExtendTrial}
                className="bg-amber-600 hover:bg-amber-700 text-slate-950 font-black px-5 py-3 rounded-xl text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">more_time</span>
                Apply Custom Days
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Cafe Profile & Credentials */}
        <div className="space-y-6">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-700/50 pb-3">
              <span className="material-symbols-outlined text-slate-400">store</span>
              <h3 className="text-base font-bold text-white">Business Info</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 font-bold block">Owner Email</span>
                <span className="text-white font-medium">{cafe.ownerEmail}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">Owner Phone</span>
                <span className="text-white font-medium">{cafe.ownerPhone}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">Address</span>
                <span className="text-slate-300 font-medium">{cafe.address}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">GSTIN</span>
                <span className="text-slate-300 font-mono">{cafe.gstin}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">FSSAI License</span>
                <span className="text-slate-300 font-mono">{cafe.fssai}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">Onboarded On</span>
                <span className="text-slate-400 font-medium">{cafe.createdAt}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suspend Confirmation Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <h3 className="text-lg font-black text-white">Suspend {cafe.name}?</h3>
            </div>

            <p className="text-xs text-slate-400">
              Suspending this cafe will instantly lock their POS terminals and display a lockout message to the cashier and owner.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Reason for Suspension</label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="e.g. Overdue monthly payment of ₹2,499"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 h-20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSuspendModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleSuspend}
                className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md active:scale-95"
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
