import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { sanitizeNext } from '@/lib/redirect'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = sanitizeNext(searchParams.get('next'))

  const supabase = await createServerSupabase()

  if (code) {
    // This exchanges the code for a session and sets auth cookies
    await supabase.auth.exchangeCodeForSession(code)
    return NextResponse.redirect(new URL(next, request.url))
  }

  // If code missing, show a friendly error page
  return new NextResponse('Sign-in error: missing code', { status: 400 })
}
