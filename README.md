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
- **Inline Report Editing** - Edit Findings, Impression, and Recommendations before exporting with auto-save
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

- **Node.js** 20 or higher
- **npm** 10 or higher
- **Git** for version control
- Access to required environment variables (Supabase credentials, API keys)

### Installation

Follow these steps to set up the project locally:

```bash
# 1. Clone the repository
git clone <repository-url>
cd radly-web

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local

# 4. Edit .env.local with your credentials
# See "Environment Configuration" section below for required variables
```

### Development

Start the development server:

```bash
# Start development server with Turbopack (recommended - faster rebuilds)
npm run dev

# Alternative: Clean cache and start fresh (useful for build issues)
npm run dev:clean
```

The application will be available at **http://localhost:3000**. The page automatically reloads when you save changes.

### Production Build

Build and run the production version:

```bash
# Create optimized production build
npm run build

# Start production server
npm run start

# Optional: Analyze bundle size before deploying
npm run analyze
```

## Environment Configuration

Create a `.env.local` file in the project root with the following variables:

```env
# Supabase Configuration (Authentication)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...  # Supabase anonymous key from dashboard

# Backend API Configuration
NEXT_PUBLIC_API_BASE=https://edge.radly.app  # Production API endpoint
NEXT_PUBLIC_RADLY_CLIENT_KEY=your_64_character_public_api_key  # API rate limiting key

# Application Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Use https://your-domain.com in production
```

**Important Notes:**
- All variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Never commit `.env.local` to version control
- Use `.env.example` as a template for required variables
- For production deployments, set these variables in your hosting platform (e.g., Vercel dashboard)

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

The application uses a **layered state management** approach to separate concerns and optimize performance:

1. **Authentication State** - React Context (`AuthProvider`)
   - Managed through the `useAuth()` hook
   - Provides user session, authentication status, and sign-out functionality
   - Session persisted securely via Supabase HTTP-only cookies

2. **Server State** - TanStack React Query
   - Handles all API data fetching, caching, and synchronization
   - Automatic retries with exponential backoff for failed requests
   - Default stale time: 1 minute (configurable per query)
   - Retry logic skips 401/403/404 errors (do not retry auth failures or not-found resources)

3. **Form State** - React Hook Form + Zod
   - Type-safe form validation with runtime schema checking
   - All validation schemas defined in `src/lib/schemas.ts`
   - Automatic error messaging and field-level validation

4. **UI State** - Local `useState` and `useReducer`
   - Modal visibility, step tracking, toggles, and other transient UI states
   - Component-level ephemeral state (not persisted)

5. **Client Storage** - localStorage
   - Non-sensitive data only: recent jobs, user preferences, UI settings
   - Accessed via `src/lib/secure-storage.ts` (provides encryption utilities)
   - **Never** stores Protected Health Information (PHI) or authentication tokens

#### API Integration

All API calls flow through a centralized HTTP client located in `src/lib/http.ts`. This client provides three type-safe methods:

```typescript
// Type-safe HTTP methods with automatic error handling
httpGet<T>(path: string): Promise<T>
httpPost<TBody, TResp>(path: string, body: TBody): Promise<TResp>
httpPut<TBody, TResp>(path: string, body: TBody): Promise<TResp>
```

**The HTTP client automatically handles:**
- **JWT Bearer token injection** - Retrieves and injects the current Supabase session token
- **Rate limiting header** - Adds `x-client-key` header for API rate limiting
- **Request tracking** - Generates and includes `X-Request-Id` header (UUID) for distributed tracing
- **CORS credentials** - Sets `credentials: 'include'` for cross-origin requests
- **Cache control** - Applies `cache: 'no-store'` to all GET requests to prevent stale data
- **Timeout handling** - All requests timeout after 30 seconds to prevent infinite loading states
- **Error handling** - Throws typed `ApiError` instances with `status` and `body` properties

**Environment-based configuration:**
- Base URL set via `NEXT_PUBLIC_API_BASE` environment variable
- Client key set via `NEXT_PUBLIC_RADLY_CLIENT_KEY` environment variable
- Configuration validated at build time to prevent runtime errors

