'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TrackRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/order/track');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-sans">
      <div className="animate-pulse font-bold text-sm">Redirecting to order tracking...</div>
    </div>
  );
}
