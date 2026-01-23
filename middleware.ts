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

    // Auto-detect pricing region based on country
    const isPricingPage = pathname === '/pricing' || pathname === '/pricing/';
    if (isPricingPage && !req.nextUrl.searchParams.has('region')) {
      const countryHeader = req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry');
      const country = countryHeader ? countryHeader.toUpperCase() : null;

      console.log('[Pricing Middleware] Country detected:', country, 'Header:', countryHeader);

      if (country) {
        // Bot detection: default international for SEO
        const userAgent = req.headers.get('user-agent') || '';
        const isBot = /bot|crawler|spider|googlebot|bingbot|slurp|duckduckbot/i.test(userAgent);

        if (isBot) {
          // Bots → international pricing for SEO
          const url = req.nextUrl.clone();
          url.searchParams.set('region', 'international');
          const response = NextResponse.rewrite(url);
          response.headers.set('x-region-detected', 'true');
          response.headers.set('x-debug-country', country);
          return response;
        }

        if (country === 'EG') {
          // Egypt users → EGP pricing
          const url = req.nextUrl.clone();
          url.searchParams.set('region', 'egypt');
          const response = NextResponse.rewrite(url);
          response.headers.set('x-region-detected', 'true');
          response.headers.set('x-debug-country', country);
          return response;
        } else {
          // Non-Egypt countries → international pricing
          const url = req.nextUrl.clone();
          url.searchParams.set('region', 'international');
          const response = NextResponse.rewrite(url);
          response.headers.set('x-region-detected', 'true');
          response.headers.set('x-debug-country', country);
          return response;
        }
      } else {
        // No country detected → show modal client-side
        res.headers.set('x-region-detected', 'false');
        res.headers.set('x-debug-country', 'NONE');
      }
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
