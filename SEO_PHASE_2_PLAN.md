# 🚀 RADLY SEO ENHANCEMENT - PHASE 2 PLAN
## Week 2-3: Link Building & Technical SEO

**Status:** Ready for Implementation
**Target Start:** 11/8/2025
**Target Completion:** 11/20/2025 (2 weeks)
**Effort:** 40-50 hours

---

## 📋 Phase 2 Overview

Phase 2 focuses on **link equity building** and **technical SEO depth** to improve domain authority and crawlability. After Phase 1's foundation (structured data), Phase 2 builds the connections and optimization layers that Google uses to rank pages.

### Key Metrics After Phase 2
- **Internal links:** 80+ strategic links across site
- **Crawlability:** 100% of key pages properly linked
- **Breadcrumbs:** Navigation structure visible to search engines
- **Schema coverage:** 10+ types across site

---

## 🎯 Phase 2 Tasks

### Task 1: Internal Linking Strategy
**Priority:** HIGH | **Effort:** 12 hours | **Est. Impact:** +15-20% CTR improvement

#### 1.1 Homepage Strategic Linking
**File:** `src/app/page.tsx`

Add strategic internal links to key pages in the hero and CTAs:
```typescript
// Hero section CTA
<PrimaryCTA href="/instructions">
  Learn our 4-step workflow
</PrimaryCTA>

// Feature callout
<Link href="/validation" className="text-link">
  Validation methodology
</Link>

// Security badge link
<Link href="/security">
  Security & compliance details
</Link>
```

**Expected Outcome:**
- Hero links to Instructions, Pricing, Security
- Feature links anchor to relevant content pages
- Social proof links to Validation page

#### 1.2 Instructions Page Cross-Linking
**File:** `src/app/instructions/page.tsx`

Add contextual links within content:
- Link from "Voice transcription accuracy" → `/validation`
- Link from "Security concerns" → `/security`
- Link from "Pricing details" → `/pricing`
- Link from "Getting started" → `/auth/signin`

```typescript
// Example implementation
<p>
  Radly transcribes voice with high accuracy—see detailed
  <Link href="/validation" className="text-link">validation results</Link>
  from our pilot testing.
</p>
```

#### 1.3 Validation Page Cross-Linking
**File:** `src/app/validation/page.tsx`

Add links to related pages:
- Link from "Methodology" → `/instructions` (workflow)
- Link from "Security context" → `/security`
- Link from "Getting started" → `/auth/signin`
- Link from "FAQ" → `/instructions#faq`

#### 1.4 Security Page Cross-Linking
**File:** `src/app/security/page.tsx`

Add links emphasizing trust:
- Link from "Validation" mention → `/validation`
- Link from "Getting started" → `/auth/signin`
- Link from "Compliance" → `/terms`

#### 1.5 Pricing Page Cross-Linking
**File:** `src/app/pricing/page.tsx`

Add contextual links:
- Link from "Methodology" → `/validation`
- Link from "Security" mention → `/security`
- Link from "Getting started" → `/auth/signin`

#### 1.6 Terms & Privacy Cross-Linking
**Files:** `src/app/terms/page.tsx`, `src/app/privacy/page.tsx`

Add minimal but strategic links:
- Terms → `/validation` (for clinical governance)
- Privacy → `/security` (for data handling details)
- Both → `/auth/signin` (clear CTA)

### Task 2: Breadcrumb Navigation
**Priority:** HIGH | **Effort:** 8 hours | **Est. Impact:** +5-8% crawl efficiency

Add BreadcrumbList JSON-LD schemas to pages for clear hierarchy.

#### 2.1 Create Breadcrumb Component
**File:** `src/components/marketing/Breadcrumb.tsx` (new)

