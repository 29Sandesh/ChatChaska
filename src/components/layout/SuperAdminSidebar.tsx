"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function SuperAdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/superadmin", icon: "home" },
    { label: "Cafes", href: "/superadmin/cafes", icon: "store" },
    { label: "Billing", href: "/superadmin/billing", icon: "payments" },
    { label: "Users", href: "/superadmin/users", icon: "group" },
    { label: "Audit Log", href: "/superadmin/audit", icon: "shield" },
    { label: "Settings", href: "/superadmin/settings", icon: "settings" },
  ];

  return (
    <aside className="w-64 h-screen bg-slate-950 text-white flex flex-col border-r border-slate-800 hidden md:flex shrink-0 fixed left-0 top-0">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
          <Image src="/chaska-c-logo.png" alt="ChatChaska" width={24} height={24} className="object-contain" />
        </div>
        <div>
          <h1 className="font-black text-xl leading-tight">ChatChaska</h1>
          <p className="text-xs text-blue-400 font-medium">Platform Control</p>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                isActive
                  ? "bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/20"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold shrink-0">
            S
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">Super Admin</p>
            <p className="text-xs text-slate-400 truncate">admin@chatchaska.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
