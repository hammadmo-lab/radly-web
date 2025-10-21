import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { sanitizeNext } from '@/lib/redirect'
import { getStoredAuthOrigin, getDefaultOrigin } from '@/lib/auth-origin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = sanitizeNext(searchParams.get('next'))

  const supabase = await createServerSupabase()

  if (code) {
    // Exchange code for session
    await supabase.auth.exchangeCodeForSession(code)

    // Get stored origin from cookie
    const cookieHeader = request.headers.get('cookie') || ''
    const storedOrigin = getStoredAuthOrigin(cookieHeader)
    const targetOrigin = storedOrigin || getDefaultOrigin()

    // Build full redirect URL with stored origin + next path
    const redirectUrl = new URL(next, targetOrigin)

    console.log('🔐 Auth callback:', {
      storedOrigin,
      targetOrigin,
      next,
      redirectUrl: redirectUrl.toString()
    })

    // Redirect to the stored origin (handles multi-environment)
    return NextResponse.redirect(redirectUrl)
  }

  // If code missing, show a friendly error page
  return new NextResponse('Sign-in error: missing code', { status: 400 })
}
