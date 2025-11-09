import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { createServerSupabase } from '@/lib/supabase/server'
import { sanitizeNext } from '@/lib/redirect'
import { getStoredAuthData, getDefaultOrigin } from '@/lib/auth-origin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  const supabase = await createServerSupabase()

  if (code) {
    // Exchange code for session
    await supabase.auth.exchangeCodeForSession(code)

    // Get stored auth data from cookies
    const cookieHeader = request.headers.get('cookie') || ''
    const { origin: storedOrigin, next: storedNext } = getStoredAuthData(cookieHeader)

    // Use stored values or fallbacks
    const targetOrigin = storedOrigin || getDefaultOrigin()
    const targetPath = storedNext ? sanitizeNext(storedNext) : '/app/dashboard'

    // Build full redirect URL
    const redirectUrl = new URL(targetPath, targetOrigin)

    console.log('🔐 Auth callback:', {
      storedOrigin,
      storedNext,
      targetOrigin,
      targetPath,
      finalUrl: redirectUrl.toString()
    })

    // Redirect to the stored origin + path
    return NextResponse.redirect(redirectUrl)
  }

  // If code missing, show a friendly error page
  return new NextResponse('Sign-in error: missing code', { status: 400 })
}
