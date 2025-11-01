# Mobile Session Persistence Fix - Implementation Plan

## Problem Summary

Apple Sign-In works successfully, but the session doesn't persist in the mobile app. The logs show:
- `#_saveSession()` works ✅
- `#getSession()` returns null immediately after ❌
- Session lost on app restart ❌

**Root Cause**: Multiple Supabase client instances with separate storage contexts due to Next.js 15 App Router + HMR breaking traditional singleton patterns.

## Solution Overview

Implement a **global singleton Supabase client** using `globalThis` to survive Next.js HMR and module re-evaluation, combined with a synchronous storage bridge for Capacitor Preferences.

## Implementation Steps

### Step 1: Install Dependencies

```bash
npm install @supabase/supabase-js
# Note: Keep @supabase/ssr for web SSR, but use @supabase/supabase-js for mobile
```

### Step 2: Create Global Singleton Client

**File**: `src/lib/supabase-singleton.ts`

- Use `globalThis` to store client instance (survives HMR)
- Implement async initialization guard
- Platform-specific storage configuration
- SSR safety (prevent server-side execution)

### Step 3: Create Storage Bridge

**File**: `src/lib/capacitor-storage.ts`

- Synchronous cache for immediate access
- Async persistence to Capacitor Preferences
- Pre-load Supabase keys on initialization
- Memory cache survives app lifecycle

### Step 4: Update All Supabase Imports

Replace these patterns across the codebase:
- `getSupabaseClient()` → `getSupabaseClient()` (singleton version)
- `createBrowserClient()` → `getSupabaseClient()` (singleton version)
- Direct imports → singleton getter

**Files to update**:
- `src/lib/native-auth.ts`
- `src/lib/http.ts`
- `src/hooks/useAuthSession.ts`
- `src/components/auth-provider.tsx`
- Any component directly importing Supabase

### Step 5: App-Level Initialization

**File**: `src/providers/supabase-provider.tsx`

- Initialize singleton once at app root
- Handle loading states
- Restore session on app start
- Set up auth state listeners

### Step 6: Update Root Layout

**File**: `src/app/app/layout.tsx`

- Wrap app with SupabaseProvider
- Ensure single initialization point
- Handle SSR/client boundaries

### Step 7: Platform Detection

**File**: `src/lib/platform.ts`

- Reliable Capacitor detection
- Platform-specific client configuration
- Web vs mobile behavior separation

### Step 8: Testing & Verification

**Test scenarios**:
1. Fresh sign-in → Session persists immediately
2. Navigate to dashboard → Session accessible
3. App restart → Session restored
4. Web app → Still works normally
5. Multiple components → Same client instance

**Expected logs**:
```
🔧 Creating NEW Supabase singleton instance
📦 Storage initialized with X keys
♻️ Reusing existing Supabase client
✅ Sign-in successful: user-id
🔍 Session verification: FOUND ✅
```

## Files to Create/Modify

### New Files
- `src/lib/supabase-singleton.ts` - Global singleton client
- `src/lib/capacitor-storage.ts` - Storage bridge
- `src/providers/supabase-provider.tsx` - App-level provider
- `src/lib/platform.ts` - Platform detection

### Modified Files
- `src/lib/native-auth.ts` - Use singleton client
- `src/lib/http.ts` - Use singleton client
- `src/hooks/useAuthSession.ts` - Use singleton client
- `src/components/auth-provider.tsx` - Use singleton client
- `src/app/app/layout.tsx` - Add provider wrapper
- Any component with direct Supabase imports

## Implementation Details

### Global Singleton Pattern
```typescript
declare global {
  var __supabase_client: SupabaseClient | undefined
  var __supabase_storage_initialized: boolean | undefined
}

// Survives HMR, module re-evaluation, concurrent renders
```

### Storage Bridge Pattern
```typescript
// Synchronous interface for Supabase, async persistence for Capacitor
const cache = new Map<string, string>()
// Pre-load from Preferences → cache → synchronous access
```

### Platform-Specific Behavior
```typescript
if (Capacitor.isNativePlatform()) {
  // Use custom storage bridge
} else {
  // Use default browser storage
}
```

## Success Criteria

1. ✅ Apple Sign-In creates session in singleton client
2. ✅ Dashboard components access same client instance
3. ✅ Session persists across app restarts
4. ✅ Web app continues working normally
5. ✅ No more multiple client instances in logs
6. ✅ Proper error handling and loading states

## Risk Mitigation

### Web App Safety
- Platform detection ensures web uses default storage
- Singleton pattern doesn't affect SSR behavior
- Backward compatibility maintained

### Error Handling
- Graceful fallback if singleton fails
- Proper loading states during initialization
- Debug logging for troubleshooting

### Performance
- Async initialization doesn't block app render
- Storage cache pre-loaded for immediate access
- Minimal memory overhead

## Timeline

1. **Step 1-2**: Setup infrastructure (singleton + storage)
2. **Step 3-4**: Update all imports
3. **Step 5-6**: Provider integration
4. **Step 7-8**: Testing and verification

**Estimated time**: 30-45 minutes

## Verification Commands

```bash
# Build and test
npm run build:mobile
npx cap copy ios

# Debug logs
# Look for "♻️ Reusing existing Supabase client" messages
# Check for single instance ID in logs
```

---

**Ready to implement?** This plan addresses the root cause (multiple client instances) while ensuring mobile-only changes don't affect the web app.