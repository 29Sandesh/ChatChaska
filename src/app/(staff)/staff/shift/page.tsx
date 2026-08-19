'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StaffShiftPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/staff/pos');
  }, [router]);

  return null;
}
