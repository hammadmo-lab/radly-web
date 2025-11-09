# Radly Frontend

> Modern, responsive Next.js application for intelligent report generation with real-time processing.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.1-61dafb?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38b2ac?logo=tailwind-css)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Overview

Radly Frontend is a cutting-edge web application that enables users to generate intelligent reports, manage templates, and track processing status in real-time. The application is built with **Next.js 15**, **React 19**, and **TypeScript**, providing a type-safe, performant, and user-friendly experience across all devices.

### Key Features

- **4-Step Report Generation Flow** - Intuitive multi-step form for report creation
- **Real-Time Status Polling** - Monitor report generation with smart polling and exponential backoff
- **Responsive Web Support** - Optimized for desktop and mobile browsers; native apps live in a separate Swift project
- **Advanced Authentication** - Supabase-powered JWT authentication with OAuth (Google, Apple) and Magic Link
- **Responsive Design** - Mobile-first design with dual navigation (bottom tabs for mobile, top nav for desktop)
- **Admin Dashboard** - Comprehensive metrics, user management, and system monitoring
- **Voice Input** - Voice-to-text transcription for hands-free report generation
- **Document Formatting** - Customizable formatting profiles for generated reports
- **Subscription Management** - Multi-tier subscriptions with usage tracking and upgrade prompts
- **Offline Support** - PWA-ready with service worker for offline functionality

## Quick Start

### Prerequisites

- **Node.js** 20+ and npm 10+
- **.env.local** file with required environment variables

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd radly-frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials
```

### Development

```bash
# Start development server with Turbopack (fast rebuilds)
npm run dev

# Open http://localhost:3000 in your browser
# The app will auto-reload when you save changes
```

### Production Build

```bash
# Create optimized production build
npm run build

# Start production server
npm run start

# Or analyze bundle size before deploying
npm run analyze
```

## Environment Configuration

Create a `.env.local` file in the project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# API Configuration
NEXT_PUBLIC_API_BASE=https://edge.radly.app
NEXT_PUBLIC_RADLY_CLIENT_KEY=your_64_character_public_api_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Project Architecture

### Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with global providers
│   ├── (auth)/                  # Authentication routes
│   ├── app/                      # Protected application routes
│   │   ├── dashboard/           # Main dashboard
│   │   ├── templates/           # Template browsing
│   │   ├── generate/            # 4-step report generation
│   │   ├── reports/             # Reports list
│   │   └── settings/            # User settings
│   ├── admin/                    # Admin dashboard routes
│   ├── legal/                    # Legal pages (privacy, terms)
│   └── api/                      # API routes (health check)
├── components/                   # React components
│   ├── ui/                       # Primitive UI components (Button, Card, Input, etc.)
│   ├── features/                 # Feature-specific components
│   ├── layout/                   # Navigation and layout components
│   ├── admin/                    # Admin dashboard components
│   ├── shared/                   # Shared components (ErrorPages, EmptyState)
│   ├── auth-provider.tsx         # Authentication context provider
│   └── providers.tsx             # Global providers setup
├── lib/                          # Utility libraries
│   ├── http.ts                  # HTTP client with auth injection
│   ├── api.ts                   # API integration layer
│   ├── schemas.ts               # Zod validation schemas
│   ├── user-data.ts             # User profile management
│   ├── jobs.ts                  # Job polling logic
│   ├── platform.ts              # Cross-platform detection
│   └── [other utilities]        # Additional utilities
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts               # Authentication hook
│   ├── useSafePolling.ts        # Smart polling with backoff
│   └── [other hooks]            # Additional hooks
├── types/                        # TypeScript type definitions
│   ├── api.ts                   # API types
│   ├── subscription.ts          # Subscription types
│   └── [other types]            # Additional types
└── utils/                        # Utility functions
```

### Core Concepts

#### State Management

The application uses a **layered state management** approach:

1. **Authentication State** - React Context (`AuthProvider`)
   - Managed via `useAuth()` hook
   - Provides user session and sign-out method
   - Persisted via Supabase session cookies