#### Authentication Flow

The authentication system uses Supabase Auth with JWT tokens:

1. **Initiate Sign-In**: User visits `/auth/signin` or clicks a sign-in button
2. **Provider Selection**: User chooses OAuth provider (Google, Apple) or requests a Magic Link via email
3. **External Authentication**: Supabase redirects to the selected OAuth provider or sends a Magic Link email
4. **Callback Handling**: Provider redirects back to `/auth/callback` with authentication code
5. **Middleware Processing**: Next.js middleware captures the session and stores it in HTTP-only cookies
6. **State Hydration**: `AuthProvider` hydrates the authentication state in React Context
7. **Protected Access**: User can now access protected `/app/*` routes
8. **Automatic Token Injection**: HTTP client automatically retrieves and injects Bearer token for all API calls
9. **Token Refresh**: Tokens are automatically refreshed when expired (handled by Supabase)
10. **Sign Out**: User can sign out, which clears session cookies and redirects to the landing page

#### Polling Strategy

The application uses intelligent polling hooks (located in `src/hooks/useSafePolling.ts`) for real-time status updates:

- **`useSafePolling()`** - Base hook with customizable polling configuration
  - Tab visibility detection (pauses when tab is hidden to save resources)
  - Exponential backoff on errors to prevent server overload
  - Configurable intervals, max intervals, and backoff multipliers

- **`useJobStatusPolling()`** - Optimized for monitoring job status at `/v1/jobs/:id`
  - Base interval: 10 seconds
  - Max interval: 2 minutes
  - Backoff multiplier: 2.0x on errors

- **`useQueueStatsPolling()`** - Optimized for queue statistics at `/v1/queue/stats`
  - Base interval: 15 seconds
  - Max interval: 1 minute
  - Backoff multiplier: 1.5x on errors

**Key Features:**
- **Automatic pause/resume** - Polling pauses when browser tab is hidden and resumes when visible
- **Exponential backoff** - Increases polling interval on consecutive errors to prevent server overload
- **Backoff reset** - Resets to base interval on successful requests
- **Manual controls** - Provides `trigger()`, `pause()`, and `resume()` methods for programmatic control
- **Automatic cleanup** - Cleans up timers and listeners on component unmount to prevent memory leaks

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

## Design System & Color Theme

### Complete Design System Documentation

**Full Reference:** `/RadlyProject/DESIGN_SYSTEM_COLORS_THEMES.md`

Comprehensive documentation includes:
- Complete color palette (20+ colors with hex codes)
- Shadow system (4 elevation levels)
- Border radius system
- Gradient definitions (brand, button, hero, subtle)
- Animation effects (shimmer, pulse, float, glow)
- Component styling classes
- Glassmorphism effects
- Accessibility & WCAG contrast ratios
- Theme customization guide

### Quick Color Reference

All colors defined as CSS variables in `src/app/globals.css`

**Brand Colors**:
- Primary: `#2653FF` (brand blue)
- Primary Alt: `#4B8EFF` (lighter blue for gradients)
- Accent Purple: `#8F82FF` (premium secondary color)
- Link: `#3A82F7` (interactive text)

**Status Colors**:
- Success: `#3FBF8C` (green)
- Warning: `#F8B74D` (orange)
- Error: `#FF6B6B` (red)
- Info: `#3A82F7` (blue)

**Background Colors**:
- Primary: `#0C0C0E` (main background)
- Secondary: `#121214` (alt surfaces)
- Surface: `#16161A` (cards/panels)
- Surface Elevated: `rgba(22, 22, 26, 0.94)` (modals)

**Text Colors** (4 levels with contrast ratios):
- Primary: `#FFFFFF` (21:1 AAA)
- Secondary: `#CFCFCF` (15:1 AAA)
- Tertiary: `#9A9AA1` (8:1 AA)
- Muted: `#6E6E74` (4.5:1 AA)

### Premium Component Classes

