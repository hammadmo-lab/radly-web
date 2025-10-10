'use client';

import { getSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default function Login() {
  const startGoogle = async () => {
    const supabase = getSupabaseClient();
    const redirectTo = `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: { prompt: 'select_account' },
      },
    });
    if (error) alert(error.message);
  };

  return (
    <div className="p-6">
      <button onClick={startGoogle} className="btn-primary">Continue with Google</button>
    </div>
  );
}