2. **Server State** - TanStack React Query
   - API data fetching and caching
   - Automatic retries with exponential backoff
   - Configured stale time: 1 minute (configurable per query)

3. **Form State** - React Hook Form + Zod
   - Type-safe form validation
   - Schemas defined in `src/lib/schemas.ts`

4. **UI State** - Local `useState`
   - Modal visibility, step tracking, toggles
   - Component-level, ephemeral state

5. **Client Storage** - localStorage
   - Recent jobs, user preferences
   - Accessed via `src/lib/secure-storage.ts` (encrypted)

#### API Integration

All API calls go through the HTTP client in `src/lib/http.ts`:

```typescript
// Type-safe HTTP methods
httpGet<T>(path: string): Promise<T>
httpPost<TBody, TResp>(path: string, body: TBody): Promise<TResp>
httpPut<TBody, TResp>(path: string, body: TBody): Promise<TResp>
```

**Automatic behaviors:**
- JWT Bearer token injection from Supabase session
- `x-client-key` header for rate limiting
- `X-Request-Id` header for request tracking (UUID)
- `credentials: 'include'` for CORS
- `cache: 'no-store'` for GET requests
- Throws `ApiError` with `status` and `body` properties

#### Authentication Flow

1. User visits `/auth/signin` or clicks sign-in button
2. Supabase redirects to OAuth provider (Google, Apple) or sends magic link
3. Provider redirects back to `/auth/callback`
4. Middleware captures session and stores in cookies
5. `AuthProvider` hydrates authentication state
6. User can now access protected `/app/*` routes
7. HTTP client automatically injects Bearer token

#### Polling Strategy

The application uses intelligent polling hooks for real-time updates:

- `useSafePolling()` - Base hook with tab visibility detection and exponential backoff
- `useJobStatusPolling()` - Optimized for job status (10s base, 2min max, 2x backoff)
- `useQueueStatsPolling()` - Optimized for queue stats (15s base, 1min max, 1.5x backoff)

**Features:**
- Pauses polling when tab is hidden
- Exponential backoff on errors
- Resets backoff on successful requests
- Manual trigger, pause, resume controls
- Automatic cleanup on unmount

## Technology Stack

### Core Framework
- **Next.js 15** - React framework with App Router and Turbopack
- **React 19.1** - Latest React with hooks
- **TypeScript 5** - Strict type checking enabled

### Styling & UI
- **Tailwind CSS 4** - Utility-first CSS with variable theme system
- **Radix UI** - Headless UI primitives (Dialog, Select, Dropdown, etc.)
- **Class Variance Authority** - Type-safe component variants
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

### State Management
- **TanStack React Query** - Server state management and caching
- **React Context** - Authentication state
- **React Hook Form** - Form state and validation
- **Zod** - TypeScript-first schema validation
- **localStorage** - Client-side persistence

### Authentication & Security
- **Supabase Auth** - JWT-based authentication
- **OAuth** - Google and Apple sign-in
- **Magic Link** - Email-based authentication
- **CORS** - Cross-origin request handling
- **CSP Headers** - Content Security Policy

### Testing
- **Jest** - Unit testing framework
- **React Testing Library** - Component testing utilities
- **Playwright** - End-to-end testing (multi-browser: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari)

### Other Libraries
- **Sonner** - Toast notifications
- **React Markdown** - Report rendering
- **Chart.js** - Metrics visualization
- **Canvas Confetti** - Celebration animations
- **Date-fns** - Date manipulation

## Development Commands

### Running the Application

```bash
npm run dev              # Start dev server with Turbopack
npm run dev:clean       # Clean .next cache and start dev server
npm run build           # Production build
npm run start           # Production server
```

### Testing

```bash
# Unit Tests (Jest)
npm run test            # Run all unit tests
npm run test:watch      # Watch mode for development

# E2E Tests (Playwright)
npm run test:e2e        # Run all E2E tests
npm run test:e2e:ui     # Run with Playwright UI
npm run test:e2e:debug  # Debug mode
npm run test:e2e:headed # Run with visible browser
npm run test:e2e:report # Show HTML report
```

