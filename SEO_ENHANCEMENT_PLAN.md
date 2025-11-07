# 🚀 RADLY.APP SEO ENHANCEMENT PLAN
## Comprehensive Implementation Strategy & Roadmap

**Date:** November 2025
**Status:** Ready for Review & Approval
**Current SEO Score:** 5.4/10 | **Target Score:** 8.5/10 within 3 months

---

## EXECUTIVE SUMMARY

Radly has a **solid technical foundation** (strong next.config.ts, robots.txt, basic metadata) but lacks the **content depth, structured data, and strategic architecture** needed to compete in healthcare software search rankings.

**Quick Facts:**
- ✓ Technical SEO: 8/10 (foundation is strong)
- ✗ Structured Data: 5/10 (only SoftwareApplication schema on homepage)
- ✗ Content Strategy: 4/10 (no blog, limited keyword targeting)
- ✗ Internal Linking: 4/10 (minimal cross-page links)
- ⚠️ Page Metadata: 6/10 (incomplete across all pages)

**Investment Required:** 80-120 hours (3-4 weeks for full implementation)
**Expected ROI:** 40-60% increase in organic search traffic within 6 months

---

## PHASE 1: QUICK WINS (Week 1 - Implementation Time: 15-20 hours)

### 1.1 Expand & Standardize JSON-LD Structured Data

**Current State:**
- Only SoftwareApplication schema on homepage
- Missing: Organization, Article, FAQPage, BreadcrumbList, PriceSchema

**Implementation:**

#### A. Add Organization Schema (Root Layout)
**File:** `src/app/layout.tsx`
**Insert Location:** After line 115 (within head/metadata)

```typescript
// Add to metadata object (line ~40, after icons)
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Radly",
  "alternateName": "Radly Assistant",
  "url": "https://radly.app",
  "logo": "https://radly.app/logo.svg",
  "description": "Voice-supported AI assistant for structured radiology reporting",
  "sameAs": [
    "https://twitter.com/radlyhq",
    // Add LinkedIn, if applicable
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-XXX-XXX-XXXX", // Add if available
    "contactType": "Customer Support",
    "email": "support@radly.app"
  },
  "founder": {
    "@type": "Person",
    "name": "Hammad Mohamed" // Add actual founder name if applicable
  },
  "areaServed": {
    "@type": "Country",
    "name": ["Worldwide", "Egypt"]
  },
  "knowsAbout": [
    "Radiology",
    "Medical AI",
    "Clinical Documentation",
    "Voice Recognition"
  ]
};

// Add to metadata return (around line 60):
const script = {
  id: 'organization-schema',
  type: 'application/ld+json',
  dangerouslySetInnerHTML: { __html: JSON.stringify(organizationSchema) }
};
```

**Expected Impact:** ✓ Improves Knowledge Panel eligibility, displays contact info in SERP

---

#### B. Add Article Schema to Content Pages
**Files to Update:**
- `src/app/instructions/page.tsx`
- `src/app/validation/page.tsx`
- `src/app/security/page.tsx`

**Template for each page:**

```typescript
const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "[Page Title]",
  "description": "[Meta Description]",
  "image": "/og-images/[page-name].png", // Page-specific OG image
  "datePublished": "2025-11-05",
  "dateModified": "2025-11-07",
  "author": {
    "@type": "Organization",
    "name": "Radly",
    "url": "https://radly.app"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Radly",
    "logo": {
      "@type": "ImageObject",
      "url": "https://radly.app/logo.svg"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "[PAGE_URL]"
  }
};
```

**Expected Impact:** ✓ Rich snippets in SERP, better article attribution

---

#### C. Add FAQPage Schema to Instructions Page
**File:** `src/app/instructions/page.tsx`

```typescript
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do I capture my findings with Radly?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Simply speak your findings naturally. Radly transcribes and organizes them into structured sections."
      }
    },
    {
      "@type": "Question",
      "name": "Can I edit reports after Radly generates them?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, you have full control. Review, edit, and finalize every report before export."
      }
    },
    // ... Add 3-5 more FAQ items
  ]
};
```

**Expected Impact:** ✓ FAQ rich snippets in SERP, increased click-through rate

---

#### D. Add Pricing Schema to Pricing Page
**File:** `src/app/pricing/page.tsx`

