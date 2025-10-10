// app/sign-in/page.tsx
'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { getSupabaseClient } from '@/lib/supabase';
import { siteUrl } from '@/utils/siteUrl';
import { useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';

export default function SignInPage() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    setSupabase(getSupabaseClient());
  }, []);

  if (!supabase) {
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <div className="w-full max-w-md rounded-2xl p-6 shadow border bg-white">
          <h1 className="text-2xl font-semibold mb-6">Sign in</h1>
          <div>Loading...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-md rounded-2xl p-6 shadow border bg-white">
        <h1 className="text-2xl font-semibold mb-6">Sign in</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google', 'apple']}
          onlyThirdPartyProviders
          redirectTo={`${siteUrl}/auth/callback`}
        />
      </div>
    </main>
  );
}