### Code Quality

```bash
npm run lint            # Run ESLint
npm run analyze         # Analyze both bundles
npm run analyze:browser # Client bundle only
npm run analyze:server  # Server bundle only
```

## Routing

### Public Routes
- `/` - Landing page
- `/pricing` - Pricing plans
- `/privacy` - Privacy policy
- `/legal/terms` - Terms of service
- `/security` - Security information
- `/auth/signin` - Sign-in page
- `/auth/callback` - OAuth callback

### Protected Routes (`/app/*`)
Require authentication, protected via middleware:

- `/app/dashboard` - Main dashboard
- `/app/templates` - Template browsing and selection
- `/app/generate` - 4-step report generation form
- `/app/reports` - Reports list with polling
- `/app/report/[id]` - Single report view
- `/app/settings` - User preferences

### Admin Routes (`/admin/*`)
Require admin authentication:

- `/admin` - Admin dashboard
- `/admin/login` - Admin sign-in
- `/admin/metrics` - Comprehensive metrics and monitoring
- `/admin/users` - User management
- `/admin/users/[userId]/[email]` - User details

## Responsive Design

The application follows a **mobile-first responsive design** approach:

### Breakpoints
- **Mobile**: 320px - 639px (no prefix)
- **Small**: 640px+ (`sm:`)
- **Medium**: 768px+ (`md:`)
- **Large**: 1024px+ (`lg:`)
- **XL**: 1280px+ (`xl:`)

### Navigation
- **Mobile** (below `md:`): Hamburger menu + fixed bottom tab bar
- **Desktop** (`md:` and up): Top navigation bar with horizontal menu

### Layout Considerations
- **App Layout**: `px-4 sm:px-6 py-8 sm:py-12 pb-24 md:pb-12`
  - Extra bottom padding on mobile (`pb-24`) for bottom navigation
  - Reduces to `pb-12` on desktop
- **Touch Targets**: Minimum 44px for iOS/Android accessibility
- **Overflow Handling**: Tables wrapped in `overflow-x-auto` containers

### Testing Responsive Design

```bash
npm run dev

# Open http://localhost:3000
# Chrome DevTools → Device Toolbar (Cmd+Shift+M or F12)

# Test these viewports:
# - iPhone SE (375px) - smallest mobile
# - iPhone 14 Pro (390px) - modern mobile
# - iPad (768px) - tablet breakpoint
# - Laptop (1024px+) - desktop
```

## Performance Optimizations

### Code Splitting
- Dynamic imports for admin sections
- React.lazy() for heavy components
- Package import optimization in `next.config.ts`

### Image Optimization
- Next.js `<Image>` component for automatic optimization
- Automatic AVIF/WebP format selection
- Configured S3 image domains

### Caching Strategy
- React Query stale times: 1 minute (configurable)
- localStorage for client-side caching
- Service worker for offline support

### Polling Efficiency
- Tab visibility detection pauses polling when tab is hidden
- Exponential backoff prevents server overload
- Manual control over polling behavior

## Security Considerations

### Authentication
- JWT Bearer tokens from Supabase
- Secure PKCE OAuth flow
- Session stored in HTTP-only cookies

### API Security
- `x-client-key` header for rate limiting
- Request ID tracking (UUID) for all requests
- Automatic error handling for 401/403/404

### Content Security
- Strict Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options to prevent clickjacking
- Input sanitization via `src/lib/sanitization.ts`

### Data Security
- Encrypted localStorage for sensitive data via `src/lib/secure-storage.ts`
- Secure request signing via `src/lib/request-signing.ts`
- Security monitoring and event tracking

## Admin Dashboard

The admin dashboard provides comprehensive system monitoring:

### Features
- **Metrics** - Token usage, API timing, queue statistics
- **User Management** - User list with detailed profiles
- **System Monitoring** - Connection status, uptime tracking
- **Performance Charts** - Response times, success rates, throughput

