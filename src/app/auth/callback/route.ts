// app/auth/callback/route.ts
// 
// IMPORTANT: Manual configuration required in Supabase and Google Cloud Console:
// 
// Supabase Settings → Auth → URL Configuration:
// • Site URL: https://radly.app
// • Additional Redirect URLs:
//   - https://radly.app/auth/callback
//   - https://<your-preview>.vercel.app/auth/callback
//   - http://localhost:3000/auth/callback
// 
// Google OAuth 2.0 client (in Google Cloud Console) → Authorized redirect URI:
// https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  // If Supabase added an error, surface it
  const error = url.searchParams.get('error_description') || url.searchParams.get('error');

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  if (!code) {
    const dest = new URL('/auth/error?reason=missing_code', url.origin);
    if (error) dest.searchParams.set('error', error);
    return NextResponse.redirect(dest);
  }

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    const dest = new URL('/auth/error', url.origin);
    dest.searchParams.set('reason', 'exchange_failed');
    dest.searchParams.set('error', exchangeError.message);
    return NextResponse.redirect(dest);
  }

  // Success: send the user to your app home/dashboard
  return NextResponse.redirect(new URL('/app', url.origin));
}
