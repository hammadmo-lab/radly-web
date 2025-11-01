import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { sanitizeNext } from '@/lib/redirect'
import { getStoredAuthData, getDefaultOrigin } from '@/lib/auth-origin'

// For Capacitor builds (static export), this route won't be used
// OAuth will be handled in-app via Supabase client-side auth
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  // For static export builds without code, return 404
  // But still process valid OAuth callbacks
  if (!code && process.env.CAPACITOR_BUILD === 'true') {
    return new NextResponse('Not available in mobile app', { status: 404 })
  }

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

  // If code is missing, fall back to client-side handler to support implicit flows
  // (magic links can return access_token in the URL hash, which the server cannot see).
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const projectRef = (() => {
    try {
      const u = new URL(supabaseUrl)
      return u.hostname.split('.')[0]
    } catch { return '' }
  })()

  const html = `<!DOCTYPE html>
  <html>
  <head><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Completing sign in…</title></head>
  <body style="background:#0A0F1E;color:#fff;font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
    <div style="text-align:center">
      <div style="opacity:.8;margin-bottom:8px">Completing sign in…</div>
      <div id="msg" style="opacity:.6;font-size:14px">Please wait</div>
    </div>
    <script>
      (function(){
        function getCookie(name){
          const m = document.cookie.match(new RegExp('(?:^|; )'+name+'=([^;]*)'));
          return m? decodeURIComponent(m[1]) : null;
        }
        function setCookie(name,value,days){
          var maxAge = 400*24*60*60; // 400 days
          document.cookie = name+'='+value+'; Path=/; Max-Age='+maxAge+'; SameSite=Lax';
        }
        function clearCookie(name){ document.cookie = name+'=; Path=/; Max-Age=0'; }
        function base64url(input){
          return btoa(input).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
        }
        function parseParams(str){
          var p = {};
          (str||'').replace(/^#|^\?/,'').split('&').forEach(function(part){
            if(!part) return; var kv = part.split('='); p[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]||'');
          });
          return p;
        }
        try{
          var hash = parseParams(location.hash);
          var query = parseParams(location.search);
          var access_token = hash.access_token || query.access_token;
          var refresh_token = hash.refresh_token || query.refresh_token;
          var token_type = hash.token_type || query.token_type || 'bearer';
          var expires_in = parseInt(hash.expires_in || query.expires_in || '3600', 10);
          if(!access_token || !refresh_token){
            document.getElementById('msg').textContent = 'Sign-in error: missing code or tokens';
            return;
          }
          var now = Math.floor(Date.now()/1000);
          var expires_at = now + (isNaN(expires_in)? 3600 : expires_in);
          var payload = {
            currentSession: {
              access_token: access_token,
              refresh_token: refresh_token,
              token_type: token_type,
              expires_at: expires_at
            },
            expiresAt: (expires_at*1000)
          };
          var json = JSON.stringify(payload);
          var val = 'base64-' + base64url(json);
          var key = 'sb-${projectRef}-auth-token';
          setCookie(key, val);
          // Clear stored redirect cookies set before starting auth
          var next = getCookie('auth_next') || '/app/dashboard';
          clearCookie('auth_origin');
          clearCookie('auth_next');
          // Strip hash to avoid leaking tokens in history
          history.replaceState({}, document.title, location.pathname + location.search);
          location.replace(next);
        }catch(e){
          document.getElementById('msg').textContent = 'Sign-in error: unable to complete authentication';
          console.error(e);
        }
      })();
    </script>
  </body></html>`

  return new NextResponse(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
