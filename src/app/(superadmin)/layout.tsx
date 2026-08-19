import SuperAdminSidebar from "@/components/layout/SuperAdminSidebar";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-500/30">
      <SuperAdminSidebar />
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <div className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
