'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  status: 'free' | 'growing' | 'active' | 'suspended';
  dailyBillLimit: number;
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
    dailyBillLimit: 1500,
    monthlyAmount: 2499,
    maxDevices: 5,
    activeDevices: 3,
    totalBills: 4120,
    totalRevenue: 540200,
    todaySales: 18450,
    todayBills: 142,
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
    plan: 'free',
    status: 'growing',
    dailyBillLimit: 100,
    monthlyAmount: 0,
    maxDevices: 2,
    activeDevices: 2,
    totalBills: 680,
    totalRevenue: 98400,
    todaySales: 6300,
    todayBills: 118,
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
    plan: 'free',
    status: 'free',
    dailyBillLimit: 100,
    monthlyAmount: 0,
    maxDevices: 2,
    activeDevices: 1,
    totalBills: 2150,
    totalRevenue: 280000,
    todaySales: 9200,
    todayBills: 34,
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
    plan: 'basic',
    status: 'suspended',
    dailyBillLimit: 500,
    monthlyAmount: 999,
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
    dailyBillLimit: 99999,
    monthlyAmount: 4999,
    maxDevices: 10,
    activeDevices: 5,
    totalBills: 9800,
    totalRevenue: 1420000,
    todaySales: 34500,
    todayBills: 210,
    createdAt: '2025-11-20',
    lastActive: 'Just now',
  },
};