```typescript
interface BreadcrumbItem {
  label: string;
  url: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": `https://radly.app${item.url}`
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav aria-label="breadcrumb" className="flex gap-2 text-sm">
        {items.map((item, index) => (
          <div key={item.url} className="flex items-center gap-2">
            {index > 0 && <span className="text-gray-500">/</span>}
            <Link href={item.url} className="text-link hover:underline">
              {item.label}
            </Link>
          </div>
        ))}
      </nav>
    </>
  );
}
```

#### 2.2 Apply to Marketing Pages
Add breadcrumbs to:
- Instructions: Home > Instructions
- Validation: Home > Validation
- Security: Home > Security
- Pricing: Home > Pricing
- Terms: Home > Terms
- Privacy: Home > Privacy

**Implementation Example:**
```typescript
<Breadcrumb items={[
  { label: "Home", url: "/" },
  { label: "Validation", url: "/validation" }
]} />
```

### Task 3: Enhanced Schema Coverage
**Priority:** MEDIUM | **Effort:** 10 hours | **Est. Impact:** +10-15% rich result eligibility

#### 3.1 WebPage Schema on All Marketing Pages
Add to each marketing page for better page description:

```typescript
const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://radly.app/validation",
  "name": "Validation | Radly internal testing overview",
  "description": "Review Radly's validation testing with 180 anonymized cases...",
  "url": "https://radly.app/validation",
  "publisher": {
    "@type": "Organization",
    "name": "Radly",
    "logo": {
      "@type": "ImageObject",
      "url": "https://radly.app/icon-512.png"
    }
  },
  "isPartOf": {
    "@id": "https://radly.app/#organization"
  }
};
```

**Files to Update:**
- `src/app/validation/page.tsx`
- `src/app/security/page.tsx`
- `src/app/instructions/page.tsx`
- `src/app/pricing/page.tsx`
- `src/app/terms/page.tsx`
- `src/app/privacy/page.tsx`

#### 3.2 SearchAction Schema on Homepage
Allow Google to show search box in rich results:

**File:** `src/app/page.tsx`

```typescript
const searchSchema = {
  "@context": "https://schema.org",
  "@type": "SearchAction",
  "target": {
    "@type": "EntryPoint",
    "urlTemplate": "https://radly.app/app/templates?q={search_term_string}"
  },
  "query-input": "required name=search_term_string"
};
```

#### 3.3 Service Schema
Define Radly's services in structured format:

**File:** `src/app/page.tsx` or `src/lib/schemas.ts`

```typescript
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Radly Assistant - Voice-Supported Radiology Reporting",
  "description": "AI assistant for structured radiology report generation with voice input",
  "provider": {
    "@type": "Organization",
    "name": "Radly",
    "url": "https://radly.app"
  },
  "areaServed": {
    "@type": "Country",
    "name": ["Worldwide", "Egypt"]
  },
  "serviceType": "Medical AI",
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "USD",
    "availability": "https://schema.org/OnlineOnly"
  }
};
```

### Task 4: Sitemap & Robots.txt Optimization
**Priority:** MEDIUM | **Effort:** 6 hours | **Est. Impact:** +5-10% crawl efficiency

#### 4.1 Generate Dynamic Sitemap
**File:** `src/app/sitemap.ts` (new, if not exists)

```typescript
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://radly.app';
  const pages = [
    { url: '/', changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: '/pricing', changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/instructions', changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/validation', changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/security', changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/terms', changeFrequency: 'yearly' as const, priority: 0.5 },
    { url: '/privacy', changeFrequency: 'yearly' as const, priority: 0.5 },
    { url: '/auth/signin', changeFrequency: 'weekly' as const, priority: 0.6 },
  ];

  return pages.map(page => ({
    url: `${baseUrl}${page.url}`,
    lastModified: new Date().toISOString(),
    changeFrequency: page.changeFrequency,
    priority: page.priority
  }));
}
```

#### 4.2 Robots.txt Configuration
**File:** `public/robots.txt`

```
# Allow all crawlers
User-agent: *
Allow: /

# Point to sitemap
Sitemap: https://radly.app/sitemap.xml

