# CLAUDE.md

This file provides comprehensive guidance to Claude Code (claude.ai/code) and other AI-assisted development tools when working with code in this repository.

## Purpose

This document serves as a reference for:
- **AI Assistants** - Understanding the codebase structure, patterns, and conventions
- **Developers** - Quick reference for common development tasks and architectural decisions
- **Code Review** - Ensuring consistency with established patterns and best practices

## Development Commands

### Running the Application
```bash
npm run dev              # Start dev server with Turbopack (default)
npm run dev:clean        # Clean .next and start dev server (for build issues)
npm run build            # Production build with Turbopack
npm run start            # Start production server
```

### Testing
```bash
# Unit Tests (Jest)
npm run test             # Run all unit tests
npm run test:watch       # Run tests in watch mode

# E2E Tests (Playwright)
npm run test:e2e         # Run all E2E tests (starts dev server automatically)
npm run test:e2e:ui      # Run with Playwright UI
npm run test:e2e:debug   # Run in debug mode
npm run test:e2e:headed  # Run with visible browser
npm run test:e2e:report  # Show HTML test report
```

### Code Quality
```bash
npm run lint             # Run ESLint
```

### Bundle Analysis
```bash
npm run analyze          # Analyze both client and server bundles
npm run analyze:browser  # Analyze client bundle only
npm run analyze:server   # Analyze server bundle only
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router (Turbopack-enabled)
- **React**: 19.1.0 with latest hooks
- **TypeScript**: Strict mode enabled
- **UI**: Tailwind CSS 4 + Radix UI primitives + Framer Motion
- **State**: TanStack React Query (server state) + React Context (auth)
- **Forms**: React Hook Form + Zod validation
- **Auth**: Supabase (JWT-based with PKCE flow)
- **Testing**: Jest (unit) + Playwright (E2E, multi-browser)

### State Management Philosophy

This application uses a **layered state management** approach to separate concerns and optimize performance:

1. **Authentication State** - React Context (`AuthProvider`)
   - Manages user session, authentication status, and sign-out functionality
   - Access via `useAuth()` hook
   - Implementation: `src/components/auth-provider.tsx`
   - Session persisted in HTTP-only cookies via Supabase

2. **Server State** - TanStack React Query
   - Handles API data fetching, caching, and synchronization
   - Automatic retries with exponential backoff for failed requests
   - Standard stale time: 5-10 minutes (configurable per query)
   - Retry logic **does not retry** 401/403/404 errors (auth failures, forbidden access, not found)
   - Query invalidation on user actions (create, update, delete)

3. **Form State** - React Hook Form + Zod
   - Type-safe form validation with runtime schema checking
   - All validation schemas centralized in `src/lib/schemas.ts`
   - Validation modes: `onSubmit` (default) or `onChange` (for immediate feedback)

4. **UI State** - Local `useState` and `useReducer`
   - Component-level ephemeral state: modal visibility, step tracking, toggles, loading states
   - Keep state co-located with components
   - Do not persist to storage

5. **Client Storage** - localStorage
   - Non-sensitive data only: recent jobs, user preferences, UI settings
   - User-specific keys to avoid collisions (e.g., `user_${userId}_preferences`)
   - **Never store PHI** (Protected Health Information) or authentication tokens
   - Access via `src/lib/secure-storage.ts` for type-safe operations

### API Integration Pattern

**Core HTTP client**: `src/lib/http.ts`

All API calls flow through a centralized HTTP client with three type-safe methods:

```typescript
httpGet<T>(path: string): Promise<T>
httpPost<TBody, TResp>(path: string, body: TBody): Promise<TResp>
httpPut<TBody, TResp>(path: string, body: TBody): Promise<TResp>
```

**Automatic behaviors** (handled by HTTP client):
- **JWT Bearer token injection** - Retrieves and injects the current Supabase session token
- **Rate limiting header** - Adds `x-client-key` header for API rate limiting
- **Request tracking** - Generates and includes `X-Request-Id` header (UUID) for distributed tracing
- **CORS credentials** - Sets `credentials: 'include'` for cross-origin requests
- **Cache control** - Applies `cache: 'no-store'` to all GET requests to prevent stale data
- **Timeout handling** - All requests timeout after 30 seconds to prevent infinite loading states
- **Error handling** - Throws typed `ApiError` instances with `status` and `body` properties

**Required environment variables**:
- `NEXT_PUBLIC_API_BASE` - Backend API URL (production: `https://edge.radly.app`)
- `NEXT_PUBLIC_RADLY_CLIENT_KEY` - 64-character public API key for rate limiting
- Configuration validated at build time to prevent runtime errors

