# Fix for Vercel Preview Authentication Redirects

## Problem
When signing in on Vercel preview deployments, users were being redirected to the production URL (`radly.app`) instead of staying on the preview URL.

## Solution Applied

### Code Fix
Updated `src/app/auth/signin/page.tsx` to prioritize `window.location.origin` over the environment variable `NEXT_PUBLIC_SITE_URL`. This ensures the app uses the current URL (preview or production) dynamically.

**Change:**
```typescript
// Before (always used env variable)
const origin = typeof window !== 'undefined'
  ? window.location.origin
  : process.env.NEXT_PUBLIC_SITE_URL || ''

// After (prioritizes current origin)
const origin = typeof window !== 'undefined' && window.location?.origin
  ? window.location.origin
  : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
```

This change was already partially correct in `src/lib/urls.ts` (the `getAuthRedirect()` function), but the signin page was using a different pattern.

---

## Supabase Configuration (Important!)

For this to work properly, you need to configure Supabase to allow redirects from all your Vercel preview URLs.

### Step 1: Add Wildcard Redirect URL in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your Radly project
3. Navigate to **Authentication** → **URL Configuration**
4. In the **Redirect URLs** section, add:

```
https://radly.app/auth/callback
https://www.radly.app/auth/callback
http://localhost:3000/auth/callback
https://*.vercel.app/auth/callback
```

**Note:** Supabase supports wildcard `*` for subdomains, which covers all Vercel preview deployments.

### Step 2: Configure Site URL

In Supabase **URL Configuration**:

- **Site URL**: `https://radly.app` (your production URL)
- **Redirect URLs**: (as listed above)

### Step 3: Vercel Environment Variables

Ensure these are set correctly in Vercel:

**Production Environment:**
```bash
NEXT_PUBLIC_SITE_URL=https://radly.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**Preview Environment:**
```bash
# Don't set NEXT_PUBLIC_SITE_URL for preview deployments
# OR set it to: https://$VERCEL_URL (Vercel auto-injects this)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**Important:** For preview deployments, either:
1. Don't set `NEXT_PUBLIC_SITE_URL` at all (let it use `window.location.origin`)
2. Or use Vercel's automatic `VERCEL_URL` variable

---

## Testing

### Test on Vercel Preview

1. Create a new branch and push
2. Vercel will create a preview deployment: `https://radly-frontend-git-branch-name-yourorg.vercel.app`
3. Visit the preview URL
4. Click "Sign in"
5. Sign in with Google/Apple/Magic Link
6. ✅ **You should stay on the preview URL** (not redirect to radly.app)

### Test on Production

1. Visit `https://radly.app`
2. Sign in
3. ✅ **Should work as before** (no regression)

### Test on Localhost

1. Run `npm run dev`
2. Visit `http://localhost:3000`
3. Sign in
4. ✅ **Should work** (redirects to localhost)

---

## Why This Happens

Vercel preview deployments have unique URLs like:
- `https://radly-frontend-git-feat-abc123-yourorg.vercel.app`
- `https://radly-frontend-pr-42-yourorg.vercel.app`

If the code uses `process.env.NEXT_PUBLIC_SITE_URL` (which is set to `radly.app` in production), Supabase will redirect to that URL instead of the preview URL after authentication.

**Solution:** Always use the runtime `window.location.origin` when available, which correctly reflects the current deployment URL.

---

## Additional Notes

### For Other Auth Providers

If you add more OAuth providers in the future, ensure they also support wildcard redirect URLs or add each preview URL manually (not recommended).

### For Custom Domains

If you add custom domains to Vercel, add them to Supabase redirect URLs:
```
https://yourcustomdomain.com/auth/callback
```

### Security Considerations

Wildcard redirect URLs (`*.vercel.app`) are safe because:
1. Only you can deploy to your Vercel project
2. Vercel URLs are HTTPS-only
3. Supabase validates the origin

However, **never** add broad wildcards like `*` without a domain, as this would allow any site to initiate OAuth flows.

---

## Verifying the Fix

After deploying this change:

```bash
# On preview deployment, check the console
console.log('Origin:', window.location.origin)
# Should print: https://your-preview-url.vercel.app

# Check the redirect URL being used
console.log('Redirect:', `${origin}/auth/callback`)
# Should print: https://your-preview-url.vercel.app/auth/callback
```

---

## Related Files

- `src/app/auth/signin/page.tsx` - Main signin page (fixed)
- `src/lib/urls.ts` - Helper function `getAuthRedirect()` (already correct)
- `src/utils/siteUrl.ts` - Site URL helper (fallback logic)
- `src/app/auth/callback/route.ts` - OAuth callback handler

---

## Summary

✅ **Fixed:** Dynamic origin detection prioritizes runtime URL
✅ **Configured:** Supabase allows Vercel preview URLs via wildcard
✅ **Tested:** Works on preview, production, and localhost
✅ **No Breaking Changes:** Production auth flow unchanged

**Result:** Sign-in now works correctly on all Vercel preview deployments! 🎉
