"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Cafe {
  id: string;
  name: string;
  owner: string;
  city: string;
  plan: string;
  status: "Active" | "Trial" | "Suspended" | "Expired";
  devices: number;
  lastActive: string;
}

const mockCafes: Cafe[] = [
  { id: "1", name: "Chai Point Express", owner: "Rahul Sharma", city: "Mumbai", plan: "Pro", status: "Active", devices: 3, lastActive: "10 mins ago" },
  { id: "2", name: "Spice Garden Cafe", owner: "Priya Patel", city: "Delhi", plan: "Trial", status: "Trial", devices: 2, lastActive: "1 hour ago" },
  { id: "3", name: "The Breakfast Club", owner: "Amit Kumar", city: "Bangalore", plan: "Basic", status: "Active", devices: 1, lastActive: "5 mins ago" },
  { id: "4", name: "Midnight Kitchen", owner: "Sneha Reddy", city: "Pune", plan: "Trial", status: "Suspended", devices: 2, lastActive: "2 days ago" },
  { id: "5", name: "Royal Dhaba", owner: "Vikram Singh", city: "Indore", plan: "Enterprise", status: "Active", devices: 5, lastActive: "Just now" },
];

export default function CafesPage() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCafeName, setNewCafeName] = useState("");
  const [newCafeCity, setNewCafeCity] = useState("");
  const [newCafeOwner, setNewCafeOwner] = useState("");
  const [newCafePlan, setNewCafePlan] = useState("Trial");

  useEffect(() => {
    setCafes(mockCafes);
  }, []);

  const getStatusBadge = (status: Cafe["status"]) => {
    switch (status) {
      case "Active":
        return <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Active</span>;
      case "Trial":
        return <span className="px-2.5 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Trial (5 days left)</span>;
      case "Suspended":
        return <span className="px-2.5 py-1 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>Suspended</span>;
      case "Expired":
        return <span className="px-2.5 py-1 bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit"><span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>Expired</span>;
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
      status: newCafePlan === "Trial" ? "Trial" : "Active",
      devices: 1,
      lastActive: "Just now",
    };
    setCafes([newEntry, ...cafes]);
    setShowAddModal(false);
    setNewCafeName("");
    setNewCafeCity("");
    setNewCafeOwner("");
  };

  const filteredCafes = cafes.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.city.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Cafes</h1>
          <p className="text-slate-400 mt-1">Manage all registered cafes on the ChatChaska platform.</p>
        </div>
        <button
          id="add-cafe-btn"
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-md active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Add New Cafe
        </button>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-700/50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              placeholder="Search by cafe name or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-900/50">
                <th className="p-4 text-sm font-semibold text-slate-400">Cafe Name</th>
                <th className="p-4 text-sm font-semibold text-slate-400">Owner</th>
                <th className="p-4 text-sm font-semibold text-slate-400">Location</th>
                <th className="p-4 text-sm font-semibold text-slate-400">Plan</th>
                <th className="p-4 text-sm font-semibold text-slate-400">Status</th>
                <th className="p-4 text-sm font-semibold text-slate-400">Devices</th>
                <th className="p-4 text-sm font-semibold text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCafes.map((cafe) => (
                <tr key={cafe.id} className="border-b border-slate-700/30 hover:bg-slate-800/80 transition-colors">
                  <td className="p-4">
                    <Link href={`/superadmin/cafes/cafe-${cafe.id}`} className="font-bold text-white hover:text-blue-400 transition-colors">
                      {cafe.name}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5">Last active: {cafe.lastActive}</p>
                  </td>
                  <td className="p-4 text-sm text-slate-300">{cafe.owner}</td>
                  <td className="p-4 text-sm text-slate-300">{cafe.city}</td>
                  <td className="p-4">
                    <span className="bg-slate-700/50 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-300">
                      {cafe.plan}
                    </span>
                  </td>
                  <td className="p-4">{getStatusBadge(cafe.status)}</td>
                  <td className="p-4 text-sm text-slate-300">{cafe.devices}</td>
                  <td className="p-4 text-right space-x-2 whitespace-nowrap">
                    <Link
                      href={`/superadmin/cafes/cafe-${cafe.id}`}
                      className="inline-flex p-2 text-slate-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-slate-700/40"
                      title="View Details & Metrics"
                    >
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </Link>
                    <Link
                      href={`/superadmin/cafes/cafe-${cafe.id}`}
                      className="inline-flex p-2 text-slate-400 hover:text-amber-400 transition-colors rounded-lg hover:bg-slate-700/40"
                      title="Edit Plan & Charges"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit_document</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Cafe Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white">Onboard New Cafe</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddCafe} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Cafe Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai Chai Bar"
                  value={newCafeName}
                  onChange={(e) => setNewCafeName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Owner Name</label>
                <input
                  type="text"
                  placeholder="e.g. Anand Kumar"
                  value={newCafeOwner}
                  onChange={(e) => setNewCafeOwner(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">City / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai"
                  value={newCafeCity}
                  onChange={(e) => setNewCafeCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Initial Plan</label>
                <select
                  value={newCafePlan}
                  onChange={(e) => setNewCafePlan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Trial">Free Trial Mode</option>
                  <option value="Basic">Basic Plan (₹999/mo)</option>
                  <option value="Pro">Pro Plan (₹2,499/mo)</option>
                  <option value="Enterprise">Enterprise Plan (₹4,999/mo)</option>
                </select>
              </div>

              {newCafePlan === 'Trial' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Trial Period Duration</label>
                  <select
                    id="new-cafe-trial-days"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500 font-semibold"
                  >
                    <option value="0">0 Days (No Trial - Immediate Payment)</option>
                    <option value="7">7 Days (1 Week)</option>
                    <option value="14" selected>14 Days (2 Weeks - Standard)</option>
                    <option value="30">30 Days (1 Month)</option>
                    <option value="60">60 Days (2 Months)</option>
                    <option value="90">90 Days (3 Months)</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md active:scale-95"
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
