"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import StaffNavigationDrawer from "@/components/layout/StaffNavigationDrawer";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent triggering when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.altKey) {
        switch (e.key) {
          case "1":
            e.preventDefault();
            router.push("/staff/pos");
            break;
          case "2":
            e.preventDefault();
            router.push("/staff/orders");
            break;
          case "3":
            e.preventDefault();
            router.push("/staff/kitchen");
            break;
          case "4":
            e.preventDefault();
            router.push("/staff/tables");
            break;
          case "5":
            e.preventDefault();
            router.push("/staff/history");
            break;
          case "6":
            e.preventDefault();
            router.push("/staff/shift");
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <div className="flex h-screen flex-col bg-slate-50 font-sans">
      <header className="bg-black text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 hover:bg-slate-800 rounded-md transition-colors flex items-center"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="font-black text-xl text-[#C3A27C]">MenuCraft</h1>
        </div>
        <div className="text-sm font-bold text-slate-300 flex items-center space-x-2">
          <span className="material-symbols-outlined text-[#C3A27C]">store</span>
          <span>Staff Terminal</span>
        </div>
      </header>

      <StaffNavigationDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
