'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function TopupSlugRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const resolved = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/games/${resolved.slug}`);
  }, [resolved.slug, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-sans">
      <div className="animate-pulse font-bold text-sm">Redirecting to game top-up...</div>
    </div>
  );
}