**Glassmorphic Cards**:
```tsx
// Aurora Card - Premium card with animated glow
<div className="aurora-card p-6 border border-[rgba(255,255,255,0.08)]">
  <h3 className="text-gradient-brand">Premium Content</h3>
</div>
```

**Hero Sections**:
```tsx
// Neon Shell - Hero container with glow effects
<div className="neon-shell p-12">
  <h1>Hero Section Title</h1>
</div>

// Hero Starfield - Animated starfield background
<div className="hero-starfield p-16">
  <p>Animated background with grid pattern</p>
</div>
```

**Buttons**:
```tsx
// Primary Button with gradient
<button className="btn-primary">
  Primary Action
</button>

// CTA Button
<button className="cta-primary">
  Call to Action
</button>

// Secondary Button
<button className="button-secondary-soft">
  Secondary Action
</button>
```

**Text Effects**:
```tsx
// Gradient Text
<h2 className="text-gradient-brand">
  Branded Gradient Text
</h2>
```

**Status Badges**:
```tsx
// Success
<div className="text-success bg-success/10 border border-success/30 px-3 py-1 rounded">
  Success!
</div>

// Error
<div className="text-error bg-error/10 border border-error/30 px-3 py-1 rounded">
  Error occurred
</div>

// Warning
<div className="text-warning bg-warning/10 border border-warning/30 px-3 py-1 rounded">
  Warning message
</div>
```

### Theme Properties

| Property | Value |
|----------|-------|
| **Theme Mode** | Dark-only (no light variant) |
| **Philosophy** | Premium, professional, enterprise |
| **Target Users** | Business professionals |
| **Accessibility** | WCAG AAA compliant |
| **Animation Speed** | 0.25-0.3s transitions |
| **Font Family** | Inter (Google Fonts) |
| **Border Radius** | 6px (sm) - 20px (lg) |
| **Shadow Levels** | 4 (soft, medium, strong, xl) |

### CSS Variables Available

```css
/* Brand Colors */
--ds-primary: #2653FF;
--ds-primary-alt: #4B8EFF;
--ds-accent-purple: #8F82FF;
--ds-link: #3A82F7;

/* Background */
--ds-bg-primary: #0C0C0E;
--ds-bg-secondary: #121214;
--ds-surface: #16161A;
--ds-bg-gradient: linear-gradient(180deg, #0C0C0E 0%, #121214 100%);

/* Text */
--ds-text-primary: #FFFFFF;
--ds-text-secondary: #CFCFCF;
--ds-text-tertiary: #9A9AA1;
--ds-text-muted: #6E6E74;

/* Status */
--success: #3FBF8C;
--warning: #F8B74D;
--error: #FF6B6B;
--info: #3A82F7;

/* Shadows */
--ds-shadow-soft: 0 2px 6px rgba(0, 0, 0, 0.25);
--ds-shadow-medium: 0 4px 12px rgba(0, 0, 0, 0.3);
--ds-shadow-strong: 0 8px 24px rgba(0, 0, 0, 0.45);

/* Radius */
--ds-radius-sm: 6px;
--ds-radius-md: 12px;
--ds-radius-lg: 20px;
--ds-radius-pill: 9999px;
```

### Responsive Typography

**Heading Sizes**:
- `text-2xl sm:text-3xl lg:text-4xl` (responsive headings)

**Body Text**:
- `text-sm sm:text-base lg:text-lg` (responsive body)

**Small Text**:
- `text-xs sm:text-sm` (responsive labels)

### Spacing Pattern

- **Padding**: `p-4 sm:p-6 lg:p-10`
- **Gaps**: `gap-4 sm:gap-6 lg:gap-8`
- **Margins**: `mb-4 sm:mb-6 lg:mb-8`

### Animation Classes

- `.animate-shimmer` - Shimmer loading effect
- `.animate-float-orb` - Floating animation (8s)
- `.animate-pulse-glow` - Pulsing glow effect (3s)
- `.pulse-glow` - Green glow animation

## Platform Support

This repository now targets the **web experience exclusively**:

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive layouts that adapt to tablets and phones
- Stripe-based subscription management for billing
- Progressive Web App (PWA) capable with offline support