```typescript
const priceSchema = {
  "@context": "https://schema.org",
  "@type": "ProductCollection",
  "name": "Radly Plans",
  "description": "Choose the radiology reporting plan that fits your volume",
  "mainEntity": [
    {
      "@type": "Product",
      "name": "Free Plan",
      "description": "5 complimentary reports to evaluate Radly",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "url": "https://radly.app/pricing/checkout?tier=free"
      }
    },
    {
      "@type": "Product",
      "name": "Starter Plan",
      "description": "30 reports per month",
      "offers": [
        {
          "@type": "Offer",
          "price": "[EGP_PRICE]",
          "priceCurrency": "EGP",
          "url": "https://radly.app/pricing/checkout?tier=starter&region=egypt"
        },
        {
          "@type": "Offer",
          "price": "[USD_PRICE]",
          "priceCurrency": "USD",
          "url": "https://radly.app/pricing/checkout?tier=starter&region=international"
        }
      ]
    },
    // ... Repeat for Professional and Premium plans
  ]
};
```

**Expected Impact:** ✓ Price appears in SERP, structured pricing data for comparison tools

---

#### E. Add BreadcrumbList Schema (App Pages)
**File:** `src/components/layout/Navigation.tsx` or new schema helper

```typescript
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://radly.app"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "[Current Page]",
      "item": "[CURRENT_URL]"
    }
  ]
};
```

**Expected Impact:** ✓ Breadcrumb navigation in SERP

---

### 1.2 Complete Missing Page Metadata

**Current Issues:**
- Validation, Security, Terms pages missing OpenGraph
- Privacy page metadata incomplete
- Accessibility page has no metadata

**Implementation:**

#### A. Update Validation Page
**File:** `src/app/validation/page.tsx` (currently at lines 11-18)

```typescript
export const metadata: Metadata = {
  title: "Validation | Radly internal testing overview | Radly Assistant",
  description: "Review Radly's validation testing with 180 anonymized cases. Median draft time under 2 minutes. Full methodology transparency including limitations.",
  openGraph: {
    title: "How Radly Validates Assistant Accuracy",
    description: "Internal testing methodology for radiology report generation assistant",
    url: "https://radly.app/validation",
    type: "article",
    images: [
      {
        url: "https://radly.app/og-images/validation.png",
        width: 1200,
        height: 630,
        alt: "Radly Validation Testing Data"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Radly Validation: Real Testing Data",
    description: "How we validate radiology report generation accuracy"
  }
};
```

#### B. Update Security Page
**File:** `src/app/security/page.tsx` (currently at lines 29-36)

```typescript
export const metadata: Metadata = {
  title: "Security | Radly controls and safeguards | Radly Assistant",
  description: "Enterprise-grade security controls. TLS 1.2+ encryption, AES-256 at-rest, role-based access, SSO, 90-day audit logs. HIPAA-ready architecture.",
  openGraph: {
    title: "Radly Security & Compliance",
    description: "How Radly protects sensitive clinical data with enterprise security controls",
    url: "https://radly.app/security",
    type: "article",
    images: [
      {
        url: "https://radly.app/og-images/security.png",
        width: 1200,
        height: 630,
        alt: "Radly Security Controls"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Radly Security & Data Protection",
    description: "Enterprise security controls for healthcare data"
  }
};
```

#### C. Update Terms Page
**File:** `src/app/terms/page.tsx`

```typescript
export const metadata: Metadata = {
  title: "Terms of Service | Radly Assistant",
  description: "Radly Assistant Terms of Service. Legal conditions for using our voice-supported radiology reporting platform.",
  openGraph: {
    title: "Radly Assistant - Terms of Service",
    description: "Legal terms and conditions",
    url: "https://radly.app/terms",
    type: "website"
  }
};
```

#### D. Fix Privacy Page Routing
**Current Issue:** Privacy at `/legal/privacy` instead of `/privacy`

**Action:** Create redirect or move to `/app/privacy/page.tsx` with full metadata

```typescript
export const metadata: Metadata = {
  title: "Privacy Policy | Radly Assistant",
  description: "Radly's privacy policy. Learn how we collect, use, and protect your data in compliance with GDPR, CCPA, and healthcare regulations.",
  openGraph: {
    title: "Radly Privacy Policy",
    description: "How Radly handles your data",
    url: "https://radly.app/privacy",
    type: "website"
  }
};
```

**Expected Impact:** ✓ All public pages now have consistent, keyword-optimized metadata

---

### 1.3 Create Custom OG Images for Each Page

**Current State:** Single `og-default.png` used for all pages

**Plan:**
1. Create 6 page-specific OG images (1200x630px):
   - `/public/og-images/home.png` - Hero + value prop
   - `/public/og-images/pricing.png` - Plan comparison visual
   - `/public/og-images/instructions.png` - Step-by-step workflow
   - `/public/og-images/validation.png` - Data/metrics visual
   - `/public/og-images/security.png` - Lock/shield imagery
   - `/public/og-images/templates.png` - Template showcase

