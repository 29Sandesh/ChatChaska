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
      case "auth": return { icon: "login", bg: "bg-blue-50 border border-blue-200", color: "text-blue-700" };
      case "billing": return { icon: "payments", bg: "bg-emerald-50 border border-emerald-200", color: "text-emerald-700" };
      case "menu": return { icon: "restaurant_menu", bg: "bg-amber-50 border border-amber-200", color: "text-amber-700" };
      case "system": return { icon: "gavel", bg: "bg-rose-50 border border-rose-200", color: "text-rose-700" };
      default: return { icon: "info", bg: "bg-slate-50 border border-slate-200", color: "text-slate-700" };
    }
  };

  return (
    <div className="space-y-6 max-w-5xl select-none font-sans">
      <div>
        <h1 className="text-3xl font-black text-slate-900">System Audit Log</h1>
        <p className="text-slate-500 mt-1 font-medium">Track all critical actions across the platform.</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <select className="bg-slate-50 border border-slate-200 rounded-md px-4 py-2 text-sm text-slate-900 font-bold outline-none focus:border-[#C3A27C] transition-colors">
          <option>All Cafes</option>
          <option>Chai Point Express</option>
          <option>Midnight Kitchen</option>
        </select>
        <select className="bg-slate-50 border border-slate-200 rounded-md px-4 py-2 text-sm text-slate-900 font-bold outline-none focus:border-[#C3A27C] transition-colors">
          <option>All Actions</option>
          <option>Billing Events</option>
          <option>Auth Events</option>
          <option>Menu Changes</option>
        </select>
        <input 
          type="date" 
          className="bg-slate-50 border border-slate-200 rounded-md px-4 py-2 text-sm text-slate-900 font-bold outline-none focus:border-[#C3A27C] transition-colors" 
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-md shadow-2xs p-6">
        <div className="relative border-l border-slate-200 ml-4 space-y-8 pb-4">
          {events.map((event) => {
            const { icon, bg, color } = getIcon(event.type);
            return (
              <div key={event.id} className="relative pl-8">
                <div className={`absolute -left-5 top-0 w-10 h-10 rounded-full ${bg} flex items-center justify-center border-4 border-white shadow-2xs`}>
                  <span className={`material-symbols-outlined text-[18px] ${color}`}>{icon}</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-md p-4 shadow-2xs">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 mr-2">{event.action}</span>
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">{event.cafe}</span>
                    </div>
                    <span className="text-xs font-medium text-slate-400">{event.timestamp}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-600">{event.details}</p>
                  <p className="text-xs text-slate-400 mt-3 font-medium">Performed by: <span className="text-slate-700 font-bold">{event.user}</span></p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-center">
          <button className="bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 font-bold px-5 py-2 rounded-md border border-[#B2906A] text-sm transition-colors shadow-2xs">
            Load More
          </button>
        </div>
      </div>
    </div>
  );
}
