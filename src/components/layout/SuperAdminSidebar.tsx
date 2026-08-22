"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const navItems = [
  { label: "Dashboard", href: "/superadmin", icon: "home" },
  { label: "Cafes", href: "/superadmin/cafes", icon: "store" },
  { label: "Billing", href: "/superadmin/billing", icon: "payments" },
  { label: "Users", href: "/superadmin/users", icon: "group" },
  { label: "Audit Log", href: "/superadmin/audit", icon: "shield" },
  { label: "Settings", href: "/superadmin/settings", icon: "settings" },
];

export default function SuperAdminSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <aside className="w-64 h-screen bg-white text-slate-900 flex flex-col border-r border-slate-200 hidden md:flex shrink-0 fixed left-0 top-0 select-none font-sans">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-200 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#FAF7F2] rounded-md flex items-center justify-center shrink-0 border border-[#B2906A]/20">
          <Image src="/chaska-c-logo.png" alt="ChatChaska" width={24} height={24} className="object-contain" />
        </div>
        <div>
          <h1 className="font-black text-xl leading-tight text-slate-900">ChatChaska</h1>
          <p className="text-xs text-[#C3A27C] font-bold">Platform Control</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${
                isActive
                  ? "bg-[#FAF7F2] text-slate-900 border-l-2 border-[#C3A27C] font-bold"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {item.icon}
              </span>
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions & Profile */}
      <div className="p-4 border-t border-slate-200 flex flex-col gap-2">
        <Link
          href="/staff/pos"
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors text-sm font-medium"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>Exit to POS</span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors text-sm font-medium w-full text-left cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">power_settings_new</span>
          <span>Logout</span>
        </button>

        <div className="mt-2 pt-2 border-t border-slate-200">
          <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-slate-50 border border-slate-200">
            <div className="w-8 h-8 rounded-md bg-[#C3A27C] text-slate-950 flex items-center justify-center text-sm font-bold shrink-0">
              S
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">Super Admin</p>
              <p className="text-xs text-slate-500 truncate">admin@chatchaska.com</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function SuperAdminMobileHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <>
      {/* Mobile Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-40 md:hidden select-none font-sans">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#FAF7F2] rounded-md flex items-center justify-center shrink-0 border border-[#B2906A]/20">
            <Image src="/chaska-c-logo.png" alt="ChatChaska" width={22} height={22} className="object-contain" />
          </div>
          <div>
            <h1 className="font-black text-lg leading-tight text-slate-900">ChatChaska</h1>
            <p className="text-[10px] text-[#C3A27C] font-bold">Platform Control</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="p-2 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>
      </header>

      {/* Mobile Overlay Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex select-none font-sans">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Sidebar */}
          <aside className="relative w-4/5 max-w-xs h-full bg-white border-r border-slate-200 flex flex-col z-10 shadow-2xl">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#FAF7F2] rounded-md flex items-center justify-center shrink-0 border border-[#B2906A]/20">
                  <Image src="/chaska-c-logo.png" alt="ChatChaska" width={22} height={22} className="object-contain" />
                </div>
                <div>
                  <h1 className="font-black text-base leading-tight text-slate-900">ChatChaska</h1>
                  <p className="text-[10px] text-[#C3A27C] font-bold">Platform Control</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
                aria-label="Close menu"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            <nav className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                      isActive
                        ? "bg-[#FAF7F2] text-slate-900 border-l-2 border-[#C3A27C] font-bold"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {item.icon}
                    </span>
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-200 flex flex-col gap-2">
              <Link
                href="/staff/pos"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                <span>Exit to POS</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors text-sm font-medium w-full text-left cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">power_settings_new</span>
                <span>Logout</span>
              </button>

              <div className="mt-2 pt-2 border-t border-slate-200">
                <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-slate-50 border border-slate-200">
                  <div className="w-8 h-8 rounded-md bg-[#C3A27C] text-slate-950 flex items-center justify-center text-sm font-bold shrink-0">
                    S
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-900 truncate">Super Admin</p>
                    <p className="text-xs text-slate-500 truncate">admin@chatchaska.com</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
