# Auto-Detect Pricing Region Based on User Location

## Overview
Automatically detect user's country and show appropriate pricing (Egypt/EGP vs International/USD) without manual selection. Remove toggle buttons and implement IP-based geolocation detection.

## Requirements
- ✅ Remove manual toggle buttons completely
- ✅ No cookie storage - always auto-detect on each visit
- ✅ If country can't be detected, show modal for manual selection
- ✅ Egypt (country code "EG") → EGP pricing
- ✅ All other countries → USD pricing
- ✅ "Wrong region?" link for users who want to manually switch

## Technical Approach
**Middleware-based detection** with client-side fallback modal:
- Edge-level country detection via Vercel's `x-vercel-ip-country` header
- URL rewriting to add `?region=international` for non-Egypt users
- Response header `x-region-detected` to signal detection status to client
- Fallback modal when country can't be detected
- SEO-friendly, minimal latency (~5-10ms)

> [!IMPORTANT]
> **Architecture Decision**: The pricing page MUST remain a Server Component to preserve the `metadata` export for SEO. We use a Client Component wrapper (`RegionDetectionWrapper`) only for the modal logic.

---

## Implementation Steps

### Step 1: Add Country Detection to Middleware

**File**: `middleware.ts`

**Add after existing middleware logic** (around line 47):

```typescript
// Auto-detect pricing region based on country
const isPricingPage = pathname === '/pricing' || pathname === '/pricing/';
if (isPricingPage && !req.nextUrl.searchParams.has('region')) {
  const country = req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry');

  if (country) {
    // Bot detection: default international for SEO
    const userAgent = req.headers.get('user-agent') || '';
    const isBot = /bot|crawler|spider|googlebot|bingbot|slurp|duckduckbot/i.test(userAgent);

    if (country !== 'EG' || isBot) {
      // Non-Egypt countries or bots → international pricing
      const url = req.nextUrl.clone();
      url.searchParams.set('region', 'international');
      const response = NextResponse.rewrite(url);
      response.headers.set('x-region-detected', 'true');
      return response;
    }
    // Egypt users → default EGP pricing
    const response = NextResponse.next();
    response.headers.set('x-region-detected', 'true');
    return response;
  }
  // If no country detected, let page load normally and show modal client-side
  const response = NextResponse.next();
  response.headers.set('x-region-detected', 'false');
  return response;
}
```

---

### Step 2: Create Region Detection Wrapper (Client Component)

**File**: `src/components/pricing/RegionDetectionWrapper.tsx` (NEW)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { RegionSelectionModal } from './RegionSelectionModal';

interface RegionDetectionWrapperProps {
  regionDetected: boolean;
}

export function RegionDetectionWrapper({ regionDetected }: RegionDetectionWrapperProps) {
  const searchParams = useSearchParams();
  const [showRegionModal, setShowRegionModal] = useState(false);
  
  useEffect(() => {
    // Show modal only if: no region param AND detection failed
    const hasRegionParam = searchParams.has('region');
    if (!hasRegionParam && !regionDetected) {
      setShowRegionModal(true);
    }
  }, [searchParams, regionDetected]);

  return (
    <>
      <RegionSelectionModal
        open={showRegionModal}
        onClose={() => setShowRegionModal(false)}
      />
      
      {/* "Wrong region?" link for manual override */}
      <div className="mt-6 text-center">
        <button
          onClick={() => setShowRegionModal(true)}
          className="text-xs text-[rgba(143,130,255,0.75)] hover:text-[rgba(143,130,255,1)] underline-offset-4 hover:underline transition-colors"
        >
          Wrong region? Change currency
        </button>
      </div>
    </>
  );
}
```

---

### Step 3: Create Region Selection Modal

**File**: `src/components/pricing/RegionSelectionModal.tsx` (NEW)

```typescript
'use client';

import { Globe } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface RegionSelectionModalProps {
  open: boolean;
  onClose: () => void;
}

