"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Cafe {
  id: string;
  name: string;
  owner: string;
  city: string;
  plan: string;
  status: "Free" | "Growing" | "Active" | "Suspended";
  todayBills: number;
  devices: number;
  lastActive: string;
}

const mockCafes: Cafe[] = [
  { id: "1", name: "Chai Point Express", owner: "Rahul Sharma", city: "Mumbai", plan: "Growth Pro", status: "Active", todayBills: 142, devices: 3, lastActive: "10 mins ago" },
  { id: "2", name: "Spice Garden Cafe", owner: "Priya Patel", city: "Delhi", plan: "Free Forever", status: "Growing", todayBills: 118, devices: 2, lastActive: "1 hour ago" },
  { id: "3", name: "The Breakfast Club", owner: "Amit Kumar", city: "Bangalore", plan: "Free Forever", status: "Free", todayBills: 34, devices: 1, lastActive: "5 mins ago" },
  { id: "4", name: "Midnight Kitchen", owner: "Sneha Reddy", city: "Pune", plan: "Starter", status: "Suspended", todayBills: 0, devices: 2, lastActive: "2 days ago" },
  { id: "5", name: "Royal Dhaba", owner: "Vikram Singh", city: "Indore", plan: "Enterprise", status: "Active", todayBills: 210, devices: 5, lastActive: "Just now" },
];

export default function CafesPage() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCafeName, setNewCafeName] = useState("");
  const [newCafeCity, setNewCafeCity] = useState("");
  const [newCafeOwner, setNewCafeOwner] = useState("");
  const [newCafePlan, setNewCafePlan] = useState("Free Forever");

  useEffect(() => {
    setCafes(mockCafes);
  }, []);

  const getStatusBadge = (status: Cafe["status"]) => {
    switch (status) {
      case "Free":
        return (
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-bold flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Free Tier (&lt;100/day)
          </span>
        );
      case "Growing":
        return (
          <span className="px-2.5 py-1 bg-[#FAF7F2] text-slate-950 border border-[#C3A27C]/60 rounded-md text-xs font-bold flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C3A27C] animate-pulse"></span>
            Growing (&gt;100/day)
          </span>
        );
      case "Active":
        return (
          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-xs font-bold flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            Active Paid
          </span>
        );
      case "Suspended":
        return (
          <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-md text-xs font-bold flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Suspended
          </span>
        );
    }
  };

  const handleAddCafe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCafeName) return;
    const newEntry: Cafe = {
      id: `${cafes.length + 1}`,
      name: newCafeName,
      owner: newCafeOwner || "Owner",
      city: newCafeCity || "India",
      plan: newCafePlan,
      status: newCafePlan === "Free Forever" ? "Free" : "Active",
      todayBills: 0,
      devices: 1,
      lastActive: "Just now",
    };
    setCafes([newEntry, ...cafes]);
    setShowAddModal(false);
    setNewCafeName("");
    setNewCafeCity("");
    setNewCafeOwner("");
  };

  const filteredCafes = cafes.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 select-none font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Cafes & Outlets</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage registered outlets, usage volume, and billing tier assignments.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 font-bold px-4 py-2 rounded-md border border-[#B2906A] flex items-center gap-2 transition-colors shadow-2xs cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Onboard New Cafe
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-md shadow-2xs p-4 flex gap-4">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search cafe name, city, or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-10 pr-4 py-2 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#C3A27C] transition-colors"
          />
        </div>
      </div>

      {/* Cafes Table */}
      <div className="bg-white border border-slate-200 rounded-md shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                <th className="p-4">Cafe Details</th>
                <th className="p-4">City</th>
                <th className="p-4">Billing Plan</th>
                <th className="p-4">Usage Status</th>
                <th className="p-4">Today Bills</th>
                <th className="p-4">Devices</th>
                <th className="p-4">Last Active</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredCafes.map((cafe) => (
                <tr key={cafe.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{cafe.name}</p>
                    <p className="text-xs text-slate-500 font-medium">Owner: {cafe.owner}</p>
                  </td>
                  <td className="p-4 text-slate-700 font-medium">{cafe.city}</td>
                  <td className="p-4">
                    <span className="font-bold text-slate-900">{cafe.plan}</span>
                  </td>
                  <td className="p-4">{getStatusBadge(cafe.status)}</td>
                  <td className="p-4">
                    <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded-sm ${
                      cafe.todayBills >= 100 
                        ? 'bg-amber-50 text-amber-900 border border-amber-300 font-black' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {cafe.todayBills} / 100
                    </span>
                  </td>
                  <td className="p-4 text-slate-700 font-medium">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-slate-400">devices</span>
                      {cafe.devices}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-slate-500 font-medium">{cafe.lastActive}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/superadmin/cafes/cafe-${cafe.id}`}
                        className="p-1.5 text-slate-400 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors inline-block"
                        title="View Cafe Details"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </Link>
                      <Link
                        href={`/superadmin/cafes/cafe-${cafe.id}`}
                        className="p-1.5 text-slate-400 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors inline-block"
                        title="Change Plan Tier"
                      >
                        <span className="material-symbols-outlined text-[18px]">tune</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard Cafe Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-md shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-lg text-slate-900">Onboard New Cafe</h3>
                <p className="text-xs text-slate-500 font-medium">Register a new cafe outlet</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddCafe} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cafe Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai Chai Bar"
                  value={newCafeName}
                  onChange={(e) => setNewCafeName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#C3A27C] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Owner Name</label>
                <input
                  type="text"
                  placeholder="e.g. Anand Kumar"
                  value={newCafeOwner}
                  onChange={(e) => setNewCafeOwner(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#C3A27C] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai"
                  value={newCafeCity}
                  onChange={(e) => setNewCafeCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#C3A27C] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Plan Tier</label>
                <select
                  value={newCafePlan}
                  onChange={(e) => setNewCafePlan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#C3A27C] transition-colors"
                >
                  <option value="Free Forever">Free Forever (&lt; 100 bills/day — ₹0)</option>
                  <option value="Starter">Starter Plan (100–500 bills/day — ₹999/mo)</option>
                  <option value="Growth Pro">Growth Pro Plan (500–1500 bills/day — ₹2,499/mo)</option>
                  <option value="Enterprise">Enterprise Plan (Unlimited — ₹4,999/mo)</option>
                </select>
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  Default: Free Forever. Small cafes pay nothing until they scale past 100 bills/day.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold px-4 py-2.5 rounded-md text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 font-bold px-5 py-2.5 rounded-md text-xs border border-[#B2906A] shadow-2xs active:scale-95 transition-colors cursor-pointer"
                >
                  Create Cafe Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