### Polling Strategy

**Use the polling hooks** in `src/hooks/useSafePolling.ts`:

- `useSafePolling()` - Base hook with customizable options
- `useJobStatusPolling()` - Optimized for `/v1/jobs/:id` (10s base, 2 min max, 2.0x backoff)
- `useQueueStatsPolling()` - Optimized for `/v1/queue/stats` (15s base, 1 min max, 1.5x backoff)

**Features**:
- Tab visibility detection (pauses when tab hidden)
- Exponential backoff on errors
- Reset backoff on successful requests
- Manual trigger, pause, resume controls
- Cleanup on unmount

**When to use**: Any API endpoint that requires repeated polling (job status, queue stats, real-time updates)

### Authentication Flow

1. **Supabase Auth** with JWT Bearer tokens
2. **Session hydration** handled by `AuthProvider` on mount
3. **Token extraction** via `getAuthToken()` in `src/lib/http.ts`
4. **401 handling**: Not in HTTP client - handle in React Query error callbacks
5. **Sign out**: Use `useAuth().signOut()` method

**Admin authentication** is separate:
- `AdminAuthProvider` in `src/components/admin/AdminAuthProvider.tsx`
- Uses API keys stored in localStorage
- Access via `useAdminAuth()` hook

### Form Validation Pattern

All forms follow this pattern:

1. Define Zod schema in `src/lib/schemas.ts`
2. Use `useForm()` with `zodResolver()`
3. Type-safe form values inferred from schema
4. Validation on submit (mode: 'onSubmit') or change (mode: 'onChange')

Example:
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { generateReportSchema } from '@/lib/schemas'

const form = useForm({
  resolver: zodResolver(generateReportSchema),
  defaultValues: { /* ... */ }
})
```

### Component Architecture

**Layered component structure**:

1. **UI Components** (`src/components/ui/`)
   - Primitive, reusable components (Button, Card, Input, etc.)
   - Built on Radix UI with Tailwind styling
   - Use Class Variance Authority (CVA) for variants

2. **Feature Components** (`src/components/features/`)
   - Domain-specific components (templates, generate, forms)
   - Encapsulate feature-level logic

3. **Shared Components** (`src/components/shared/`)
   - Cross-cutting concerns (ErrorPages, EmptyState)

4. **Admin Components** (`src/components/admin/`)
   - Admin dashboard, metrics, user management

5. **Layout Components** (`src/components/layout/`)
   - Navigation (Desktop, Mobile, Bottom)

### Responsive Design Patterns

**Mobile-First Approach**:
- Start with mobile layout (320px+), progressively enhance for larger screens
- Use Tailwind responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`
- Stack elements vertically on mobile, horizontal on desktop

**Navigation Patterns**:
- **Desktop** (`md:` and up): Top navbar with horizontal navigation (`<DesktopNav>`)
  - Located in header, sticky positioning
  - User menu with dropdown
  - "New Report" CTA button
- **Mobile** (below `md:`): Dual navigation system
  - `<MobileNav>`: Hamburger menu (slide-in from left)
  - `<BottomNav>`: Fixed bottom tab bar for primary navigation
  - Location: `src/components/layout/Navigation.tsx`

**Layout Considerations**:
- **App Layout** (`src/app/app/layout.tsx`):
  - Padding: `px-4 sm:px-6 py-8 sm:py-12 pb-24 md:pb-12`
  - Extra bottom padding on mobile (`pb-24`) accounts for bottom navigation bar
  - Reduces to `pb-12` on desktop when bottom nav is hidden
