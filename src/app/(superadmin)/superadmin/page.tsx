"use client";

import { useEffect, useState } from "react";

interface KPIData {
  totalCafes: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  billsToday: number;
}

interface Activity {
  id: string;
  cafe: string;
  action: string;
  time: string;
}

export default function PlatformDashboard() {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // Simulate API fetch
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/superadmin/dashboard");
        if (!res.ok) throw new Error("API not ready");
        const data = await res.json();
        setKpis(data.kpis);
      } catch (error) {
        // Fallback mock data
        setKpis({
          totalCafes: 5,
          activeSubscriptions: 3,
          monthlyRevenue: 45000,
          billsToday: 247,
        });
        setActivities([
          { id: "1", cafe: "Chai Point Express", action: "Upgraded to Pro Plan", time: "2 hours ago" },
          { id: "2", cafe: "Midnight Kitchen", action: "Trial Expired", time: "5 hours ago" },
          { id: "3", cafe: "Spice Garden Cafe", action: "Generated 50+ bills", time: "Today" },
          { id: "4", cafe: "The Breakfast Club", action: "New user added: Cashier", time: "Yesterday" },
          { id: "5", cafe: "Royal Dhaba", action: "Paid ₹4,999 for Enterprise Plan", time: "2 days ago" },
        ]);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 select-none font-sans">
      <header>
        <h1 className="text-3xl font-black text-slate-900">Platform Overview</h1>
        <p className="text-slate-500 mt-1 font-medium">Monitor all cafes and platform metrics.</p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total Cafes", value: kpis?.totalCafes ?? "-", icon: "store", color: "text-blue-600" },
          { label: "Active Subscriptions", value: kpis?.activeSubscriptions ?? "-", icon: "verified", color: "text-emerald-600" },
          { label: "Monthly Revenue", value: kpis ? `₹${kpis.monthlyRevenue.toLocaleString('en-IN')}` : "-", icon: "account_balance_wallet", color: "text-amber-600" },
          { label: "Bills Processed Today", value: kpis?.billsToday ?? "-", icon: "receipt_long", color: "text-purple-600" },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-md shadow-2xs p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-slate-500 text-sm font-bold">{kpi.label}</p>
              <span className={`material-symbols-outlined ${kpi.color}`}>{kpi.icon}</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start gap-4">
          <div className="w-10 h-10 rounded-md bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-amber-700">warning</span>
          </div>
          <div>
            <h3 className="text-amber-900 font-bold">Expiring Trials</h3>
            <p className="text-amber-800 text-sm mt-1 font-medium">Spice Garden Cafe trial expires in 5 days.</p>
            <button className="mt-3 text-xs bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 px-4 py-1.5 rounded-md font-bold border border-[#B2906A] transition-colors shadow-2xs">
              Send Reminder
            </button>
          </div>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-md p-4 flex items-start gap-4">
          <div className="w-10 h-10 rounded-md bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-rose-700">error</span>
          </div>
          <div>
            <h3 className="text-rose-900 font-bold">Overdue Payments</h3>
            <p className="text-rose-800 text-sm mt-1 font-medium">Midnight Kitchen has an overdue payment of ₹2,499.</p>
            <button className="mt-3 text-xs bg-rose-600 hover:bg-rose-700 text-white px-4 py-1.5 rounded-md font-bold transition-colors shadow-2xs">
              Suspend Account
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart Placeholder */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-md shadow-2xs p-6 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-slate-900">Revenue Trend</h3>
            <select className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-sm font-bold text-slate-900 focus:border-[#C3A27C] outline-none">
              <option>This Month</option>
              <option>Last 3 Months</option>
            </select>
          </div>
          <div className="flex-1 bg-slate-50 border border-dashed border-slate-200 rounded-md flex items-center justify-center text-slate-400">
            <div className="text-center">
              <span className="material-symbols-outlined text-4xl mb-2 text-slate-400">bar_chart</span>
              <p className="text-sm font-medium text-slate-500">Chart component placeholder</p>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white border border-slate-200 rounded-md shadow-2xs p-6 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-slate-900">Recent Activity</h3>
            <button className="text-[#C3A27C] hover:text-[#B3926C] text-sm font-bold hover:underline transition-colors">View All</button>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {activities.map((act) => (
              <div key={act.id} className="flex gap-4 relative">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0"></div>
                <div className="pb-4 border-b border-slate-100 flex-1 last:border-0 last:pb-0">
                  <p className="text-sm font-bold text-slate-900">{act.cafe}</p>
                  <p className="text-sm text-slate-500 mt-0.5 font-medium">{act.action}</p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
