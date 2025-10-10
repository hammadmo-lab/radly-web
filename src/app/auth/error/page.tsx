// app/auth/error/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AuthErrorContent() {
  const sp = useSearchParams();
  const reason = sp.get('reason') || 'unknown';
  const err = sp.get('error');

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-lg rounded-2xl border p-6 shadow">
        <h1 className="text-2xl font-semibold mb-4">Sign-in error</h1>
        <p className="mb-2">Reason: <code className="px-1 py-0.5 rounded bg-gray-100">{reason}</code></p>
        {err && <p className="text-sm text-red-600 break-all">Details: {err}</p>}
        <a href="/sign-in" className="inline-block mt-6 underline">Back to sign in</a>
      </div>
    </main>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={<main className="min-h-screen grid place-items-center p-6">Loading...</main>}>
      <AuthErrorContent />
    </Suspense>
  );
}