**Note:** Native mobile clients (iOS/Android) are maintained in a separate Swift project. This web repository serves as the primary platform and API reference for all team implementations.

## Complete API Reference for All Teams

This section provides comprehensive API documentation for iOS, Android, and backend teams to integrate with Radly services.

### API Base URLs

| Environment | URL |
|-------------|-----|
| Production | `https://edge.radly.app` |
| Staging | `https://staging.radly.app` |
| Development | `http://localhost:8000` |

### Required Headers for All API Calls

```
Authorization: Bearer {JWT_TOKEN}          # From Supabase auth
x-client-key: {RADLY_CLIENT_KEY}          # 64-character public key
X-Request-Id: {UUID}                       # Unique identifier per request
Content-Type: application/json
```

### Feature Endpoints Summary

#### User Management
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/v1/users/profile` | Get current user profile | Yes |
| PUT | `/v1/users/profile` | Update user profile | Yes |
| POST | `/v1/users/logout` | Sign out user | Yes |

#### Report Generation (Core Feature)
| Method | Endpoint | Purpose | Returns |
|--------|----------|---------|---------|
| GET | `/v1/templates` | List available templates | Template array |
| GET | `/v1/templates/{id}` | Get template details | Template schema |
| POST | `/v1/generate/async` | Start report generation | Job ID + status |
| GET | `/v1/jobs/{job_id}` | Poll job status | Job status + result |
| GET | `/v1/reports` | List user reports | Paginated reports |
| GET | `/v1/reports/{id}` | Get specific report | Report details |
| POST | `/v1/export/{report_id}` | Export to DOCX/PDF/HTML | Download URL |
| DELETE | `/v1/reports/{id}` | Delete report | Success response |

#### Voice Transcription (Premium Feature)
| Method | Endpoint | Purpose | Limit |
|--------|----------|---------|-------|
| POST | `/v1/transcribe` | Transcribe audio | Free: 0, Pro: 500m/mo |
| GET | `/v1/transcription/limits` | Check usage | Current usage |

#### Subscriptions & Billing
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/v1/subscriptions/status` | Current subscription | Yes |
| GET | `/v1/subscriptions/plans` | Available plans | No |
| POST | `/v1/subscriptions/upgrade` | Upgrade plan | Yes |
| POST | `/v1/subscriptions/billing-portal` | Stripe portal link | Yes |

#### Formatting & Customization
| Method | Endpoint | Purpose | Tier |
|--------|----------|---------|------|
| GET | `/v1/formatting/profiles` | List profiles | Pro+ |
| POST | `/v1/formatting/profiles` | Create profile | Pro+ |
| PUT | `/v1/formatting/profiles/{id}` | Update profile | Pro+ |
| DELETE | `/v1/formatting/profiles/{id}` | Delete profile | Pro+ |

#### System Status
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/health` | Health check | No |
| GET | `/v1/queue/stats` | Queue statistics | No |

#### Admin Operations
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/v1/metrics/system` | System metrics | Admin key |
| GET | `/v1/metrics/users` | User analytics | Admin key |
| GET | `/v1/metrics/tokens` | Token usage | Admin key |

### Job Status Polling Guide

For all platforms (Web, iOS, Android), use this polling strategy:

```
1. Initial request creates job → returns job_id with status "pending"
2. Poll GET /v1/jobs/{job_id} every 10 seconds
3. On error: increase interval by 2.0x (max 2 minutes)
4. On success: reset to 10 seconds
5. Stop when status is "completed" or "failed"
```

**Possible job statuses:**
- `pending` - Job queued, waiting to process
- `processing` - Currently generating report
- `completed` - Successfully generated (check `result` field)
- `failed` - Generation failed (check `error` field)

### Response Format Standards

**Success (200-299):**
```json
{
  "data": { /* response content */ },
  "timestamp": "2025-11-09T20:50:00Z"
}
```

