import { NextResponse, NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/config';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  try {
    const supabase = createServerClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              res.cookies.set(name, value, options);
            });
          },
        },
      }
    );
    
    const { data: { session } } = await supabase.auth.getSession();

    const { pathname, search } = req.nextUrl;
    const wantsApp = pathname.startsWith('/app');
    const wantsSignin = pathname === '/signin' || pathname === '/auth/signin';

    // Unauthed access to /app -> signin with next
    if (wantsApp && !session) {
      const url = req.nextUrl.clone();
      url.pathname = '/auth/signin';
      url.search = `?next=${encodeURIComponent(pathname + (search || ''))}`;
      return NextResponse.redirect(url);
    }

    // Already authed -> visiting /signin ==> go to next or dashboard
    if (wantsSignin && session) {
      const url = req.nextUrl.clone();
      const next = req.nextUrl.searchParams.get('next') || '/app/dashboard';
      url.pathname = next;
      url.search = '';
      return NextResponse.redirect(url);
    }

    // Don't redirect root route - let the client handle it
    // This prevents the "page can't be reached" error on first load
    
  } catch (error) {
    // CRITICAL: Only catch session lookup errors
    // Re-throw configuration/setup errors to fail closed
    if (error instanceof Error && error.message.includes('session')) {
      console.error('Session lookup failed:', error);
      // Continue without session - this is expected behavior
    } else {
      // Re-throw configuration errors
      throw error;
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next|favicon.ico|robots.txt|sitemap.xml|images|api).*)',
  ],
};
