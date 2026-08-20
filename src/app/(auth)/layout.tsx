import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex items-center justify-center">
      {children}
    </div>
  );
}
