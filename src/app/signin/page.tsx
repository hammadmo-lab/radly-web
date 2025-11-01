'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SigninAlias() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const next = searchParams.get('next');

  useEffect(() => {
    const targetUrl = next ? `/auth/signin?next=${encodeURIComponent(next)}` : '/auth/signin';
    router.replace(targetUrl);
  }, [next, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
}
