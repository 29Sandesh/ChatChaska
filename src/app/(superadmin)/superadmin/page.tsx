"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface KPIData {
  totalCafes: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  billsToday: number;
  lifetimeBills?: number;
}

interface GrowingCafe {
  name: string;
  todayBills: number;
  threshold: number;
}

interface Activity {
  id: string;
  cafe: string;
  action: string;
  time: string;
}

export default function PlatformDashboard() {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [growingCafe, setGrowingCafe] = useState<GrowingCafe | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/superadmin/dashboard");
        if (!res.ok) throw new Error("API not ready");
        const data = await res.json();
        setKpis(data.kpis);
        setGrowingCafe(data.growingCafe);
        if (data.activities) setActivities(data.activities);
      } catch (error) {
        console.error("Dashboard data load fallback:", error);
        setKpis({
          totalCafes: 1,
          activeSubscriptions: 1,
          monthlyRevenue: 45000,
          billsToday: 0,
        });
        setActivities([
          { id: "1", cafe: "ChatChaska Cafe", action: "Free Tier Active (< 100 bills/day)", time: "Today" },
        ]);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 select-none font-sans">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Platform Overview</h1>
          <p className="text-slate-500 mt-1 font-medium">Real-time fair usage monitoring and platform health.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Fair Billing Engine Active (Limit: 100 bills/day)
          </span>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Active Cafes", value: kpis?.totalCafes ?? "-", icon: "store", color: "text-blue-600" },
          { label: "Free Tier (<100/day)", value: kpis?.activeSubscriptions ?? "-", icon: "volunteer_activism", color: "text-emerald-600" },
          { label: "Platform Sales Volume", value: kpis ? `₹${kpis.monthlyRevenue.toLocaleString('en-IN')}` : "-", icon: "payments", color: "text-amber-600" },
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

      {/* Usage & Growth Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High Volume Growing Cafe Alert */}
        <div className="bg-[#FAF7F2] border border-[#C3A27C]/40 rounded-md p-4 flex items-start gap-4 shadow-2xs">
          <div className="w-10 h-10 rounded-md bg-[#C3A27C]/20 border border-[#C3A27C]/30 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[#8C6D47]">trending_up</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-slate-900 font-bold">Growing High-Volume Outlets</h3>
              <span className="text-[10px] font-black uppercase bg-[#C3A27C] text-slate-950 px-2 py-0.5 rounded-sm">Growth Alert</span>
            </div>
            {growingCafe ? (
              <p className="text-slate-700 text-sm mt-1 font-medium">
                <strong className="text-slate-950">{growingCafe.name}</strong> processed {growingCafe.todayBills} bills today (Threshold: {growingCafe.threshold}). Eligible for Starter/Pro plan upgrade.
              </p>
            ) : (
              <p className="text-slate-600 text-sm mt-1 font-medium">
                All cafes are currently operating within the 100 bills/day free tier. Free forever model in effect.
              </p>
            )}
            <div className="mt-3 flex items-center gap-2">
              <Link
                href="/superadmin/cafes"
                className="text-xs bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 px-4 py-1.5 rounded-md font-bold border border-[#B2906A] transition-colors shadow-2xs"
              >
                View Cafes Directory
              </Link>
            </div>
          </div>
        </div>

        {/* Overdue Payments / Platform Status */}
        <div className="bg-white border border-slate-200 rounded-md p-4 flex items-start gap-4 shadow-2xs">
          <div className="w-10 h-10 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-emerald-700">verified</span>
          </div>
          <div>
            <h3 className="text-slate-900 font-bold">Platform Fair Billing Policy</h3>
            <p className="text-slate-600 text-sm mt-1 font-medium leading-relaxed">
              Small food businesses and growing cafes are never locked out. When a cafe scales past 100 bills/day, they receive gentle prompts to support ongoing infrastructure.
            </p>
            <Link
              href="/superadmin/settings"
              className="inline-block mt-3 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-1.5 rounded-md font-bold transition-colors border border-slate-200"
            >
              Configure Limit Rules
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Real-time Activity Feed */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-md shadow-2xs p-6 flex flex-col min-h-[360px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">Live Platform Transaction Stream</h3>
              <p className="text-xs text-slate-500 font-medium">Recent POS bills across outlets</p>
            </div>
            <Link
              href="/superadmin/audit"
              className="text-[#967751] hover:text-[#7A5F3E] text-xs font-bold hover:underline transition-colors"
            >
              View Full Audit →
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {activities.map((act) => (
              <div key={act.id} className="flex gap-3 items-start p-3 rounded-md bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 shadow-2xs">
                  <span className="material-symbols-outlined text-[18px]">receipt</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-slate-900 truncate">{act.cafe}</p>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0">{act.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">{act.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier Distribution Summary */}
        <div className="bg-white border border-slate-200 rounded-md shadow-2xs p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 mb-1">Tier Distribution</h3>
            <p className="text-xs text-slate-500 font-medium mb-4">Active cafe tier breakdown</p>

            <div className="space-y-3">
              <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-md flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-emerald-900">Free Tier (&lt; 100/day)</p>
                  <p className="text-[10px] text-emerald-700 font-medium">100% Free Forever</p>
                </div>
                <span className="text-sm font-black text-emerald-800">1 Cafe</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-md flex items-center justify-between opacity-70">
                <div>
                  <p className="text-xs font-bold text-slate-700">Starter (100–500/day)</p>
                  <p className="text-[10px] text-slate-500 font-medium">₹999 / month</p>
                </div>
                <span className="text-sm font-bold text-slate-600">0</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-md flex items-center justify-between opacity-70">
                <div>
                  <p className="text-xs font-bold text-slate-700">Growth Pro (500–1500/day)</p>
                  <p className="text-[10px] text-slate-500 font-medium">₹2,499 / month</p>
                </div>
                <span className="text-sm font-bold text-slate-600">0</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <Link
              href="/superadmin/settings"
              className="w-full py-2 bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs border border-[#B2906A]"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>Manage Billing Rules</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