- **Page Containers**:
  - Max width: `max-w-5xl` or `max-w-6xl` for content
  - Responsive padding: `px-4 sm:px-6 lg:px-8`

**Grid Layouts**:
- Stats/Cards: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- Forms: `grid-cols-1 md:grid-cols-2` (stack on mobile)
- Template cards: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

**Touch Interactions**:
- Minimum touch target: `44px` (iOS Human Interface Guidelines)
- Apply to all interactive elements: buttons, links, form controls
- Classes: `touch-manipulation`, `min-h-[44px]`, `min-w-[44px]`
- Use `touch-target` class for consistent sizing

**Common Pitfalls to Avoid**:
- ❌ Fixed widths without `max-w-full`: `w-[500px]` → ✅ `w-full max-w-[500px]`
- ❌ Missing overflow handling on tables: ✅ Wrap in `<div className="overflow-x-auto">`
- ❌ Non-responsive text: `text-lg` → ✅ `text-sm sm:text-base lg:text-lg`
- ❌ Fixed padding: `p-6` → ✅ `p-4 sm:p-6 lg:p-8`
- ❌ Forgetting mobile bottom nav space: ✅ Add `pb-24 md:pb-12` to page content

**Debugging Horizontal Scroll**:
```bash
# Find elements with fixed widths
grep -r "min-w-\[" src/components/
grep -r 'className=".*w-\[' src/

# Check for overflow issues
# Open DevTools → Elements → Look for elements wider than viewport
# Add temporary border: * { outline: 1px solid red; }
```

**Testing Checklist**:
- [ ] iPhone SE (375px) - Smallest common mobile viewport
- [ ] iPhone Pro (390px) - Modern iPhone
- [ ] iPad (768px) - Tablet breakpoint
- [ ] Desktop (1280px+) - Large screen

### Routing Structure

**Protected routes** (`/app/*`) require authentication:
- `/app/dashboard` - Main dashboard
- `/app/templates` - Template browsing
- `/app/generate` - Report generation flow (4 steps)
- `/app/reports` - Reports list with polling
- `/app/settings` - User preferences

**Admin routes** (`/admin/*`) require admin auth:
- `/admin` - Admin dashboard
- `/admin/metrics` - Comprehensive metrics
- `/admin/users/[userId]` - User detail

**Public routes**:
- `/` - Landing page
- `/pricing` - Pricing plans
- `/auth/signin` - Sign-in page
- `/auth/callback` - OAuth callback

### Testing Patterns

**Unit tests** (Jest + Testing Library):
- Location: Co-located in `__tests__` directories
- Path alias: `@/*` maps to `src/*`
- Run single test: `npm run test -- path/to/test.test.ts`
- Watch mode: `npm run test:watch`

**E2E tests** (Playwright):
- Location: `/e2e` directory
- Test mode: Sets `NEXT_PUBLIC_TEST_MODE=true` and `NEXT_PUBLIC_BYPASS_AUTH=true`
- Global setup: `/e2e/global-setup.ts`
- Multi-browser: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- Run single test: `npm run test:e2e -- tests/example.spec.ts`

### Performance Optimizations

**Code splitting**:
- Dynamic imports for admin sections
- React.lazy() for heavy components
- Package import optimization in `next.config.ts`

**Image optimization**:
- Use Next.js `<Image>` component
- Automatic AVIF/WebP format selection
- Configured domains: `s3.radly.app`

**Caching strategy**:
- React Query stale times: 5-10 minutes
- localStorage for client-side caching
- Service worker support (PWA ready)

**Polling efficiency**:
- Use `useSafePolling` hooks
- Tab visibility detection
- Exponential backoff

### Security Considerations

**Headers** (configured in `next.config.ts`):
- Strict CSP, HSTS, X-Frame-Options
- Connects to: `NEXT_PUBLIC_API_BASE`, `*.supabase.co`

