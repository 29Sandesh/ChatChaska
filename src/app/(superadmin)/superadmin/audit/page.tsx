"use client";

import { useState } from "react";

interface AuditEvent {
  id: string;
  timestamp: string;
  user: string;
  cafe: string;
  action: string;
  details: string;
  type: "auth" | "billing" | "menu" | "system";
}

const mockEvents: AuditEvent[] = [
  { id: "evt_1", timestamp: "Today, 14:30", user: "Admin", cafe: "Midnight Kitchen", action: "cafe_suspended", details: "Suspended due to non-payment.", type: "system" },
  { id: "evt_2", timestamp: "Today, 10:15", user: "Rahul Sharma", cafe: "Chai Point Express", action: "menu_updated", details: "Added 3 new items to Breakfast category.", type: "menu" },
  { id: "evt_3", timestamp: "Yesterday, 18:45", user: "System", cafe: "Spice Garden Cafe", action: "plan_changed", details: "Auto-downgraded from Pro to Basic.", type: "billing" },
  { id: "evt_4", timestamp: "Yesterday, 09:00", user: "Priya Patel", cafe: "Spice Garden Cafe", action: "login", details: "Successful login from IP 192.168.1.1", type: "auth" },
  { id: "evt_5", timestamp: "Oct 24, 16:20", user: "Vikram Singh", cafe: "Royal Dhaba", action: "payment_recorded", details: "Manual payment of ₹4,999 recorded.", type: "billing" },
];

export default function AuditLogPage() {
  const [events] = useState<AuditEvent[]>(mockEvents);

  const getIcon = (type: string) => {
    switch (type) {
      case "auth": return { icon: "login", bg: "bg-blue-500/20", color: "text-blue-500" };
      case "billing": return { icon: "payments", bg: "bg-emerald-500/20", color: "text-emerald-500" };
      case "menu": return { icon: "restaurant_menu", bg: "bg-amber-500/20", color: "text-amber-500" };
      case "system": return { icon: "gavel", bg: "bg-rose-500/20", color: "text-rose-500" };
      default: return { icon: "info", bg: "bg-slate-500/20", color: "text-slate-500" };
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-black text-white">System Audit Log</h1>
        <p className="text-slate-400 mt-1">Track all critical actions across the platform.</p>
      </div>

      <div className="flex gap-4 mb-6">
        <select className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-blue-500">
          <option>All Cafes</option>
          <option>Chai Point Express</option>
          <option>Midnight Kitchen</option>
        </select>
        <select className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-blue-500">
          <option>All Actions</option>
          <option>Billing Events</option>
          <option>Auth Events</option>
          <option>Menu Changes</option>
        </select>
        <input type="date" className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300 outline-none focus:border-blue-500" />
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
        <div className="relative border-l border-slate-700 ml-4 space-y-8 pb-4">
          {events.map((event) => {
            const { icon, bg, color } = getIcon(event.type);
            return (
              <div key={event.id} className="relative pl-8">
                <div className={`absolute -left-5 top-0 w-10 h-10 rounded-full ${bg} flex items-center justify-center border-4 border-slate-900`}>
                  <span className={`material-symbols-outlined text-[18px] ${color}`}>{icon}</span>
                </div>
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-white mr-2">{event.action}</span>
                      <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded">{event.cafe}</span>
                    </div>
                    <span className="text-xs text-slate-500">{event.timestamp}</span>
                  </div>
                  <p className="text-sm text-slate-300">{event.details}</p>
                  <p className="text-xs text-slate-500 mt-3 font-medium">Performed by: <span className="text-slate-400">{event.user}</span></p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-center">
          <button className="text-blue-500 hover:text-blue-400 text-sm font-bold">Load More</button>
        </div>
      </div>
    </div>
  );
}
