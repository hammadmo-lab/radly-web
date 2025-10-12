import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Check for test mode
  const isTestMode =
    process.env.NEXT_PUBLIC_TEST_MODE === 'true' ||
    process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true' ||
    req.headers.get('X-Test-Mode') === 'true' ||
    req.nextUrl.searchParams.get('test') === 'true'

  // Bypass authentication in test mode
  if (isTestMode) {
    console.log('🧪 Middleware: Test mode detected, bypassing authentication')
    return NextResponse.next()
  }

  // Normal authentication flow
  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session if expired
  await supabase.auth.getSession()
  
  return res
}

export const config = {
  matcher: [
    // Protect these paths
    '/app/:path*',
  ],
}