**Authentication**:
- JWT Bearer tokens
- Client key in headers (`x-client-key`)
- Request ID tracking (UUID)

**Validation**:
- Zod schemas for all user input
- Server-side validation via API
- Input sanitization utilities in `src/lib/sanitization.ts`

### Environment Variables

Required:
```bash
NEXT_PUBLIC_SUPABASE_URL=         # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Supabase anon key
NEXT_PUBLIC_API_BASE=             # Backend API URL
NEXT_PUBLIC_RADLY_CLIENT_KEY=     # 64-char public key
NEXT_PUBLIC_SITE_URL=             # Site URL for redirects
```

### Key Files Reference

| File | Purpose |
|------|---------|
| `src/lib/http.ts` | HTTP client with auth token injection |
| `src/lib/jobs.ts` | Job queue and polling logic |
| `src/lib/schemas.ts` | Zod validation schemas |
| `src/lib/user-data.ts` | User profile management |
| `src/hooks/useSafePolling.ts` | Polling hooks with backoff |
| `src/components/auth-provider.tsx` | Authentication context |
| `src/components/providers.tsx` | Global providers setup |
| `src/app/app/generate/page.tsx` | Report generation flow |
| `next.config.ts` | Next.js configuration |
| `tailwind.config.ts` | Tailwind design system |

### Common Patterns

#### Creating a New API Endpoint Call

Follow this pattern for all API integrations:

1. **Define types** in `src/types/api.ts`:
   ```typescript
   export interface UserProfile {
     id: string
     name: string
     email: string
   }
   ```

2. **Create API function** using HTTP client from `src/lib/http.ts`:
   ```typescript
   import { httpGet, httpPost } from '@/lib/http'

   export async function getUserProfile(): Promise<UserProfile> {
     return httpGet<UserProfile>('/v1/users/profile')
   }
   ```

3. **Wrap in React Query hook** for caching and state management:
   ```typescript
   import { useQuery } from '@tanstack/react-query'

   export function useUserProfile() {
     return useQuery({
       queryKey: ['user', 'profile'],
       queryFn: getUserProfile,
       staleTime: 5 * 60 * 1000, // 5 minutes
     })
   }
   ```

4. **Handle errors** in component:
   ```typescript
   const { data, error, isLoading } = useUserProfile()

   if (error) {
     return <ErrorMessage error={error} />
   }
   ```

#### Adding a New Form

1. **Define Zod schema** in `src/lib/schemas.ts`:
   ```typescript
   export const userProfileSchema = z.object({
     name: z.string().min(2, "Name must be at least 2 characters"),
     email: z.string().email("Invalid email address"),
   })

   export type UserProfileFormData = z.infer<typeof userProfileSchema>
   ```

2. **Use React Hook Form** with `zodResolver`:
   ```typescript
   import { useForm } from 'react-hook-form'
   import { zodResolver } from '@hookform/resolvers/zod'

   const form = useForm<UserProfileFormData>({
     resolver: zodResolver(userProfileSchema),
     defaultValues: { name: '', email: '' },
   })
   ```

3. **Build UI** with components from `src/components/ui/`:
   ```typescript
   <form onSubmit={form.handleSubmit(onSubmit)}>
     <Input {...form.register('name')} />
     <Input {...form.register('email')} type="email" />
     <Button type="submit">Save</Button>
   </form>
   ```

4. **Submit via HTTP client** with type-safe payload:
   ```typescript
   const onSubmit = async (data: UserProfileFormData) => {
     await httpPost('/v1/users/profile', data)
   }
   ```

#### Adding a New Page

1. **Create route** in `src/app/` directory following Next.js App Router conventions
2. **Use Server Components by default** for better performance
3. **Add `"use client"` directive** only when you need client-side interactivity
4. **Protect with middleware** if needed (middleware.ts handles `/app/*` routes)

**Example:**
```typescript
// src/app/app/new-feature/page.tsx
export default function NewFeaturePage() {
  // Server Component by default
  return <div>Server-rendered content</div>
}
```

#### Working with Admin Features

