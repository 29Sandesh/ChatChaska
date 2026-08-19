'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminInventoryPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/menu');
  }, [router]);

  return (
    <div className="p-8 text-center text-xs text-slate-400">
      Redirecting to Menu...
    </div>
  );
}
