# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

This application uses a **layered state management** approach:

1. **Authentication State** - React Context (`AuthProvider`)
   - User session, auth status, signOut method
   - Access via `useAuth()` hook
   - Located in `src/components/auth-provider.tsx`

2. **Server State** - TanStack React Query
   - API data fetching, caching, and synchronization
   - Automatic retries with exponential backoff
   - Standard stale time: 5-10 minutes
   - Retry logic ignores 401/403/404 errors (do not retry)

3. **Form State** - React Hook Form + Zod
   - Form values and validation
   - Schemas defined in `src/lib/schemas.ts`

4. **UI State** - Local `useState`
   - Modal visibility, step tracking, toggles
   - Keep ephemeral and co-located with components

5. **Client Storage** - localStorage
   - Recent jobs, user preferences
   - User-specific keys to avoid collisions

### API Integration Pattern

**Core HTTP client**: `src/lib/http.ts`

All API calls go through three type-safe functions:
```typescript
httpGet<T>(path: string): Promise<T>
httpPost<TBody, TResp>(path: string, body: TBody): Promise<TResp>
httpPut<TBody, TResp>(path: string, body: TBody): Promise<TResp>
```

**Key behaviors**:
- Automatically injects Bearer token from Supabase session
- Adds `x-client-key` header for rate limiting
- Adds `X-Request-Id` (UUID) for request tracking
- Sets `credentials: 'include'` for CORS
- Sets `cache: 'no-store'` for GET requests
- Throws `ApiError` with `status` and `body` properties

**Environment variables**:
- `NEXT_PUBLIC_API_BASE` - Backend API URL (default: `https://edge.radly.app`)
- `NEXT_PUBLIC_RADLY_CLIENT_KEY` - 64-char public API key

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

**Creating a new API endpoint call**:
1. Add types to `src/types/api.ts`
2. Use `httpGet/Post/Put` from `src/lib/http.ts`
3. Wrap in React Query hook for caching
4. Handle errors in query error callback

**Adding a new form**:
1. Define Zod schema in `src/lib/schemas.ts`
2. Use React Hook Form with `zodResolver`
3. Build UI with `src/components/ui/` components
4. Submit via `httpPost` with type-safe payload

**Adding a new page**:
1. Create route in `src/app/` directory
2. Use Server Components by default
3. Add "use client" for interactivity
4. Protect with middleware if needed

**Working with admin features**:
1. Use `AdminAuthProvider` and `useAdminAuth()`
2. Admin API calls in `src/lib/admin-api.ts`
3. Admin types in `src/types/admin.ts`
4. Admin routes require authentication check

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