# Delay for courtesy
Crawl-delay: 1
```

### Task 5: Open Graph Image Optimization
**Priority:** LOW | **Effort:** 4 hours | **Est. Impact:** +3-5% social CTR

Currently using single `og-default.png` on all pages. Consider:
- Keep current single image (simplest)
- OR create page-specific OG images:
  - `/og/instructions.png` - workflow visual
  - `/og/validation.png` - data/metrics visual
  - `/og/security.png` - lock/security visual
  - `/og/pricing.png` - pricing tiers visual

**If page-specific images:**
Update each page's metadata to reference:
```typescript
openGraph: {
  images: [{
    url: "https://radly.app/og/instructions.png",
    width: 1200,
    height: 630,
    alt: "Radly Instructions - 4-step workflow..."
  }]
}
```

**Recommendation:** Keep current single image in Phase 2, create page-specific images in Phase 3 (visual content phase).

---

## 📊 Implementation Checklist

### Week 1 (11/8 - 11/14)
- [ ] Task 1: Internal linking strategy (all files)
  - [ ] Homepage strategic links
  - [ ] Instructions cross-links
  - [ ] Validation cross-links
  - [ ] Security cross-links
  - [ ] Pricing cross-links
  - [ ] Terms cross-links
  - [ ] Privacy cross-links
  - [ ] Test all links work
- [ ] Task 2: Breadcrumb component
  - [ ] Create Breadcrumb component
  - [ ] Add to 6 marketing pages
  - [ ] Test schema output
- [ ] Code review
- [ ] Git commit & push

### Week 2 (11/15 - 11/20)
- [ ] Task 3: Enhanced schema coverage
  - [ ] WebPage schema on all pages
  - [ ] SearchAction on homepage
  - [ ] Service schema on homepage
  - [ ] Test with Rich Results Tool
- [ ] Task 4: Sitemap & robots.txt
  - [ ] Create/update sitemap.ts
  - [ ] Update robots.txt
  - [ ] Test URLs in sitemap
  - [ ] Verify crawlability
- [ ] Task 5: OG image optimization
  - [ ] Evaluate single vs. multiple images
  - [ ] Decision & implementation
- [ ] Final testing
  - [ ] Mobile responsiveness
  - [ ] Link validation
  - [ ] Schema validation
- [ ] Git commit & push to main

---

## 🧪 Testing Plan

### Before Deployment
1. **Link Testing**
   ```bash
   # Check all links are live
   npm run test:links

   # Manual check in browser
   # Open each page, click every link
   ```

2. **Schema Testing**
   ```
   Visit: https://search.google.com/test/rich-results
   Test URLs:
   - https://radly.app
   - https://radly.app/instructions
   - https://radly.app/validation
   - https://radly.app/security
   - https://radly.app/pricing
   ```

3. **Sitemap Validation**
   ```bash
   # Verify sitemap is valid XML
   curl https://radly.app/sitemap.xml

   # Check robots.txt
   curl https://radly.app/robots.txt
   ```

4. **Mobile Test**
   - Test on iPhone (375px width)
   - Verify breadcrumbs display correctly
   - Verify links are tappable (44px min)

### Post-Deployment Monitoring
1. **Google Search Console**
   - Submit sitemap
   - Check crawl errors
   - Monitor indexing status
   - Review rich result reports

2. **Weekly Metrics**
   - Crawl budget usage (should be efficient)
   - Rich result eligibility (should increase)
   - Indexation rate (should be 100%)

---

## 🎯 Success Criteria

**Phase 2 is successful when:**
1. ✅ All marketing pages have 3+ contextual internal links
2. ✅ Breadcrumb schema displays correctly on all pages
3. ✅ Rich Results Test shows 0 errors on all schemas
4. ✅ Sitemap includes all 9 key pages
5. ✅ Robots.txt is properly configured
6. ✅ Google Search Console shows healthy indexation
7. ✅ All links are working (no 404s)

---

## 📈 Expected Impact

After Phase 2:
- **+15-20% improvement** in search crawlability
- **+5-8% improvement** in page structure clarity
- **10+ schema types** live across site
- **Foundation for Phase 3** (content marketing)

---

## 🔗 Rollover to Phase 3

Phase 3 (Week 4-5) will focus on:
- Blog content creation (5-10 posts)
- Keyword targeting optimization
- Link outreach to healthcare publications
- Content distribution strategy

All Phase 2 structural work will enable Phase 3's content to perform better with superior linking and schema foundation.

---

## 📞 Support & Questions

For Phase 2 implementation questions:
- Schema validation: Use Google Rich Results Test
- Link strategy: Review SEO_ENHANCEMENT_PLAN.md section 4.2
- Technical setup: Check Next.js App Router docs
- Deployment: See main CLAUDE.md for git workflow

---

**Phase 2 Estimated Timeline:** 10-14 calendar days
**Phase 2 Team Effort:** 40-50 hours
**Ready to Start:** Yes (upon Phase 1 verification)
