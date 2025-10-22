# Prompt for ChatGPT: Supabase Auth Redirect Issue

## Problem

I'm using Supabase authentication with Next.js 15 (App Router) and experiencing redirect issues across multiple environments (localhost, Vercel preview, production).

### Current Behavior

**Magic Link (OTP):**
- When I send a magic link from `http://localhost:3000`, the email contains: `https://radly.app`
- I updated the email template to use `{{ .RedirectTo }}` instead of `{{ .ConfirmationURL }}`
- After the change, the magic link became just `https://radly.app` (without callback path)
- My code sends `emailRedirectTo: 'http://localhost:3000/auth/callback?next=%2Fapp%2Fdashboard'`

**Google OAuth:**
- Similar issue - always redirects to production (`https://radly.app`) instead of respecting the `redirectTo` parameter

### Configuration

**Supabase Dashboard (Authentication → URL Configuration):**
- Site URL: `https://radly.app`
- Redirect URLs:
  ```
  http://localhost:3000/auth/callback
  https://radly.app/auth/callback
  https://*.vercel.app/auth/callback
  ```

**Code (Magic Link):**
```typescript
const currentOrigin = window.location.origin // 'http://localhost:3000'
const emailRedirectTo = `${currentOrigin}/auth/callback?next=%2Fapp%2Fdashboard`

await supabase.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo
  }
})
```

**Code (Google OAuth):**
```typescript
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback?next=%2Fapp%2Fdashboard`
  }
})
```

**Email Template:**
Changed from:
```html
<a href="{{ .ConfirmationURL }}">Log In</a>
```

To:
```html
<a href="{{ .RedirectTo }}">Log In</a>
```

### What I've Tried

1. ✅ Added all redirect URLs to Supabase dashboard (with wildcards for Vercel)
2. ✅ Updated email template to use `{{ .RedirectTo }}`
3. ✅ Removed hardcoded URLs from code
4. ✅ Used dynamic `window.location.origin` for current environment
5. ✅ Implemented cookie-based origin storage as backup
6. ✅ Verified Supabase client configuration (PKCE flow enabled)
7. ❌ Still redirects to Site URL instead of `emailRedirectTo`/`redirectTo`

### Questions

1. **Why is `{{ .RedirectTo }}` empty/null?** It's falling back to Site URL.
2. **Does Supabase validate the `emailRedirectTo` URL before passing it to the email template?** If the URL doesn't match the allowed list, does it silently fail?
3. **Do wildcards work for localhost?** Should I use `http://localhost:3000/**` or `http://localhost:3000/auth/callback`?
4. **Is there a Supabase API call to check if a redirect URL is allowed?** To debug what Supabase considers valid.
5. **Does the order of redirect URLs matter?** Should Site URL be first in the list?
6. **Do I need to configure anything in Google OAuth Console?** Beyond the Supabase callback URL.

### Environment

- Next.js: 15.5.4 (App Router, Turbopack)
- Supabase: `@supabase/ssr` (latest)
- Browser: Chrome (localhost testing)
- Node: 20+

### Expected Behavior

**On localhost:**
- Magic link should contain: `http://localhost:3000/auth/callback?next=%2Fapp%2Fdashboard`
- After OAuth, should redirect to: `http://localhost:3000/app/dashboard`

**On Vercel preview (e.g., `https://radly-git-branch.vercel.app`):**
- Magic link should contain the preview URL
- After OAuth, should stay on preview URL

**On production (`https://radly.app`):**
- Works as expected (already does)

### Additional Context

- The Supabase project is on the free tier
- Email provider: Supabase built-in SMTP
- OAuth providers: Google, Apple (both have same issue)
- Backend is separate (FastAPI on VPS, not relevant to this issue)

## What I Need

Please provide:
1. **Root cause analysis** - Why is `redirectTo`/`emailRedirectTo` being ignored?
2. **Step-by-step fix** - Exact configuration needed in Supabase dashboard and code
3. **Verification steps** - How to test if the fix works
4. **Common mistakes** - What did I likely misconfigure?

Thank you!