2. Update metadata in each page.tsx to reference:
```typescript
images: [
  {
    url: "https://radly.app/og-images/[page-name].png",
    width: 1200,
    height: 630
  }
]
```

**Expected Impact:** ✓ Better click-through rate on social shares, brand consistency

---

### 1.4 Standardize Meta Descriptions

**Current Issue:** Multiple pages use same description

**Implementation:**

| Page | Current | New (Optimized) |
|------|---------|-----------------|
| Pricing | "Compare Radly plans..." | "Compare Radly's voice radiology reporting plans. EGP and USD pricing. 5 free reports. Enterprise security." |
| Instructions | "Radly walkthrough..." | "Learn how to generate structured radiology reports with Radly. 4-step workflow. Voice-supported. Median time: 2 minutes." |
| Validation | "Radly validation..." | "Radly validation testing with 180 anonymized cases. Median draft time <2min. Full methodology. Limitations included." |
| Security | "Security overview..." | "Enterprise security for radiology data. AES-256, TLS 1.2+, SSO, role-based access, 90-day audit logs. HIPAA-ready." |

**Expected Impact:** ✓ Higher CTR on SERP, better keyword relevance signaling

---

**Phase 1 Summary:**
- ⏱️ **Time Investment:** 15-20 hours
- 📊 **Expected Impact:** +15-20% on SERP CTR, better structured data signals
- 🎯 **Completion:** Week 1
- ✅ **Prerequisites:** None (no database changes)

---

## PHASE 2: CONTENT EXPANSION (Week 2-3 - Implementation Time: 30-40 hours)

### 2.1 Create Blog/Resources Hub Architecture

**Current State:** No blog section exists

**Plan:**

#### A. Create Blog Structure
```
/src/app/blog/
├── page.tsx                    # Blog index/archive page
├── [slug]/
│   └── page.tsx               # Individual blog post
├── layout.tsx                 # Blog layout with sidebar
└── categories/
    ├── [category]/page.tsx    # Category archive
```

#### B. Create Blog Post Metadata Handler
**File:** `src/app/blog/utils/getBlogPosts.ts`

```typescript
export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  ogImage: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  category: "Clinical" | "Technology" | "Workflow" | "Compliance";
  readTime: number; // minutes
  keywords: string[];
  content: string; // MDX content
}

// Directory structure for blog posts:
// /src/app/blog/posts/
// ├── post-1-slug.mdx
// ├── post-2-slug.mdx
// └── etc.
```

#### C. Blog Index Page
**File:** `src/app/blog/page.tsx`

```typescript
export const metadata: Metadata = {
  title: "Blog | Radly - Radiology AI Insights & Resources",
  description: "Expert insights on radiology AI, voice documentation, clinical workflows, and healthcare technology. Stay updated on Radly features and industry trends.",
  openGraph: {
    title: "Radly Blog - Radiology Technology Resources",
    description: "Learn about radiology AI, voice documentation, and clinical workflows",
    url: "https://radly.app/blog",
    type: "website"
  }
};

export default function BlogIndex() {
  // Display all blog posts with:
  // - Post title (H2)
  // - Excerpt (150 chars)
  // - Publish date
  // - Category tag
  // - Read time
  // - Featured image
  // - Link to post
}
```

**Expected Impact:** ✓ Blog becomes organic traffic engine, targets long-tail keywords

---

### 2.2 Launch Initial Blog Posts (3-5 Posts)

**Target Keywords & Post Ideas:**

#### Post 1: "The Complete Guide to Structured Radiology Reporting"
- **Target Keywords:** "structured radiology reports," "radiology documentation," "clinical reporting standards"
- **Length:** 2,500+ words
- **Structure:**
  - What is structured reporting (why it matters)
  - Benefits (efficiency, accuracy, compliance)
  - Common report templates
  - Best practices
  - Tools comparison (mention Radly naturally)
  - Implementation checklist
- **Schema:** Article + BreadcrumbList
- **CTA:** "Try Radly's structured templates free"

#### Post 2: "Voice Transcription in Radiology: Accuracy, Compliance & Workflow Benefits"
- **Target Keywords:** "voice documentation," "medical transcription," "radiology voice assistant"
- **Length:** 2,000+ words
- **Structure:**
  - History of voice in radiology
  - How voice transcription works
  - HIPAA compliance requirements
  - Accuracy rates and testing
  - Integration with existing workflows
  - Comparison: Voice vs. typing vs. dictation
- **Schema:** Article
- **CTA:** "See Radly's validation testing"