1. **Use `AdminAuthProvider`** and `useAdminAuth()` hook for authentication
2. **Admin API calls** go in `src/lib/admin-api.ts`
3. **Admin types** defined in `src/types/admin.ts`
4. **Admin routes** (`/admin/*`) require admin authentication (API key in localStorage)

**Example:**
```typescript
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'

export function AdminComponent() {
  const { isAuthenticated, apiKey } = useAdminAuth()

  if (!isAuthenticated) {
    return <AdminLogin />
  }

  // Admin content
}

### Docker Deployment

Build configured with:
- Standalone output mode
- Multi-stage Dockerfile in root
- `docker-compose.yml` for orchestration
- Environment variables via `.env` file

### Recent Architectural Changes

- **Safe Polling Hook** (`fa76479`): Reduced Worker requests with tab visibility detection and exponential backoff
- **SSR Hydration Fixes** (`aa49dd0`): Prevented logout on refresh with proper session initialization
- **404 Error Handling** (`6a38e8f`): Improved error responses for missing API endpoints
- **Admin Metrics** (`ff7758d`): Comprehensive dashboard with token usage, timing, queue stats

### Migration Notes

**Node.js requirement**: 20+ (specified in `package.json` engines)

**Package manager**: npm 10+

**React 19 overrides**: Chart.js dependencies have React overrides in `package.json` to ensure compatibility

## Troubleshooting Responsive Issues

### Horizontal Scroll Problems

**Identifying the culprit**:
```bash
# 1. Find fixed widths that may overflow
grep -r "min-w-\[" src/ | grep -v node_modules

# 2. Check for tables without overflow handling
grep -r "<table" src/ -A 5 | grep -v "overflow-x"

# 3. Look for wide content in admin pages
grep -r "w-\[" src/components/admin/
```

**Quick fixes**:
- Add `overflow-x-auto` to parent container
- Replace fixed widths with responsive ones: `w-[600px]` → `w-full max-w-[600px]`
- Use responsive display: `hidden md:block` to hide wide content on mobile

### Common Mobile Layout Fixes

**Problem**: Bottom nav overlaps content
```tsx
// ❌ Bad - content cut off
<div className="pb-8">Content</div>

// ✅ Good - accounts for bottom nav
<div className="pb-24 md:pb-8">Content</div>
```

**Problem**: Touch targets too small
```tsx
// ❌ Bad - hard to tap on mobile
<button className="p-1">Click</button>

// ✅ Good - accessible touch target
<button className="p-3 min-h-[44px] touch-manipulation">Click</button>
```

**Problem**: Form inputs stack awkwardly
```tsx
// ❌ Bad - always side-by-side
<div className="grid grid-cols-2 gap-4">

// ✅ Good - stack on mobile
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
```

**Problem**: Text overflows container
```tsx
// ❌ Bad - text can overflow
<p className="text-lg">{longText}</p>

// ✅ Good - responsive text with overflow handling
<p className="text-sm sm:text-base lg:text-lg break-words">{longText}</p>
```

### Testing Workflow

```bash
# 1. Start dev server
npm run dev

# 2. Open in browser with DevTools
open http://localhost:3000

# 3. Toggle device toolbar (Cmd+Shift+M)

# 4. Test these viewports in order:
# - iPhone SE (375px width) - smallest
# - iPhone 14 Pro (390px)
# - iPad (768px) - tablet breakpoint
# - Laptop (1024px) - desktop breakpoint
# - Desktop (1280px+)

# 5. Check for:
# - No horizontal scrollbar at any viewport
# - All buttons are tappable (44px min)
# - Text is readable (not too small)
# - Forms are usable
# - Navigation works correctly
```

### Admin Dashboard Specifics

Admin pages often have complex tables and metrics. Common issues:

**Wide tables**: Use the `<SubscriptionTable>` component which handles overflow automatically

**Metrics cards**: Use responsive grid
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
```

**Charts**: Wrap in containers with `overflow-x-auto` and use `<MobileChart>` for mobile-optimized views
