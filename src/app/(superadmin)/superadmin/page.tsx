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
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black text-white">Platform Overview</h1>
        <p className="text-slate-400 mt-1">Monitor all cafes and platform metrics.</p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total Cafes", value: kpis?.totalCafes ?? "-", icon: "store", color: "text-blue-500" },
          { label: "Active Subscriptions", value: kpis?.activeSubscriptions ?? "-", icon: "verified", color: "text-emerald-500" },
          { label: "Monthly Revenue", value: kpis ? `₹${kpis.monthlyRevenue.toLocaleString('en-IN')}` : "-", icon: "account_balance_wallet", color: "text-amber-500" },
          { label: "Bills Processed Today", value: kpis?.billsToday ?? "-", icon: "receipt_long", color: "text-purple-500" },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-slate-400 text-sm font-medium">{kpi.label}</p>
              <span className={`material-symbols-outlined ${kpi.color}`}>{kpi.icon}</span>
            </div>
            <p className="text-3xl font-bold text-white">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-amber-500">warning</span>
          </div>
          <div>
            <h3 className="text-amber-500 font-bold">Expiring Trials</h3>
            <p className="text-amber-500/80 text-sm mt-1">Spice Garden Cafe trial expires in 5 days.</p>
            <button className="mt-3 text-sm bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 px-4 py-1.5 rounded-lg font-medium transition-colors">
              Send Reminder
            </button>
          </div>
        </div>

        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-rose-500">error</span>
          </div>
          <div>
            <h3 className="text-rose-500 font-bold">Overdue Payments</h3>
            <p className="text-rose-500/80 text-sm mt-1">Midnight Kitchen has an overdue payment of ₹2,499.</p>
            <button className="mt-3 text-sm bg-rose-500/20 hover:bg-rose-500/30 text-rose-500 px-4 py-1.5 rounded-lg font-medium transition-colors">
              Suspend Account
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart Placeholder */}
        <div className="xl:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Revenue Trend</h3>
            <select className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300 outline-none">
              <option>This Month</option>
              <option>Last 3 Months</option>
            </select>
          </div>
          <div className="flex-1 border border-dashed border-slate-700/50 rounded-xl flex items-center justify-center text-slate-500">
            <div className="text-center">
              <span className="material-symbols-outlined text-4xl mb-2">bar_chart</span>
              <p>Chart component placeholder</p>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Recent Activity</h3>
            <button className="text-blue-500 text-sm hover:underline">View All</button>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {activities.map((act) => (
              <div key={act.id} className="flex gap-4 relative">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                <div className="pb-4 border-b border-slate-700/50 flex-1 last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-white">{act.cafe}</p>
                  <p className="text-sm text-slate-400 mt-0.5">{act.action}</p>
                  <p className="text-xs text-slate-500 mt-1">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