#### Post 3: "AI in Radiology: Assistants, Safety, and the Role of Human Review"
- **Target Keywords:** "AI radiology," "medical AI safety," "clinical decision support"
- **Length:** 2,200+ words
- **Structure:**
  - Current state of AI in radiology
  - How AI assistants augment workflows
  - Safety and validation requirements
  - Regulatory landscape
  - Why human review is essential
  - Future of radiology AI
- **Schema:** Article + FAQ (embedded Q&A)
- **CTA:** "Learn about Radly's validation"

#### Post 4: "HIPAA Compliance & Data Security in Radiology Software"
- **Target Keywords:** "HIPAA radiology," "medical data security," "healthcare compliance"
- **Length:** 2,000+ words
- **Structure:**
  - HIPAA requirements
  - Common security gaps
  - Encryption and access controls
  - Audit logs and monitoring
  - Vendor security evaluation
  - Checklist for security teams
- **Schema:** Article
- **CTA:** "Review Radly's security controls"

#### Post 5: "5 Workflow Optimization Tips for Radiology Departments"
- **Target Keywords:** "radiology workflow," "radiology efficiency," "reporting efficiency"
- **Length:** 1,800+ words
- **Structure:**
  - Tip 1: Voice-first documentation
  - Tip 2: Template standardization
  - Tip 3: Batch reporting strategies
  - Tip 4: AI-assisted review
  - Tip 5: Integration and automation
- **Schema:** Article
- **CTA:** "Optimize with Radly"

---

### 2.3 Create Resource Hub Pages

#### A. Use Cases Hub
**File:** `src/app/use-cases/page.tsx`

```typescript
// Structure:
// - Use Case 1: Chest Radiography
// - Use Case 2: Abdominal Imaging
// - Use Case 3: Neuroradiology
// - Use Case 4: Musculoskeletal
// - Use Case 5: Cardiac Imaging

// Each with:
// - Keywords: modality-specific searches
// - Pain points
// - Radly solution
// - Features applicable
// - CTA: Try templates
```

**Expected Keywords:** "radiology templates," "chest report template," "abdominal imaging report"

#### B. Feature Deep-Dive Pages
**Files to Create:**
- `src/app/features/voice-input/page.tsx` - "AI voice transcription for radiology"
- `src/app/features/structured-reports/page.tsx` - "Structured radiology reporting"
- `src/app/features/export-formats/page.tsx` - "DOCX export for clinical reports"
- `src/app/features/templates/page.tsx` - "Pre-built radiology report templates"

**Example:** `/features/voice-input/page.tsx`

```typescript
export const metadata: Metadata = {
  title: "Voice Input for Radiology Reports | Radly Assistant",
  description: "Hands-free voice transcription for radiology reports. Capture findings naturally. Integrates with structured templates. Sub-2min median draft time.",
  openGraph: {
    title: "Voice-Supported Radiology Reporting",
    description: "Capture findings naturally with voice. AI transcription and structuring."
  }
};

// Content:
// - What is voice input (problem)
// - Why radiologists need it
// - How Radly's voice system works
// - Accuracy metrics
// - Compliance & HIPAA
// - Integration steps
// - Comparison chart
```

**Expected Keywords:** "medical voice recognition," "radiology voice input," "hands-free medical dictation"

#### C. Integrations/Compatibility Pages
**File:** `src/app/integrations/page.tsx`

```
- EHR compatibility
- PACS integration
- Archiving systems
- API documentation (if applicable)
```

---

### 2.4 Comparison Content (SEO Gold)

**File:** `src/app/comparison/page.tsx` or individual comparison pages

#### Comparison Templates:

**Example: `/comparison/radly-vs-traditional-dictation`**

```typescript
export const metadata: Metadata = {
  title: "Radly vs. Traditional Medical Dictation | Comparison",
  description: "Compare Radly's AI-powered radiology reporting vs. traditional transcription. Speed, accuracy, cost, and workflow benefits.",
  openGraph: {
    title: "Radly vs. Traditional Dictation - Detailed Comparison",
    description: "Side-by-side comparison of modern AI reporting vs. traditional methods"
  }
};

// Content structure:
// - Accuracy
// - Speed (Radly: <2min vs. Dictation: 5-10min)
// - Cost analysis
// - Integration ease
// - Compliance features
// - Learning curve
// - Comparison table
// - FAQ addressing common concerns
```

**Additional Comparison Pages to Create:**
1. Radly vs. Dragon Medical
2. Radly vs. Nuance PowerScribe
3. Radly vs. Generic AI tools

**Expected Keywords:** "best radiology reporting software," "medical dictation software comparison"

---

### 2.5 Update Existing Pages with Internal Links

**Strategy:** Add contextual internal links from blog posts and resource pages to:
- Homepage
- Pricing
- Validation
- Security
- Instructions

**Example Link Insertion in Blog Post:**