export function RegionSelectionModal({ open, onClose }: RegionSelectionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(38,83,255,0.15)]">
              <Globe className="h-8 w-8 text-[rgba(75,142,255,0.9)]" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Select Your Region</DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            Please select your region to view pricing in your local currency.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <Link href="/pricing" onClick={onClose} className="block">
            <Button variant="outline" className="w-full h-auto py-4 justify-start">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇪🇬</span>
                <div className="text-left">
                  <div className="font-semibold">Egypt (EGP)</div>
                  <div className="text-xs text-muted-foreground">Pricing in Egyptian Pounds</div>
                </div>
              </div>
            </Button>
          </Link>

          <Link href="/pricing?region=international" onClick={onClose} className="block">
            <Button variant="outline" className="w-full h-auto py-4 justify-start">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌍</span>
                <div className="text-left">
                  <div className="font-semibold">International (USD)</div>
                  <div className="text-xs text-muted-foreground">Pricing in US Dollars</div>
                </div>
              </div>
            </Button>
          </Link>
        </div>

        <p className="text-xs text-center text-[rgba(207,207,207,0.55)]">
          Your selection will be applied immediately.
        </p>
      </DialogContent>
    </Dialog>
  );
}
```

---

### Step 4: Update Pricing Page (Minimal Changes)

**File**: `src/app/pricing/page.tsx`

> [!NOTE]
> The page remains a **Server Component**. We only add the client wrapper and remove the toggle buttons.

#### 4.1 Add imports (after line 10)
```typescript
import { headers } from 'next/headers';
import { RegionDetectionWrapper } from '@/components/pricing/RegionDetectionWrapper';
```

#### 4.2 Read detection header (inside the function, after line 80)
```typescript
// Check if middleware detected the region
const headersList = await headers();
const regionDetected = headersList.get('x-region-detected') === 'true';
```

#### 4.3 Remove manual toggle buttons
**Delete lines 164-181** (the entire region toggle `<div>` block)

#### 4.4 Add the wrapper component (after the pricing cards section, around line 241)
```typescript
<RegionDetectionWrapper regionDetected={regionDetected} />
```

---

## Breaking Changes Assessment

| Concern | Risk | Mitigation |
|---------|------|------------|
| **Metadata export** | ❌ None | Page stays Server Component |
| **Structured data (JSON-LD)** | ❌ None | Still renders server-side |
| **SEO** | ❌ None | Bots get international pricing by default |
| **Existing URLs** | ❌ None | `?region=international` still works |
| **Local development** | ⚠️ Low | Modal shows (no headers), expected |

**Verdict**: No breaking changes. The enhanced approach is strictly additive.

---

## Edge Cases Handled

| Scenario | Behavior |
|----------|----------|
| **Egypt user (EG)** | Middleware detects, shows EGP pricing, no modal |
| **International user** | Middleware detects, rewrites to `?region=international`, no modal |
| **Missing headers (local dev)** | Modal appears immediately (no delay) |
| **VPN user** | Shows VPN country's pricing, can click "Wrong region?" to switch |
| **Bot/crawler** | Shows international pricing (SEO-friendly default) |
| **Manual override** | `?region=international` bypasses detection |

---

## Files Summary

| File | Action | Changes |
|------|--------|---------|
| `middleware.ts` | Modify | Add ~25 lines for region detection |
| `src/app/pricing/page.tsx` | Modify | Add imports, read header, remove toggle (lines 164-181), add wrapper |
| `src/components/pricing/RegionDetectionWrapper.tsx` | Create | ~45 lines |
| `src/components/pricing/RegionSelectionModal.tsx` | Create | ~65 lines |

---

## Testing Plan

### Local Development
```bash
npm run dev
# Modal should appear (no headers in local dev)
# Select region → pricing updates
# "Wrong region?" link opens modal
```

### Production (Vercel Preview)
1. Test from Egypt IP → EGP pricing, no modal
2. Test from US/UK IP → USD pricing, no modal  
3. Click "Wrong region?" → modal opens, can switch
4. View source → verify JSON-LD schema has correct currency

---

## Rollback Plan

If issues arise:
1. Revert `middleware.ts` changes
2. Restore toggle buttons in `pricing/page.tsx`
3. Delete `RegionDetectionWrapper.tsx` and `RegionSelectionModal.tsx`
4. Remove wrapper component and header reading from pricing page