**Error (4xx-5xx):**
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { /* additional context */ }
  },
  "timestamp": "2025-11-09T20:50:00Z"
}
```

### Error Codes & HTTP Status Codes

| Status | Code | Meaning | Action |
|--------|------|---------|--------|
| 200 | OK | Success | Use data |
| 202 | ACCEPTED | Job created | Start polling |
| 400 | BAD_REQUEST | Invalid parameters | Check request format |
| 401 | UNAUTHORIZED | Invalid/missing token | Re-authenticate |
| 403 | FORBIDDEN | Limit exceeded/permission denied | Check subscription |
| 404 | NOT_FOUND | Resource doesn't exist | Verify resource ID |
| 409 | CONFLICT | Resource already exists | Handle duplicate |
| 429 | RATE_LIMIT | Too many requests | Wait and retry |
| 500 | SERVER_ERROR | Backend error | Retry with backoff |
| 503 | SERVICE_UNAVAILABLE | Maintenance/overload | Retry later |

### Rate Limiting

- **Limit**: 1000 requests/hour per API key
- **Headers**:
  - `X-RateLimit-Limit`: Total limit
  - `X-RateLimit-Remaining`: Requests left
  - `X-RateLimit-Reset`: Unix timestamp when limit resets
- **Behavior**: Returns 429 when exceeded

### Webhook Events (Optional)

Configure webhook URL in admin dashboard. Backend sends these events:

```json
{
  "event": "job.completed",
  "job_id": "uuid",
  "user_id": "uuid",
  "status": "completed",
  "result": { "document_url": "..." },
  "timestamp": "2025-11-09T20:50:00Z"
}
```

### Subscription Tiers & Features

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Monthly Reports | 20 | 1,000 | Unlimited |
| Voice Minutes | 0 | 500 | Unlimited |
| Templates | Basic | All | Custom |
| Formatting | No | Yes | Yes + Custom |
| Support | Community | Email | Dedicated |
| Cost | Free | $29/mo | Custom |

### Authentication Methods

#### Supabase OAuth (Web, iOS, Android)
- Google OAuth
- Apple OAuth
- Magic Link (email)
- Returns JWT token + refresh token

#### Admin API Key (Backend/Admin Dashboard)
- 64-character API key
- Passed in `x-client-key` header
- Stored securely in environment variables

### Implementation Examples

**Generate a Report (All Platforms):**
```json
POST /v1/generate/async
Authorization: Bearer {JWT_TOKEN}
x-client-key: {CLIENT_KEY}
X-Request-Id: {UUID}

{
  "template_id": "template_1",
  "data": {
    "report_month": "2025-11",
    "summary": "Monthly report data"
  },
  "format": "docx"
}

Response (202 Accepted):
{
  "job_id": "job_uuid",
  "status": "pending"
}
```

**Poll Job Status:**
```json
GET /v1/jobs/job_uuid
Authorization: Bearer {JWT_TOKEN}
x-client-key: {CLIENT_KEY}
X-Request-Id: {NEW_UUID}

Response (200 OK):
{
  "job_id": "job_uuid",
  "status": "completed",
  "progress": 100,
  "result": {
    "document_url": "https://s3.radly.app/reports/job_uuid.docx"
  }
}
```

### Integration Checklist for Mobile Teams

- [ ] Implement OAuth flow using Supabase SDKs
- [ ] Store JWT token securely
- [ ] Implement job polling with exponential backoff
- [ ] Handle all HTTP status codes (401, 403, 429, 500)
- [ ] Display user subscription status
- [ ] Show usage limits and progress bars
- [ ] Implement offline fallbacks where possible
- [ ] Log errors for debugging
- [ ] Test rate limiting behavior
- [ ] Implement webhook handlers (optional)

## Contributing

We welcome contributions! Please follow these guidelines to maintain code quality and consistency.

### Code Style Guidelines

- **TypeScript** - Strict mode enabled; avoid `any` types
- **Linting** - ESLint configured with Next.js recommended rules
- **Formatting** - Consistent formatting via Turbopack
- **Components** - Follow Radix UI primitives + Tailwind CSS patterns
- **Naming** - Use descriptive names; components in PascalCase, utilities in camelCase

### Testing Requirements

Before submitting changes, ensure all tests pass:

```bash
npm run lint      # Must pass with no errors
npm run test      # All unit tests must pass
npm run test:e2e  # All E2E tests must pass
npm run build     # Production build must succeed
```

**Test Coverage:**
- Write unit tests for utility functions and hooks
- Write E2E tests for critical user workflows
- Maintain or improve code coverage with each PR

### How to Add New Components

#### 1. UI Components (`src/components/ui/`)
Primitive, reusable components that form the design system:
- Use Radix UI primitives as the base
- Style with Tailwind CSS utility classes
- Use Class Variance Authority (CVA) for component variants
- Export from `src/components/ui/index.ts` for easy imports

**Example:**
```typescript
// src/components/ui/custom-button.tsx
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(/* ... */)

