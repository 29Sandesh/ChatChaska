import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-on-background flex items-center justify-center p-4">
      <main className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 p-8 sm:p-10 relative overflow-hidden">
        {children}
      </main>
    </div>
  );
}
