// app/auth/error/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AuthErrorContent() {
  const sp = useSearchParams();
  const reason = sp.get('reason') || 'unknown';
  const err = sp.get('error');

  // Provide helpful error messages based on common issues
  const getErrorMessage = (reason: string) => {
    switch (reason) {
      case 'missing_code':
        return 'The authorization code is missing. This usually happens when the OAuth flow is interrupted or misconfigured.';
      case 'Configuration':
        return 'There is a problem with the server configuration. Please check your environment variables.';
      case 'AccessDenied':
        return 'Access was denied. You may have cancelled the sign-in process.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      default:
        return 'An unexpected error occurred during sign-in.';
    }
  };

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-lg rounded-2xl border p-6 shadow">
        <h1 className="text-2xl font-semibold mb-4">Sign-in error</h1>
        <p className="mb-4 text-gray-600">{getErrorMessage(reason)}</p>
        <p className="mb-2 text-sm">Error code: <code className="px-1 py-0.5 rounded bg-gray-100">{reason}</code></p>
        {err && <p className="text-sm text-red-600 break-all mb-4">Details: {err}</p>}
        <a href="/auth/signin" className="inline-block mt-6 underline hover:text-blue-600">Try signing in again</a>
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
