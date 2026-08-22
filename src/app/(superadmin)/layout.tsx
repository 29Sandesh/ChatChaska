"use client";

import SuperAdminSidebar, { SuperAdminMobileHeader } from "@/components/layout/SuperAdminSidebar";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans select-none">
      <SuperAdminSidebar />
      <SuperAdminMobileHeader />
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen pt-14 md:pt-0">
        <div className="flex-1 p-4 md:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