export function CustomButton({ variant, ...props }: ButtonProps) {
  return <button className={buttonVariants({ variant })} {...props} />
}
```

#### 2. Feature Components (`src/components/features/`)
Domain-specific components with business logic:
- Import UI components from `src/components/ui/`
- Keep logic separate from presentation
- Use custom hooks for complex state management

#### 3. Page Components (`src/app/**/page.tsx`)
Route-level page components:
- Use Server Components by default for better performance
- Add `"use client"` directive only when you need client-side interactivity
- Keep pages lightweight; extract complex logic to feature components

### How to Add API Calls

Follow this pattern for all API interactions:

1. **Define types** in `src/types/api.ts`:
   ```typescript
   export interface UserProfile {
     id: string
     name: string
     email: string
   }
   ```

2. **Use HTTP client** from `src/lib/http.ts`:
   ```typescript
   import { httpGet, httpPost } from '@/lib/http'

   export async function getUserProfile(): Promise<UserProfile> {
     return httpGet<UserProfile>('/v1/users/profile')
   }
   ```

3. **Wrap in React Query** hook for caching:
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

### How to Add Forms

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

4. **Submit via HTTP client**:
   ```typescript
   const onSubmit = async (data: UserProfileFormData) => {
     await httpPost('/v1/users/profile', data)
   }
   ```

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes with clear, descriptive commits
3. Write or update tests as needed
4. Run all tests and linting locally
5. Submit a PR with a clear description of changes
6. Address review feedback promptly

For more detailed contribution guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md).

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

Comprehensive documentation is available to help you understand and work with the codebase:

### Development Documentation
- **[CLAUDE.md](./CLAUDE.md)** - Comprehensive development guidelines, architecture decisions, and patterns for AI-assisted development
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Detailed contribution guidelines and workflow processes
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history, feature updates, and release notes

### Technical Documentation
- **[docs/frontend-performance.md](./docs/frontend-performance.md)** - Performance optimization strategies, bundle analysis, and best practices
- **[docs/frontend-security.md](./docs/frontend-security.md)** - Security implementation details, best practices, and compliance guidelines
- **[docs/audit-fix-plan.md](./docs/audit-fix-plan.md)** - Technical debt tracking and resolution plan
- **[docs/auth-magiclink-universal-deeplinks.md](./docs/auth-magiclink-universal-deeplinks.md)** - Magic link authentication and universal deep linking implementation

### Testing Documentation
- **[e2e/README.md](./e2e/README.md)** - End-to-end testing guide with Playwright

## Support

For questions, issues, or contributions:

1. **Check Documentation** - Review the relevant documentation files listed above
2. **Search Issues** - Check [existing GitHub issues](https://github.com/your-org/radly-web/issues) for similar problems
3. **Troubleshooting** - Review the troubleshooting section in this README
4. **Create an Issue** - If you can't find a solution, create a detailed issue with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (Node version, OS, browser)
   - Relevant error messages or screenshots

## License

This project is **private and proprietary** to Radly Inc. All rights reserved.

Unauthorized copying, distribution, or use of this software is strictly prohibited.

---

**Last Updated:** November 2025
**Version:** 0.1.0
**Maintainers:** Radly Engineering Team