### Accessing Admin Dashboard
1. Navigate to `/admin/login`
2. Enter your admin API key
3. Access to `/admin/metrics`, `/admin/users`, etc.

**Note:** Admin authentication uses API keys, separate from user authentication.

## Platform Support

This repository now targets the web experience exclusively:

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive layouts that adapt to tablets and phones
- Stripe-based subscription management for billing

The legacy Capacitor wrappers have been removed. Native mobile clients are being rebuilt in a dedicated Swift repository to keep concerns separated.

## Contributing

### Code Style
- **TypeScript** - Strict mode enabled
- **Linting** - ESLint configured
- **Formatting** - Prettier via Turbopack
- **Components** - Follow Radix UI + Tailwind patterns

### Testing Requirements
Before submitting changes:
```bash
npm run lint      # No linting errors
npm run test      # Unit tests pass
npm run test:e2e  # E2E tests pass
npm run build     # Production build succeeds
```

### Creating Components
1. **UI Components** (`src/components/ui/`)
   - Primitive, reusable components
   - Use Radix UI + Tailwind + CVA for variants

2. **Feature Components** (`src/components/features/`)
   - Domain-specific logic
   - Import UI components

3. **Page Components** (`src/app/**/page.tsx`)
   - Server Components by default
   - Add "use client" for interactivity

### Creating API Calls
1. Define types in `src/types/api.ts`
2. Use `httpGet/Post/Put` from `src/lib/http.ts`
3. Wrap in React Query hook for caching
4. Handle errors in query error callback

### Adding Forms
1. Define Zod schema in `src/lib/schemas.ts`
2. Use React Hook Form with `zodResolver`
3. Build UI with `src/components/ui/` components
4. Submit via `httpPost` with type-safe payload

## Troubleshooting

### Common Issues

#### "Cannot connect to backend"
1. Check `NEXT_PUBLIC_API_BASE` in `.env.local`
2. Verify backend is running: `curl http://localhost/health`
3. Check CORS headers in backend configuration
4. Check browser console for CORS errors

#### "Authentication keeps failing"
1. Verify Supabase URLs match in `.env.local`
2. Check JWT hasn't expired
3. Clear localStorage and re-login
4. Check browser console for auth errors

#### "Horizontal scroll on mobile"
1. Check for fixed widths without `max-w-full`
2. Look for tables without `overflow-x-auto` wrapper
3. Use DevTools device toolbar to debug
4. Apply responsive classes: `w-full max-w-[value]`

#### "Tests failing"
1. Verify backend is running for E2E tests
2. Check test mode is enabled: `NEXT_PUBLIC_TEST_MODE=true`
3. Clear `node_modules` and reinstall: `npm install`
4. Check for TypeScript errors: `npx tsc --noEmit`

## Deployment

### Vercel Deployment

The frontend is configured for deployment on Vercel:

```bash
# Automatic deployment on push to main branch
git push origin main

# Environment variables are set in Vercel dashboard
# No additional configuration needed
```

### Pre-Deployment Checklist

```bash
npm run lint        # ✓ No lint errors
npm run test        # ✓ All unit tests pass
npm run test:e2e    # ✓ All E2E tests pass
npm run build       # ✓ Production build succeeds
```

### Environment Variables for Production

Set these in your Vercel dashboard:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_API_BASE
NEXT_PUBLIC_RADLY_CLIENT_KEY
NEXT_PUBLIC_SITE_URL
```

## Documentation

### Reference Files
- **CLAUDE.md** - Development guidelines and architecture decisions
- **CHANGELOG.md** - Version history and feature updates
- **docs/frontend-performance.md** - Performance optimization guide
- **docs/frontend-security.md** - Security best practices

## Support

For questions or issues:
1. Check existing GitHub issues
2. Review documentation in `CLAUDE.md`
3. Check troubleshooting section above
4. Create a new GitHub issue with details

## License

This project is private and proprietary to Radly Inc. All rights reserved.

---

**Last Updated:** October 2025
**Maintainers:** Radly Engineering Team
