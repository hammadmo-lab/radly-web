// Redirect to the new NextAuth sign-in page
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/auth/signin');
  }, [router]);

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-md rounded-2xl p-6 shadow border bg-white">
        <h1 className="text-2xl font-semibold mb-6">Sign in</h1>
        <div>Redirecting...</div>
      </div>
    </main>
  );
}