```markdown
# Voice Transcription in Radiology

"...our platform uses AI to transcribe findings with [95%+ accuracy](https://radly.app/validation)..."

"...keeping data secure with [AES-256 encryption](https://radly.app/security)..."

"...across all [predefined templates](https://radly.app/app/templates)..."

"...get started with [5 free reports](https://radly.app/pricing)..."
```

**Expected Impact:** ✓ Improved PageRank distribution, better crawl depth

---

**Phase 2 Summary:**
- ⏱️ **Time Investment:** 30-40 hours
- 📊 **Expected Impact:** +30-50% organic traffic (within 3 months as content indexes)
- 🎯 **Completion:** Week 2-3
- ✅ **Content Needed:** 5 blog posts (outsource or write in-house), design (can use templates)

---

## PHASE 3: TECHNICAL SEO OPTIMIZATION (Week 2-3 Parallel - Implementation Time: 20-25 hours)

### 3.1 Enhanced Sitemap Generation

**Current Issue:** Static sitemap with only 8 URLs, regenerates on every build

**Implementation:**

#### A. Update `src/app/sitemap.ts`
**Current Code:** Lines 1-15

**New Implementation:**

```typescript
import { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/siteConfig'

export const revalidate = 86400 // Revalidate daily

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url

  // Static marketing pages with specific priorities
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date('2025-11-07'),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date('2025-11-07'),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/validation`,
      lastModified: new Date('2025-11-05'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/security`,
      lastModified: new Date('2025-11-07'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/instructions`,
      lastModified: new Date('2025-11-05'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/templates`,
      lastModified: new Date('2025-11-07'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date('2025-11-07'),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date('2025-11-07'),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/use-cases`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  // Dynamic blog posts (fetch from CMS or file system)
  const blogPosts: MetadataRoute.Sitemap = [
    // These would be fetched from your blog data source
    {
      url: `${baseUrl}/blog/structured-radiology-reporting`,
      lastModified: new Date('2025-11-07'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/voice-transcription-radiology`,
      lastModified: new Date('2025-11-07'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // ... more blog posts
  ]

  // Dynamic feature pages
  const featurePages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/features/voice-input`,
      lastModified: new Date('2025-11-07'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/features/structured-reports`,
      lastModified: new Date('2025-11-07'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  return [...staticPages, ...blogPosts, ...featurePages]
}
```

**Expected Impact:** ✓ Sitemap now includes all content, more frequent crawl signals

---

### 3.2 Implement Canonical Tags Per Page

**Current State:** Relies on root layout default

**Implementation:**

```typescript
// Add to each page.tsx metadata export:

export const metadata: Metadata = {
  title: "...",
  description: "...",
  alternates: {
    canonical: "https://radly.app/pricing" // Page-specific
  },
  // ... rest of metadata
}
```

**Files to Update:**
- `src/app/pricing/page.tsx`
- `src/app/blog/[slug]/page.tsx`
- All new pages created in Phase 2

**Expected Impact:** ✓ Prevents canonical tag duplicates, clearer for multi-variant pages

---

### 3.3 Add Robots Meta Tags Where Needed

**Implementation:**

```typescript
// For pages that should NOT be indexed (if any):
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  }
}

// For pages with crawl directives:
export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  }
}
```

---

### 3.4 Implement Image Alt Text Strategy

**Current Issue:** Images lack descriptive alt text

**Implementation Plan:**

```typescript
// Example for homepage hero image:
<Image
  src="/images/hero-voice-assistant.png"
  alt="Radiologist using Radly voice-supported AI assistant to generate structured report in under 2 minutes"
  width={1200}
  height={630}
  priority
/>

// OG Images must have alt text:
images: [
  {
    url: "https://radly.app/og-images/security.png",
    width: 1200,
    height: 630,
    alt: "Radly security controls: AES-256 encryption, TLS 1.2+, role-based access, audit logs"
  }
]
```

**Expected Impact:** ✓ Better image SEO, improved accessibility

---

### 3.5 Implement Preload & Prefetch Hints

**File:** `src/app/layout.tsx`

```typescript
// Add to head/metadata:
const preloadHints = [
  {
    rel: "preload",
    as: "image",
    href: "/og-default.png",
    type: "image/png"
  },
  {
    rel: "prefetch",
    href: "/pricing",
  },
  {
    rel: "dns-prefetch",
    href: "https://s3.radly.app"
  }
]
```

**Expected Impact:** ✓ Faster page loads, better Core Web Vitals

---

### 3.6 Core Web Vitals Monitoring

**Current State:** PerformanceMonitor component exists but minimal tracking

**Enhancement:** Create detailed CWV dashboard

```typescript
// src/lib/performance-tracking.ts
export function trackWebVitals() {
  // LCP (Largest Contentful Paint)
  // FID/INP (First Input Delay / Interaction to Next Paint)
  // CLS (Cumulative Layout Shift)
  // FCP (First Contentful Paint)
  // TTFB (Time to First Byte)

  // Send to Google Analytics
}
```

**Expected Impact:** ✓ Monitor and improve page speed, positively impact rankings

---

**Phase 3 Summary:**
- ⏱️ **Time Investment:** 20-25 hours
- 📊 **Expected Impact:** Better crawlability, improved Core Web Vitals, +5-10% ranking boost
- 🎯 **Completion:** Week 2-3 (parallel with Phase 2)

---

## PHASE 4: CONTENT STRATEGY & PROMOTION (Week 4+ - Ongoing)

### 4.1 Content Calendar & Blog Strategy

**Monthly Blog Post Schedule:**

| Month | Post 1 | Post 2 | Post 3 |
|-------|--------|--------|--------|
| Dec 2025 | "AI Safety in Radiology" | "Workflow Optimization" | "Compliance Guide" |
| Jan 2026 | "Voice vs. Typing" | "Template Strategies" | "PACS Integration" |
| Feb 2026 | "Case Study: Large Hospital" | "Emerging Radiology Tech" | "Cost-Benefit Analysis" |

**Content Mix:**
- 40% Educational (how-tos, guides)
- 30% Thought Leadership (trends, opinions)
- 20% Product-Focused (features, use cases)
- 10% Case Studies & Customer Stories

---

### 4.2 Link Building Strategy

**Internal Linking (Already Covered in Phase 2)**

**External Link Opportunities:**
1. Healthcare technology publications
   - MedTech Today
   - Healthcare IT News
   - Radiology Business Journal
2. Industry forums & communities
   - Radiology subreddits
   - LinkedIn radiology groups
   - Healthcare technology forums
3. Guest posting opportunities
   - Tech blogs covering healthcare
   - Radiology professional publications
4. Resource pages
   - Healthcare software lists
   - AI tool directories
   - Radiology resource sites

**Strategy:**
- Quarter 1: 4-6 backlinks from DR 40+
- Quarter 2: 8-10 backlinks from DR 50+
- Ongoing: Monitor brand mentions for link opportunities

---

### 4.3 Social Sharing & Promotion

**Leverage created content:**
- Twitter/X threads about blog posts
- LinkedIn articles (republish summaries)
- Healthcare community sharing
- Email newsletter (if applicable)

---

## IMPLEMENTATION TIMELINE & RESOURCE ALLOCATION

### Week 1: Phase 1 (Quick Wins)
- **Time:** 15-20 hours
- **Resources:** 1 Developer (SEO-focused)
- **Tasks:**
  - Add JSON-LD schemas (Organization, Article, FAQ, Pricing)
  - Complete missing page metadata
  - Create OG images (can outsource to designer)
  - Update meta descriptions
- **Deliverable:** All public pages have complete, optimized metadata

### Week 2-3: Phase 2 & Phase 3 (Content + Technical)
- **Time:** 50-65 hours
- **Resources:**
  - 1 Developer (technical implementation)
  - 1 Content Writer (blog posts, copy)
  - 1 Designer (OG images, graphics)
- **Tasks:**
  - Create blog architecture
  - Write 5 initial blog posts
  - Create feature pages, use case pages, comparison pages
  - Enhance sitemap
  - Add canonical tags, robots meta, alt text
  - Core Web Vitals monitoring setup
- **Deliverable:** Blog/resources section live, enhanced technical SEO

### Week 4+: Phase 4 (Ongoing)
- **Time:** 10-15 hours/month
- **Resources:**
  - 1 Content Writer (2 blog posts/month)
  - 1 Coordinator (link building, promotion)
  - 1 Developer (maintenance, monitoring)
- **Tasks:**
  - Monthly blog posts
  - Link building outreach
  - Monitor rankings & traffic
  - Update existing content
  - Core Web Vitals monitoring
- **Deliverable:** Consistent SEO growth

---

## SUCCESS METRICS & MONITORING

### Phase 1 Completion Metrics (Week 1)
- ✓ All pages have complete metadata
- ✓ 8+ JSON-LD schemas implemented
- ✓ OG images created for all main pages
- ✓ Zero metadata validation errors (test with Google Rich Results Test)

### Phase 2 Completion Metrics (Week 3)
- ✓ 5 blog posts published and indexed
- ✓ 3+ feature/use case pages live
- ✓ 2+ comparison pages created
- ✓ Blog achieving 500+ organic impressions/week within 4 weeks

### Phase 3 Completion Metrics (Week 3)
- ✓ Sitemap includes 40+ URLs (from 8)
- ✓ Core Web Vitals: LCP <2.5s, CLS <0.1, INP <200ms
- ✓ 100+ page crawled by Google (from 8)

### Phase 4 Ongoing Metrics (Monthly)
- **Organic Traffic:** Track month-over-month growth
  - Target: 20% MoM growth for first 3 months
  - Target: 10% MoM growth for months 4-12
- **Keyword Rankings:**
  - Track 20+ primary keywords
  - Target: 50+ keywords in top 100 by month 3
  - Target: 20+ keywords in top 20 by month 6
- **Blog Performance:**
  - Track: views, avg. session duration, bounce rate
  - Target: 2,000+ blog views/month by month 3
  - Target: 80+ avg. read time per session
- **Backlinks:**
  - Target: 4-6 new backlinks/month from DR 40+
- **Conversion Metrics:**
  - Track: "Get Started Free" clicks from organic traffic
  - Monitor: email signups, trial signups from blog

### Tools for Monitoring
- **Google Search Console:** Rankings, impressions, CTR, crawl errors
- **Google Analytics 4:** Traffic, user behavior, goals
- **Ahrefs/SEMrush:** Keyword tracking, backlink monitoring, competitor analysis
- **Lighthouse:** Core Web Vitals continuous monitoring
- **Screaming Frog:** Sitemap audits, technical SEO crawls

---

## INVESTMENT SUMMARY

### Phase 1 (Week 1)
| Item | Effort | Cost | Notes |
|------|--------|------|-------|
| JSON-LD schemas | 6 hours | Internal | Developer time |
| Metadata completion | 4 hours | Internal | Developer time |
| OG images (6 images) | 8 hours | $150-300 | Designer/Canva Pro |
| **Phase 1 Total** | **18 hours** | **$150-300** | **1 week** |

### Phase 2 (Weeks 2-3)
| Item | Effort | Cost | Notes |
|------|--------|------|-------|
| Blog architecture setup | 6 hours | Internal | Developer time |
| Blog posts (5 × 500 words each) | 25 hours | $500-1000 | $100-200/post or internal |
| Feature/use case pages (4) | 12 hours | Internal | Internal development |
| Comparison pages (2) | 8 hours | Internal | Internal development |
| Graphics/images | 8 hours | $200-400 | Designer time |
| **Phase 2 Total** | **59 hours** | **$700-1400** | **2 weeks** |

### Phase 3 (Weeks 2-3, Parallel)
| Item | Effort | Cost | Notes |
|------|--------|------|-------|
| Sitemap enhancement | 4 hours | Internal | Developer time |
| Canonical tags + robots | 3 hours | Internal | Developer time |
| Alt text implementation | 3 hours | Internal | Developer time |
| CWV monitoring setup | 6 hours | Internal | Developer time |
| Testing & validation | 4 hours | Internal | Developer time |
| **Phase 3 Total** | **20 hours** | **Internal** | **Parallel with Phase 2** |

### Phase 4 (Ongoing)
| Item | Monthly Cost | Notes |
|------|--------------|-------|
| Blog posts (2/month) | $200-400 | Or internal |
| Link building/outreach | $0-300 | Mostly outreach, occasional paid |
| Monitoring/analysis | 5 hours internal | Track metrics, adjust strategy |
| **Phase 4 Monthly** | **$200-700** | **Ongoing** |

### Total Investment (3 months)
- **Developer Time:** 97 hours (~$2,900 @ $30/hr)
- **Content Writing:** 25 hours (~$750 @ $30/hr) or $500-1000 outsourced
- **Design/Graphics:** 16 hours (~$480 @ $30/hr) or $350-700 outsourced
- **External Services:** $0-1400 (optional: link building, SEO tools)
- **Total:** **$4,000-6,500** (or $2,900 if fully internal)
- **ROI:** Expected 40-60% organic traffic increase within 6 months

---

## RISK MITIGATION & CONTINGENCIES

### Risk 1: Blog Content Not Indexing
**Mitigation:**
- Submit sitemap to Google Search Console weekly (first month)
- Manually submit new blog posts to GSC
- Ensure no robots.txt or meta robots blocking
- Check for canonicalization issues

### Risk 2: Core Web Vitals Degradation
**Mitigation:**
- Monitor CWV weekly
- Implement performance budgets
- Lazy load blog images
- Use Next.js Image optimization aggressively

### Risk 3: Internal Linking Creating Crawl Issues
**Mitigation:**
- Keep link anchor text natural and varied
- Avoid over-linking (max 10-15 links per post)
- Use proper heading hierarchy
- Test with Screaming Frog regularly

### Risk 4: Duplicate Content with Comparison Pages
**Mitigation:**
- Each comparison page uses unique content
- Use rel=canonical on all variants
- Link between related comparison pages
- Structure comparison content uniquely (not just copied)

---

## SUCCESS CRITERIA FOR GO/NO-GO DECISION

### Must Have (Week 3)
- ✅ All Phase 1 items complete (metadata, schemas, images)
- ✅ 5 blog posts published and live
- ✅ No Core Web Vitals degradation
- ✅ Sitemap includes 40+ URLs
- ✅ Google Search Console shows improved impressions/CTR

### Should Have (Month 1)
- ✅ Blog achieving 500+/week impressions
- ✅ 2+ blog posts ranking in top 100 for target keyword
- ✅ 50%+ increase in pages indexed (from 8 to 40+)

### Nice to Have (Month 3)
- ✅ 5-10 new backlinks acquired
- ✅ 20+ keywords ranking in top 100
- ✅ 30%+ increase in organic traffic

---

## RECOMMENDATIONS FOR IMMEDIATE ACTION

### Today (Before Week 1)
1. **Review this plan with team** ✓
2. **Approve Phase 1 scope**
3. **Assign resources:**
   - Developer (SEO-focused)
   - Designer (OG images)
4. **Set up monitoring:**
   - Create GSC property (if not exists)
   - Create GA4 account (if not exists)
   - Set up keyword tracking tool

### Week 1 Priorities
1. Complete JSON-LD schemas (highest impact)
2. Update missing page metadata
3. Create custom OG images
4. Submit updated sitemap to GSC

### Communication
- Update sitemap in robots.txt (already correct)
- Announce blog section in social media
- Prepare press release for Phase 2 launch

---

## CONCLUSION

This SEO enhancement plan provides a **structured, phased approach** to growing Radly's organic visibility. The investment is modest (~$4-6K over 3 months), the implementation is straightforward, and the expected ROI is significant (40-60% organic traffic increase).

**Key Success Factors:**
1. Commitment to consistent blog publishing (Phase 4)
2. Focus on quality over quantity (5-8 posts first, then evaluate)
3. Regular monitoring and optimization (monthly reviews)
4. Internal linking discipline (contextual, not forced)

**Recommended Start Date:** Immediately
**Expected Results Timeline:**
- Quick wins visible: Week 3-4
- Meaningful impact: Month 2-3
- Sustained growth: Month 4+

---

## APPENDIX: CONTENT TOPIC IDEAS (Extended List)

### Blog Posts
1. "Complete Guide to Structured Radiology Reporting" - 2,500 words
2. "Voice Documentation in Radiology: Accuracy & Compliance" - 2,000 words
3. "AI in Radiology: Safety, Validation, and Workflow Integration" - 2,200 words
4. "HIPAA Compliance for Radiology Software: A Complete Checklist" - 2,000 words
5. "5 Workflow Optimization Tips for Radiology Departments" - 1,800 words
6. "Radiology Report Templates: Best Practices and Standards" - 1,900 words
7. "The Future of Radiology: AI Assistants and Clinical Workflows" - 2,100 words
8. "Vendor Security Evaluation: What Radiology Teams Need to Know" - 1,800 words
9. "Transitioning from Dictation to AI-Assisted Reporting" - 2,000 words
10. "Patient Privacy in the Age of AI: How Modern Platforms Protect Data" - 1,900 words

### Case Studies / Success Stories
1. "How Hospital X Reduced Report Turnaround Time by 40%" - 1,500 words
2. "Case Study: Implementing Radly in a Multi-Site Radiology Network" - 1,800 words
3. "Financial Impact: ROI of Modern Radiology Documentation" - 1,600 words

### Product Deep-Dives
1. "Voice Input Explained: How Radly's Transcription Works"
2. "Template Library: Pre-built Report Structures"
3. "DOCX Export and EHR Integration"
4. "Validation Testing: How We Ensure Accuracy"

### Comparison Articles
1. "Radly vs. Traditional Medical Dictation"
2. "Radly vs. Dragon Medical One"
3. "Radly vs. Generic AI Tools: What's Different"
4. "Radiology Software Comparison: Feature Matrix"

### Educational Resources (Evergreen)
1. "How to Write Better Radiology Reports" - Beginner's guide
2. "Radiology Terminology: A Practical Guide" - Reference
3. "HL7 and DICOM: Understanding Healthcare Data Standards" - Technical
4. "ACR Standards for Radiology Reporting" - Compliance

---

**Document Version:** 1.0
**Last Updated:** November 7, 2025
**Status:** Ready for Review
**Next Step:** Team approval and resource allocation
