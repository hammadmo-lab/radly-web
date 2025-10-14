import { NextResponse, NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
  const isRoot = pathname === '/' || pathname === '';

  // Unauthed access to /app -> signin with next
  if (wantsApp && !session) {
    const url = req.nextUrl.clone();
    url.pathname = '/signin';
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

  // Root redirect: if authed, land on dashboard
  if (isRoot && session) {
    const url = req.nextUrl.clone();
    url.pathname = '/app/dashboard';
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next|favicon.ico|robots.txt|sitemap.xml|images|api).*)',
  ],
};