export default function CafeDeepDivePage() {
  const params = useParams();
  const cafeId = (params?.id as string) || 'cafe-1';

  const initialCafe = MOCK_CAFES_MAP[cafeId] || MOCK_CAFES_MAP['cafe-1'];
  const [cafe, setCafe] = useState<CafeDetails>(initialCafe);
  const [selectedPlan, setSelectedPlan] = useState(cafe.plan);
  const [customPrice, setCustomPrice] = useState(cafe.monthlyAmount.toString());
  const [customThreshold, setCustomThreshold] = useState(cafe.dailyBillLimit.toString());
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
      dailyBillLimit: parseInt(customThreshold, 10) || prev.dailyBillLimit,
      status: selectedPlan === 'free' ? 'free' : 'active',
    }));
    showNotification(`Plan updated to ${selectedPlan.toUpperCase()} (₹${customPrice}/mo, Limit: ${customThreshold} bills/day)`);
  };

  const handleToggleSuspend = () => {
    if (cafe.status === 'suspended') {
      setCafe((prev) => ({ ...prev, status: prev.plan === 'free' ? 'free' : 'active' }));
      showNotification('Cafe account reactivated!');
    } else {
      setCafe((prev) => ({ ...prev, status: 'suspended' }));
      setShowSuspendModal(false);
      showNotification(`Cafe suspended: ${suspendReason || 'Platform Admin Action'}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none font-sans">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-6 right-6 z-50 bg-[#C3A27C] text-slate-950 px-5 py-3 rounded-md shadow-xl font-bold text-xs flex items-center gap-2 border border-[#B2906A] animate-bounce">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          {saveToast}
        </div>
      )}

      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/superadmin/cafes"
            className="w-10 h-10 rounded-md bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center transition-all border border-slate-200 shadow-2xs"
            title="Back to All Cafes"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">{cafe.name}</h1>
              <span
                className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide border ${
                  cafe.status === 'active'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : cafe.status === 'growing'
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : cafe.status === 'free'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {cafe.status === 'free' ? 'Free Tier' : cafe.status === 'growing' ? 'Growing (>100/day)' : cafe.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {cafe.city} • Owner: {cafe.ownerName} ({cafe.ownerPhone})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {cafe.status === 'suspended' ? (
            <button
              onClick={handleToggleSuspend}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">lock_open</span>
              Reactivate Account
            </button>
          ) : (
            <button
              onClick={() => setShowSuspendModal(true)}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-4 py-2 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[18px]">block</span>
              Suspend Cafe
            </button>
          )}

          <Link
            href="/admin"
            className="bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 border border-[#B2906A] px-4 py-2 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px]">visibility</span>
            Live Cafe Admin
          </Link>
        </div>
      </div>

      {/* Live Cafe KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-md shadow-2xs p-4">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Today&apos;s Billing Volume</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{cafe.todayBills} bills</div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">₹{cafe.todaySales.toLocaleString('en-IN')} revenue today</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md shadow-2xs p-4">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Lifetime Sales</div>
          <div className="text-2xl font-black text-slate-900 mt-1">₹{cafe.totalRevenue.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">{cafe.totalBills.toLocaleString('en-IN')} total orders</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md shadow-2xs p-4">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Connected Devices</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{cafe.activeDevices} / {cafe.maxDevices}</div>
          <div className="text-[11px] text-emerald-700 font-bold mt-0.5">🟢 Online now</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md shadow-2xs p-4">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Current Plan Tier</div>
          <div className="text-2xl font-black text-slate-900 mt-1">₹{cafe.monthlyAmount.toLocaleString('en-IN')}/mo</div>
          <div className="text-[11px] text-[#8C6D47] font-bold mt-0.5 uppercase">{cafe.plan} Tier</div>
        </div>
      </div>

      {/* Control Grid: Subscription & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Plan & Custom Limits */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-md shadow-2xs p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8C6D47]">tune</span>
                <h3 className="text-base font-bold text-slate-900">Plan Assignment & Fair Usage Overrides</h3>
              </div>
              <span className="text-xs text-slate-500">Per-cafe limits & pricing</span>
            </div>

            <form onSubmit={handleUpdatePlan} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Plan Tier</label>
                  <select
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value as CafeDetails['plan'])}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#C3A27C]"
                  >
                    <option value="free">Free Forever (&lt;100 bills/day)</option>
                    <option value="basic">Starter Plan (100–500 bills/day)</option>
                    <option value="pro">Growth Pro Plan (500–1500 bills/day)</option>
                    <option value="enterprise">Enterprise Plan (Unlimited)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Daily Bill Free Limit</label>
                  <input
                    type="number"
                    value={customThreshold}
                    onChange={(e) => setCustomThreshold(e.target.value)}
                    placeholder="100"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#C3A27C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Billing (₹)</label>
                  <input
                    type="number"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#C3A27C]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 font-bold px-5 py-2.5 rounded-md text-xs border border-[#B2906A] shadow-2xs transition-colors cursor-pointer"
                >
                  Save Tier &amp; Limit Overrides
                </button>
              </div>
            </form>
          </div>

          {/* Usage Volume Health Banner */}
          <div className="bg-[#FAF7F2] border border-[#C3A27C]/40 rounded-md p-5 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#8C6D47]">analytics</span>
              <h3 className="text-sm font-bold text-slate-900">Fair Usage &amp; Monetization Status</h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              This cafe processed <strong className="text-slate-950 font-bold">{cafe.todayBills} bills today</strong> against a threshold of <strong className="text-slate-950 font-bold">{cafe.dailyBillLimit} bills/day</strong>.
              {cafe.todayBills >= cafe.dailyBillLimit ? (
                <span className="block mt-1 text-amber-900 font-bold">
                  ⚠️ Cafe is exceeding its daily volume limit. They are receiving gentle upgrade prompts in their terminal.
                </span>
              ) : (
                <span className="block mt-1 text-emerald-800 font-medium">
                  ✅ Operating smoothly within free tier boundaries. No charges or alerts triggered.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right Col: Cafe Profile & Credentials */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-md shadow-2xs p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="material-symbols-outlined text-slate-500">store</span>
              <h3 className="text-base font-bold text-slate-900">Outlet Profile</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 font-bold block">Owner Email</span>
                <span className="text-slate-900 font-medium">{cafe.ownerEmail}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">Owner Phone</span>
                <span className="text-slate-900 font-medium">{cafe.ownerPhone}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">Address</span>
                <span className="text-slate-700 font-medium">{cafe.address}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">GSTIN</span>
                <span className="text-slate-700 font-mono">{cafe.gstin}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">FSSAI License</span>
                <span className="text-slate-700 font-mono">{cafe.fssai}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">Onboarded On</span>
                <span className="text-slate-600 font-medium">{cafe.createdAt}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suspend Confirmation Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-md bg-rose-50 border border-rose-200 flex items-center justify-center">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">Suspend {cafe.name}?</h3>
            </div>

            <p className="text-xs text-slate-600">
              Suspending this cafe will instantly lock their POS terminals and display a lockout message to the cashier and owner.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Suspension</label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="e.g. Repeated non-compliance or requested temporary shutdown"
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-rose-500 h-20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSuspendModal(false)}
                className="px-4 py-2 rounded-md text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleSuspend}
                className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-md text-xs font-bold shadow-2xs cursor-pointer"
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
