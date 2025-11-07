# ✅ SEO ENHANCEMENT PLAN - IMPLEMENTATION CHECKLIST

## PHASE 1: QUICK WINS (Week 1)

### A. JSON-LD Structured Data Implementation

#### A1. Organization Schema (Root Layout)
**File:** `src/app/layout.tsx`
**Target:** Lines 40-60 (in metadata object) + before closing head

- [ ] Add Organization schema JSON-LD
- [ ] Include: name, URL, logo, description
- [ ] Add contactPoint (email, support)
- [ ] Add sameAs (social links)
- [ ] Test with Google Rich Results Test
- [ ] Verify in page source

**Code Pattern:**
```typescript
const organizationSchema = { /* ... */ }
<script id="organization-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
```

#### A2. Article Schema for Content Pages
**Files:**
- [ ] `src/app/validation/page.tsx`
- [ ] `src/app/security/page.tsx`
- [ ] `src/app/instructions/page.tsx` (add to existing)

- [ ] Add Article schema to each
- [ ] Include: headline, description, author, datePublished, image
- [ ] Link to page-specific OG image
- [ ] Test with Rich Results Test

#### A3. FAQPage Schema
**File:** `src/app/instructions/page.tsx`

- [ ] Extract FAQ items from page content
- [ ] Create FAQPage schema with 5-7 Q&A items
- [ ] Ensure clear question/answer text
- [ ] Test schema formatting

#### A4. Pricing/ProductCollection Schema
**File:** `src/app/pricing/page.tsx`

- [ ] Create ProductCollection schema
- [ ] List each plan (Free, Starter, Professional, Premium)
- [ ] Add offers with currency-specific pricing (EGP, USD)
- [ ] Include availability status
- [ ] Link to checkout URLs

#### A5. BreadcrumbList Schema
**File:** `src/app/layout.tsx` or `src/components/layout/Navigation.tsx`

- [ ] Create dynamic breadcrumb schema
- [ ] Include for all pages (Home > Current Page)
- [ ] Add position attributes
- [ ] Test in Rich Results Test

---

### B. Complete Missing Page Metadata

#### B1. Validation Page Metadata
**File:** `src/app/validation/page.tsx`

Current metadata (lines 11-18):
```typescript
export const metadata: Metadata = {
  title: "Validation | Radly internal testing overview | Radly Assistant",
  description: "Radly validation summary covering datasets, transcription accuracy, workflow timing, and limitations.",
}
```

- [ ] Add OpenGraph metadata
- [ ] Add Twitter card metadata
- [ ] Create custom OG image reference
- [ ] Add Article schema (see A2)
- [ ] Update description for keyword optimization

**New Metadata:**
```typescript
export const metadata: Metadata = {
  title: "Validation | Radly internal testing overview | Radly Assistant",
  description: "Review Radly's validation testing with 180 anonymized cases. Median draft time under 2 minutes. Full methodology transparency including limitations.",
  openGraph: {
    title: "How Radly Validates Assistant Accuracy",
    description: "Internal testing methodology for radiology report generation assistant",
    url: "https://radly.app/validation",
    type: "article",
    images: [{
      url: "https://radly.app/og-images/validation.png",
      width: 1200,
      height: 630,
      alt: "Radly Validation Testing Data"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Radly Validation: Real Testing Data",
    description: "How we validate radiology report generation accuracy"
  }
}
```

#### B2. Security Page Metadata
**File:** `src/app/security/page.tsx`

Current metadata (lines 29-36): Incomplete

- [ ] Add full metadata with title template
- [ ] Add OpenGraph metadata
- [ ] Add Twitter card
- [ ] Create security-focused OG image reference
- [ ] Keyword optimization: encryption, compliance, security

**New Metadata:**
```typescript
export const metadata: Metadata = {
  title: "Security | Radly controls and safeguards | Radly Assistant",
  description: "Enterprise-grade security controls. TLS 1.2+ encryption, AES-256 at-rest, role-based access, SSO, 90-day audit logs. HIPAA-ready architecture.",
  openGraph: {
    title: "Radly Security & Compliance",
    description: "How Radly protects sensitive clinical data with enterprise security controls",
    url: "https://radly.app/security",
    type: "article",
    images: [{
      url: "https://radly.app/og-images/security.png",
      width: 1200,
      height: 630,
      alt: "Radly Security Controls"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Radly Security & Data Protection",
    description: "Enterprise security controls for healthcare data"
  }
}
```

#### B3. Terms Page Metadata
**File:** `src/app/terms/page.tsx`

Current: Minimal metadata

- [ ] Add full metadata export
- [ ] Add OpenGraph (basic)
- [ ] Add Twitter card (basic)

**New Metadata:**
```typescript
export const metadata: Metadata = {
  title: "Terms of Service | Radly Assistant",
  description: "Radly Assistant Terms of Service. Legal conditions for using our voice-supported radiology reporting platform.",
  openGraph: {
    title: "Radly Assistant - Terms of Service",
    url: "https://radly.app/terms",
    type: "website"
  },
  twitter: {
    card: "summary"
  }
}
```

#### B4. Privacy Page Metadata
**File:** Check if at `/app/privacy/page.tsx` or `/legal/privacy`

- [ ] If at `/legal/privacy`: Create `/app/privacy/page.tsx` with full metadata
- [ ] If at `/app/privacy`: Add missing metadata
- [ ] Add OpenGraph metadata
- [ ] Add Twitter card
- [ ] Keyword focus: "GDPR," "CCPA," "privacy policy," "data protection"

**Metadata:**
```typescript
export const metadata: Metadata = {
  title: "Privacy Policy | Radly Assistant",
  description: "Radly's privacy policy. Learn how we collect, use, and protect your data in compliance with GDPR, CCPA, and healthcare regulations.",
  openGraph: {
    title: "Radly Privacy Policy",
    description: "How Radly handles your data and protects privacy",
    url: "https://radly.app/privacy",
    type: "website"
  }
}
```

---

### C. Create Custom OG Images

**Requirement:** 6 custom OG images (1200x630px each)

| Page | Filename | Content Focus | Status |
|------|----------|----------------|--------|
| Home | og-images/home.png | Workflow steps, value prop | [ ] Design |
| Pricing | og-images/pricing.png | Plan comparison, pricing visual | [ ] Design |
| Instructions | og-images/instructions.png | 4-step workflow | [ ] Design |
| Validation | og-images/validation.png | Data/metrics, testing | [ ] Design |
| Security | og-images/security.png | Lock/shield, compliance | [ ] Design |
| Blog | og-images/blog.png | Blog launch, content hub | [ ] Design |

**Folder:** Create `/public/og-images/` directory

- [ ] Create `/public/og-images/` directory
- [ ] Design 6 images (1200x630px, PNG)
- [ ] Optimize for social sharing
- [ ] Add alt text to all image references
- [ ] Deploy to public folder

**Designer Brief:**
- Brand colors: #2653FF, #4B8EFF, #8F82FF
- Dark background: #0D2240
- Font: Inter
- Style: Modern, clean, healthcare-focused
- Include Radly logo
- Each image should be unique and reflect page topic

---

### D. Optimize Meta Descriptions

**Current Issues:** Generic/repetitive descriptions

**Files to Update:**

#### D1. Homepage
**File:** `src/app/page.tsx`
Current: "Radly is a voice-supported assistant..."

**New:** (Optimize for CTR)
"Radly: Voice-supported AI assistant for structured radiology reporting. Draft reports in under 2 minutes. HIPAA-ready. Try 5 free reports today."

#### D2. Pricing Page
**File:** `src/app/pricing/page.tsx`

**New:**
"Compare Radly's radiology reporting plans. From free (5 reports) to premium (300/month). EGP and USD pricing. Enterprise security included."

#### D3. Instructions Page
**File:** `src/app/instructions/page.tsx`

**New:**
"Learn how to use Radly in 4 simple steps. Voice capture → AI structuring → Review → Export. Median time: 2 minutes per report."

#### D4. Validation Page (Already in B1)
**New:** (Incorporate technical details)
"Radly validation testing: 180 anonymized cases, <2min median draft time, full methodology. See how we ensure accuracy and clinical relevance."

#### D5. Security Page (Already in B2)
**New:** (Emphasize trust signals)
"Enterprise-grade security: AES-256 encryption, TLS 1.2+, role-based access, SSO, 90-day audit logs. HIPAA-ready infrastructure."

---

### E. Testing & Validation (Phase 1)

- [ ] Test all pages with Google Rich Results Test (https://search.google.com/test/rich-results)
- [ ] Validate metadata format with SEO tools
- [ ] Screenshot results for documentation
- [ ] Check each page's source for proper JSON-LD
- [ ] Verify OG images display correctly on social media
- [ ] Test with Facebook Debugger (https://developers.facebook.com/tools/debug/)
- [ ] Test with Twitter Card Validator (https://cards-dev.twitter.com/validator)

---

## PHASE 2: CONTENT EXPANSION (Weeks 2-3)

### A. Create Blog Architecture

#### A1. Create Directory Structure
**Base Location:** `src/app/blog/`

- [ ] Create `blog/page.tsx` (blog index)
- [ ] Create `blog/[slug]/page.tsx` (individual posts)
- [ ] Create `blog/layout.tsx` (blog layout)
- [ ] Create `blog/posts/` directory for MDX files
- [ ] Create `blog/utils/getBlogPosts.ts` (post fetching logic)
- [ ] Create `blog/components/` directory for blog-specific components

**Directory Tree:**
```
src/app/blog/
├── page.tsx              # Blog index/archive
├── layout.tsx            # Blog layout
├── [slug]/
│   └── page.tsx         # Individual post template
├── posts/
│   ├── post-1.mdx
│   ├── post-2.mdx
│   └── ...
├── utils/
│   └── getBlogPosts.ts  # Fetch/parse posts
└── components/
    ├── PostCard.tsx
    └── BlogSidebar.tsx
```

#### A2. Create Blog Index Page
**File:** `src/app/blog/page.tsx`

- [ ] Add metadata (title, description, OpenGraph)
- [ ] Create layout with sidebar
- [ ] Display all blog posts with cards
- [ ] Include: title, excerpt, date, category, read time
- [ ] Add category filter (optional)
- [ ] Add featured image to each post preview
- [ ] Add "Read More" links to individual posts

**Metadata:**
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
}
```

#### A3. Create Dynamic Post Template
**File:** `src/app/blog/[slug]/page.tsx`

- [ ] Create template that accepts slug parameter
- [ ] Fetch post metadata from MDX file
- [ ] Generate dynamic metadata based on post
- [ ] Display post content (title, date, author, category, content)
- [ ] Add featured image
- [ ] Add reading time estimate
- [ ] Add table of contents (optional)
- [ ] Add "related posts" section
- [ ] Add author bio
- [ ] Add CTA at bottom (link to pricing/signup)

**Dynamic Metadata Pattern:**
```typescript
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug)

  return {
    title: `${post.title} | Radly Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://radly.app/blog/${params.slug}`,
      type: "article",
      images: [{ url: post.ogImage, width: 1200, height: 630 }],
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author]
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description
    }
  }
}
```

#### A4. Create Blog Layout
**File:** `src/app/blog/layout.tsx`

- [ ] Add sidebar with recent posts
- [ ] Add category list
- [ ] Add newsletter signup (optional)
- [ ] Add search functionality (optional)
- [ ] Consistent styling with main site

---

### B. Write & Publish 5 Initial Blog Posts

#### B1. Post 1: "Complete Guide to Structured Radiology Reporting"
**File:** `src/app/blog/posts/structured-radiology-reporting.mdx`
**Slug:** `structured-radiology-reporting`
**Keywords:** structured radiology, reporting standards, clinical documentation
**Length:** 2,500+ words
**Publish:** Week 2, Day 1

- [ ] Write content (target keywords)
- [ ] Create featured image (1200x630px)
- [ ] Add alt text to images
- [ ] Include schema: Article + FAQ
- [ ] Add internal links (5-7 to main pages)
- [ ] Publish and test

**Content Outline:**
```
1. Introduction (250 words)
2. What is Structured Reporting? (400 words)
   - Definition, why it matters
3. Benefits of Structured Reports (500 words)
   - Efficiency, accuracy, compliance
4. Common Radiology Report Templates (600 words)
   - Chest, abdominal, neuro examples
5. Best Practices (500 words)
   - Template design, standardization
6. Radly's Structured Templates (300 words)
   - Feature highlight
7. Implementation Checklist (250 words)
8. FAQs (300 words)
```

**CTA:** Link to templates page, pricing, free trial

#### B2. Post 2: "Voice Transcription in Radiology: Accuracy, Compliance & Workflow Benefits"
**File:** `src/app/blog/posts/voice-transcription-radiology.mdx`
**Slug:** `voice-transcription-radiology`
**Keywords:** voice documentation, medical transcription, voice assistant
**Length:** 2,000+ words
**Publish:** Week 2, Day 3

- [ ] Write content
- [ ] Create featured image
- [ ] Add schema: Article
- [ ] Include accuracy/compliance data (cite Radly validation)
- [ ] Add internal links (validation page, features)
- [ ] Publish and test

**Content Outline:**
```
1. Introduction (250 words)
2. History of Voice in Radiology (350 words)
3. How Voice Transcription Works (450 words)
   - Technology, AI, accuracy
4. HIPAA & Compliance Requirements (400 words)
5. Accuracy Rates & Testing (350 words)
   - Reference Radly validation
6. Workflow Integration (300 words)
7. Voice vs. Typing vs. Dictation (400 words)
   - Comparison table
8. FAQs (200 words)
```

**CTA:** Link to validation page, feature page

#### B3. Post 3: "AI in Radiology: Assistants, Safety, and the Role of Human Review"
**File:** `src/app/blog/posts/ai-radiology-human-review.mdx`
**Slug:** `ai-radiology-human-review`
**Keywords:** AI radiology, medical AI safety, clinical decision support
**Length:** 2,200+ words
**Publish:** Week 3, Day 1

- [ ] Write content
- [ ] Create featured image
- [ ] Add schema: Article + FAQ
- [ ] Emphasize human review importance
- [ ] Add internal links (validation, security)
- [ ] Publish and test

**Content Outline:**
```
1. Introduction (250 words)
2. Current State of AI in Radiology (400 words)
3. How AI Assistants Work (500 words)
4. Safety & Validation Requirements (450 words)
   - Reference Radly validation
5. Regulatory Landscape (350 words)
6. Why Human Review is Essential (400 words)
7. Future of Radiology AI (300 words)
8. FAQs (350 words)
```

**CTA:** Link to validation page, security page

#### B4. Post 4: "HIPAA Compliance & Data Security in Radiology Software"
**File:** `src/app/blog/posts/hipaa-compliance-radiology.mdx`
**Slug:** `hipaa-compliance-radiology`
**Keywords:** HIPAA radiology, medical data security, healthcare compliance
**Length:** 2,000+ words
**Publish:** Week 3, Day 2

- [ ] Write content
- [ ] Create featured image
- [ ] Add schema: Article
- [ ] Emphasize security controls
- [ ] Add internal links (security page, privacy page)
- [ ] Include compliance checklist
- [ ] Publish and test

**Content Outline:**
```
1. Introduction (250 words)
2. HIPAA Requirements (400 words)
3. Common Security Gaps (350 words)
4. Encryption & Access Controls (450 words)
5. Audit Logs & Monitoring (350 words)
6. Vendor Security Evaluation (400 words)
   - What to look for
7. Security Compliance Checklist (250 words)
8. FAQs (250 words)
```

**CTA:** Link to security page, compliance info

#### B5. Post 5: "5 Workflow Optimization Tips for Radiology Departments"
**File:** `src/app/blog/posts/workflow-optimization-radiology.mdx`
**Slug:** `workflow-optimization-radiology`
**Keywords:** radiology workflow, reporting efficiency, radiology optimization
**Length:** 1,800+ words
**Publish:** Week 3, Day 3

- [ ] Write content
- [ ] Create featured image
- [ ] Add schema: Article
- [ ] Make actionable and practical
- [ ] Add internal links (features, use cases)
- [ ] Publish and test

**Content Outline:**
```
1. Introduction (250 words)
2. Tip 1: Voice-First Documentation (350 words)
3. Tip 2: Template Standardization (350 words)
4. Tip 3: Batch Reporting Strategies (300 words)
5. Tip 4: AI-Assisted Review (350 words)
6. Tip 5: Integration & Automation (300 words)
7. Implementation Timeline (250 words)
8. FAQs (200 words)
```

**CTA:** Link to templates, Radly features

---

### C. Create Feature Deep-Dive Pages

#### C1. Voice Input Feature Page
**File:** `src/app/features/voice-input/page.tsx`
**Keywords:** voice input, medical voice recognition, hands-free documentation
**Length:** 1,500+ words

- [ ] Create page and metadata
- [ ] Add OpenGraph metadata
- [ ] Include schema: Article
- [ ] Content: problem → solution → benefits → how it works → accuracy data
- [ ] Add feature video/demo (if available)
- [ ] Add CTAs (free trial, templates)
- [ ] Internal links to blog posts, validation

**Metadata:**
```typescript
export const metadata: Metadata = {
  title: "Voice Input for Radiology Reports | Radly Assistant",
  description: "Hands-free voice transcription for radiology reports. Capture findings naturally. Integrates with structured templates. Sub-2min median draft time.",
  openGraph: {
    title: "Voice-Supported Radiology Reporting",
    description: "Capture findings naturally with voice. AI transcription and structuring.",
    url: "https://radly.app/features/voice-input",
    type: "article"
  }
}
```

#### C2. Structured Reports Feature Page
**File:** `src/app/features/structured-reports/page.tsx`
**Keywords:** structured reports, report templates, clinical documentation
**Length:** 1,500+ words

- [ ] Create page and metadata
- [ ] Add OpenGraph metadata
- [ ] Add schema: Article
- [ ] Content: benefits → features → templates → customization
- [ ] Show example report structure
- [ ] Add CTA: view templates, free trial
- [ ] Internal links to blog posts

#### C3. Export Formats Feature Page
**File:** `src/app/features/export-formats/page.tsx`
**Keywords:** DOCX export, report export, medical report formatting
**Length:** 1,200+ words

- [ ] Create page and metadata
- [ ] Content: supported formats, export process, integrations
- [ ] Add screenshot of export options
- [ ] CTA: try export feature, free trial

#### C4. Templates Feature Page
**File:** `src/app/features/templates/page.tsx`
**Keywords:** report templates, radiology templates, template library
**Length:** 1,500+ words

- [ ] Create page and metadata
- [ ] Showcase 5-8 template examples
- [ ] Content: template library, customization, modality-specific templates
- [ ] Add template preview images
- [ ] CTA: browse templates, free trial

---

### D. Create Use Cases Hub

#### D1. Use Cases Index Page
**File:** `src/app/use-cases/page.tsx`

- [ ] Create index listing 5-6 radiology modalities
- [ ] Each with brief description and link to detail page
- [ ] Add metadata and schema

**Modalities to Cover:**
- [ ] Chest Radiography
- [ ] Abdominal Imaging
- [ ] Neuroradiology
- [ ] Musculoskeletal Imaging
- [ ] Cardiac Imaging
- [ ] General Radiography

#### D2. Individual Use Case Pages
**Files:** `src/app/use-cases/[modality]/page.tsx`

For each modality:
- [ ] Create page with title, description, specific pain points
- [ ] Explain how Radly helps with that modality
- [ ] Feature templates available
- [ ] Add CTA: try templates, sign up
- [ ] Include relevant keywords

**Example: Chest Radiography**
- Pain points: high volume, repetitive findings
- Solution: voice-first documentation, templates
- Templates available: chest PA, chest lateral, portable chest
- CTA: "Try Radly's chest templates free"

---

### E. Create Comparison Pages

#### E1. Comparison Index Page
**File:** `src/app/comparison/page.tsx`

- [ ] List all comparison pages available
- [ ] Brief intro to why comparisons matter
- [ ] Links to each comparison

#### E2. Comparison Page Examples
**Files:** `src/app/comparison/[comparison]/page.tsx`

Create pages for:
- [ ] Radly vs. Traditional Dictation
- [ ] Radly vs. Dragon Medical
- [ ] Radly vs. Generic AI Tools

**Content Structure:**
- Accuracy & testing
- Speed & efficiency
- Cost analysis
- Integration capabilities
- Compliance features
- Learning curve
- Comparison table
- FAQ addressing objections

**Example: Radly vs. Dragon Medical**

Metadata:
```typescript
title: "Radly vs. Dragon Medical One | Comparison",
description: "Compare Radly and Dragon Medical One. Voice accuracy, speed, cost, compliance, integration. Side-by-side feature comparison."
```

Content sections:
- Voice accuracy & AI technology
- Integration with PACS/EHR
- Pricing comparison (cost per report)
- Setup & learning curve
- Support & training
- Compliance certifications
- Feature comparison table

---

### F. Build Internal Linking Strategy

#### F1. Update Blog Posts
For each blog post, add 5-7 internal links:

- [ ] Post 1 (Structured Reporting) → Link to: templates page, pricing, instructions
- [ ] Post 2 (Voice Transcription) → Link to: voice feature page, validation, pricing
- [ ] Post 3 (AI Safety) → Link to: validation page, security page
- [ ] Post 4 (HIPAA Compliance) → Link to: security page, privacy page
- [ ] Post 5 (Workflow Optimization) → Link to: templates, features, use cases

#### F2. Homepage Enhancements
- [ ] Add blog link in navigation
- [ ] Add "Featured Blog Post" section
- [ ] Link to resources from value propositions

#### F3. Pricing Page Enhancements
- [ ] Add link to validation page ("See validation results")
- [ ] Add link to security page ("Enterprise security included")
- [ ] Link to free trial blog post

#### F4. Feature Pages
- [ ] Each feature page links to related blog posts
- [ ] Feature pages link to use cases
- [ ] Feature pages link to templates

---

### G. Testing & Validation (Phase 2)

For each blog post:
- [ ] Verify metadata is correct
- [ ] Check Rich Results Test for Article schema
- [ ] Verify internal links work
- [ ] Check for proper heading hierarchy
- [ ] Test on mobile
- [ ] Verify featured images display

For new pages:
- [ ] All metadata complete
- [ ] Schema validation passing
- [ ] Internal links working
- [ ] Mobile responsive
- [ ] No broken images

---

## PHASE 3: TECHNICAL OPTIMIZATION (Weeks 2-3, Parallel)

### A. Enhance Sitemap Generation

#### A1. Update src/app/sitemap.ts
**Current:** Lines 1-15 (8 static URLs)

- [ ] Create new sitemap.ts with dynamic URL generation
- [ ] Add blog posts to sitemap (dynamic from posts directory)
- [ ] Add feature pages
- [ ] Add use case pages
- [ ] Add comparison pages
- [ ] Set proper priority for each page type
- [ ] Set proper changeFrequency for each page type
- [ ] Update lastModified timestamps per page

**Priority Guide:**
- Homepage: 1.0
- Pricing: 0.9
- Templates: 0.9
- Blog: 0.8 (hub)
- Blog posts: 0.7
- Features: 0.6
- Use cases: 0.6
- Comparisons: 0.6
- Instructions: 0.7
- Validation: 0.8
- Security: 0.8
- Privacy/Terms: 0.5

**Change Frequency Guide:**
- Homepage: weekly
- Pricing: monthly
- Blog hub: daily
- Blog posts: monthly
- Features: monthly
- Others: monthly/yearly

#### A2. Test Updated Sitemap
- [ ] Verify sitemap.xml is accessible (https://radly.app/sitemap.xml)
- [ ] Check format is valid XML
- [ ] Validate with Google Sitemap Validator
- [ ] Ensure all URLs are accessible (no 404s)
- [ ] Submit to Google Search Console

---

### B. Implement Canonical Tags

#### B1. Homepage Canonical
**File:** `src/app/page.tsx`

```typescript
// Already has default from root layout
// Verify: alternates: { canonical: siteConfig.url }
```

- [ ] Verify homepage has canonical

#### B2. Dynamic Blog Posts
**File:** `src/app/blog/[slug]/page.tsx`

```typescript
export async function generateMetadata({ params }) {
  return {
    alternates: {
      canonical: `https://radly.app/blog/${params.slug}`
    }
  }
}
```

- [ ] Add canonical to blog post template

#### B3. All Feature/Use Case Pages
- [ ] Add canonical to `/features/[feature]/page.tsx`
- [ ] Add canonical to `/use-cases/[modality]/page.tsx`
- [ ] Add canonical to `/comparison/[comparison]/page.tsx`

**Pattern for all:**
```typescript
alternates: {
  canonical: `https://radly.app[CURRENT_URL]`
}
```

---

### C. Implement Robots Meta Tags

#### C1. Public Pages (Default)
These should have:
```typescript
robots: {
  index: true,
  follow: true,
}
```

- [ ] Verify default in root layout or add to each page

#### C2. Protected Pages (No Index)
For `/app/*` and `/auth/*` routes:

```typescript
robots: {
  index: false,
  follow: false,
}
```

- [ ] Verify robots.ts correctly blocks these
- [ ] Add explicit meta robots if needed

#### C3. Archive/Pagination (Nofollow)
If implementing pagination:

```typescript
robots: {
  index: true,
  follow: false,  // Prevent following pagination links
}
```

---

### D. Image Alt Text Strategy

#### D1. Homepage Images
**File:** `src/app/page.tsx`

- [ ] All images have descriptive alt text
- [ ] Alt text includes keywords naturally
- [ ] Example: "Radiologist using Radly voice assistant to generate structured report"

#### D2. OG Images
For all pages:

```typescript
images: [{
  url: "...",
  alt: "Descriptive text including relevant keywords"
}]
```

- [ ] Add alt text to all OG image references
- [ ] Ensure alt text is descriptive and keyword-relevant

#### D3. Blog Post Images
**File:** `src/app/blog/[slug]/page.tsx`

- [ ] Featured image has descriptive alt text
- [ ] All in-content images have alt text
- [ ] Alt text is 8-15 words, descriptive

#### D4. Feature Page Images
- [ ] All feature page images have alt text
- [ ] Use case images have descriptive alt text
- [ ] Comparison tables/screenshots have alt text

---

### E. Core Web Vitals Monitoring Setup

#### E1. Create Performance Monitoring File
**File:** `src/lib/performance.ts`

```typescript
export function trackWebVitals() {
  // LCP: Largest Contentful Paint
  // FID/INP: First Input Delay / Interaction to Next Paint
  // CLS: Cumulative Layout Shift

  // Send metrics to Analytics
}
```

- [ ] Create web vitals tracking function
- [ ] Send to Google Analytics
- [ ] Create dashboard to monitor

#### E2. Implement in Layout
**File:** `src/app/layout.tsx`

- [ ] Call trackWebVitals() on client side
- [ ] Send metrics to GA4

#### E3. Setup Monitoring Dashboard
- [ ] Use Google Analytics to view CWV metrics
- [ ] Use Lighthouse CI for automated testing
- [ ] Set performance budgets

**Targets:**
- LCP: < 2.5 seconds
- CLS: < 0.1
- INP: < 200ms
- FCP: < 1.8s

#### E4. Weekly CWV Review
- [ ] Check Google Analytics CWV metrics
- [ ] Run Lighthouse on key pages
- [ ] Identify & fix issues
- [ ] Document trends

---

### F. Testing & Validation (Phase 3)

#### F1. Sitemap Validation
- [ ] Verify sitemap.xml is accessible
- [ ] Use Google Sitemap Validator
- [ ] Check for 404 URLs
- [ ] Submit to GSC

#### F2. Canonical Tag Testing
- [ ] Use SEO tools to verify canonical tags
- [ ] Check no conflicting canonical tags
- [ ] Verify parameterized URLs have canonicals

#### F3. Robots.txt Testing
- [ ] Verify robots.txt blocks /app, /auth, /api
- [ ] Test with Google robots.txt tester
- [ ] Verify sitemap is referenced

#### F4. CWV Testing
- [ ] Run PageSpeed Insights on key pages
- [ ] Run Lighthouse on desktop and mobile
- [ ] Check no regressions from Phase 2 content

#### F5. Schema Validation
- [ ] Re-run Rich Results Test on all pages
- [ ] Verify all schemas pass validation
- [ ] Check for errors/warnings

---

## PHASE 4: ONGOING STRATEGY (Week 4+)

### A. Blog Publishing Schedule

#### A1. Month 2 (December 2025)
**Week 1:**
- [ ] Publish: "AI Safety in Radiology" (2,000 words)
  - Keywords: AI safety, clinical AI, responsible AI
  - Links to: security, validation, blog archive

**Week 2:**
- [ ] Publish: "Workflow Optimization Strategies" (1,800 words)
  - Keywords: radiology workflow, optimization, efficiency
  - Links to: features, use cases, templates

**Week 3:**
- [ ] Publish: Feature deep-dive "Understanding DICOM & PACS" (1,600 words)
  - Keywords: DICOM, PACS, medical imaging standards
  - Links to: integrations, features

**Week 4:**
- [ ] Publish: "Choosing the Right Radiology Software" (2,000 words)
  - Keywords: radiology software, reporting tool selection
  - Links to: pricing, comparisons, features

#### A2. Month 3 (January 2026)
- [ ] Week 1: "Voice vs. Typing: Productivity Comparison"
- [ ] Week 2: "Radiology Template Best Practices"
- [ ] Week 3: Case study (if available) or "Emerging Radiology Tech 2026"
- [ ] Week 4: "Compliance Checklist for Healthcare IT"

#### A3. Content Calendar Management
- [ ] Create shared calendar (Google Calendar or Notion)
- [ ] Schedule 2 posts/month recurring
- [ ] Assign owners (writer, editor, designer)
- [ ] Set deadlines (write by 1st, publish by 2nd of month)
- [ ] Track performance metrics post-publish

---

### B. Link Building Outreach

#### B1. Identify Link Opportunities
- [ ] Healthcare tech blogs (20-30 targets)
- [ ] Radiology professional sites (10-15 targets)
- [ ] Medical AI directories (5-10 targets)
- [ ] Resource pages on healthcare sites (10-20 targets)
- [ ] Industry publications (5-10 targets)

#### B2. Monthly Outreach (4-6 new backlinks/month)

**Month 1 (November):**
- [ ] Identify 10 high-authority targets (DR 40+)
- [ ] Personalize outreach for 5-6
- [ ] Target 1-2 guest post opportunities

**Month 2 (December):**
- [ ] Continue outreach (10+ targets)
- [ ] Publish guest post #1 (if secured)
- [ ] Target 2-3 new publications

**Month 3 (January):**
- [ ] Ongoing outreach
- [ ] Publish guest post #2 (if secured)
- [ ] Monitor backlink acquisition in Ahrefs

#### B3. Guest Posting Strategy
- [ ] Identify 5 publications accepting guest posts
- [ ] Write guest posts on high-intent topics
- [ ] Include Radly mention (naturally) + link
- [ ] Cross-promote on social media

**Potential Guest Post Topics:**
- "The Role of AI in Modern Radiology"
- "Building Secure Teleradiology Solutions"
- "Optimizing Clinical Workflows with Technology"

---

### C. Monthly Reporting & Optimization

#### C1. Monthly SEO Report (Every 1st of month)

**Track These Metrics:**
- [ ] Organic traffic (GA4) - target +10-20% MoM
- [ ] Keyword rankings (SEMrush/Ahrefs) - track top 20
- [ ] Blog metrics: views, avg time on page, bounce rate
- [ ] Backlinks acquired (Ahrefs)
- [ ] Core Web Vitals (PageSpeed Insights)
- [ ] Crawl errors (GSC)
- [ ] Indexed pages (GSC)
- [ ] CTR trends (GSC)

**Reporting Template:**
```
MONTH X SEO REPORT
─────────────────────
Traffic: X visits (+Y% vs last month)
Keywords in top 100: X (+Y from last month)
Top performing blog post: [Title] (X visits)
New backlinks: X (sources: ...)
CWV Status: LCP X, CLS X, INP X (all green/yellow/red)
Top opportunities: ...
```

#### C2. Content Optimization
- [ ] Update top-performing posts with fresh data
- [ ] Add internal links to new pages/posts
- [ ] Fix underperforming content
- [ ] Add new FAQs based on search data

#### C3. Ranking Tracking
- [ ] Track 20-30 primary keywords monthly
- [ ] Note ranking changes
- [ ] Analyze SERP competition
- [ ] Identify quick-win optimization opportunities

**Primary Keywords to Track:**
1. radiology reporting assistant
2. voice documentation radiology
3. medical report writing software
4. radiology AI assistant
5. structured radiology reports
6. clinical documentation software
7. radiology transcription software
8. medical voice recognition
9. HIPAA radiology software
10. AI radiology tools
... (add 10-20 more)

---

### D. Tools & Setup

#### D1. Essential Tools
- [ ] Google Search Console (free)
- [ ] Google Analytics 4 (free)
- [ ] Ahrefs or SEMrush (paid, ~$100-500/month)
- [ ] Google Lighthouse (free)
- [ ] Screaming Frog (free or paid)

#### D2. Setup & Configuration
- [ ] GSC: Verify ownership, submit sitemaps, monitor index
- [ ] GA4: Set up goals/events for key actions (signup, trial, pricing click)
- [ ] Ahrefs/SEMrush: Create project, track 20+ keywords
- [ ] Lighthouse CI: Automated performance testing
- [ ] Slack integration: Weekly summary reports

---

### E. Ongoing Monitoring Checklist

**Weekly:**
- [ ] Check for crawl errors in GSC
- [ ] Monitor Core Web Vitals
- [ ] Review any indexing issues

**Monthly:**
- [ ] Generate full SEO report
- [ ] Review keyword rankings
- [ ] Analyze blog performance
- [ ] Check backlink acquisition
- [ ] Update content calendar

**Quarterly:**
- [ ] Comprehensive SEO audit
- [ ] Competitive analysis
- [ ] Strategy adjustment based on results
- [ ] Team review and planning

---

## SUCCESS CHECKPOINTS

### End of Week 1 (Phase 1)
- [ ] All metadata complete on public pages
- [ ] 8+ JSON-LD schemas implemented
- [ ] 6 custom OG images created and deployed
- [ ] All meta descriptions optimized
- [ ] Google Rich Results Test: 100% pass
- [ ] No Core Web Vitals regression

**Go/No-Go Decision:** Proceed to Phase 2 if all checkpoints met

### End of Week 3 (Phase 2 & 3)
- [ ] 5 blog posts published and live
- [ ] Blog architecture fully functional
- [ ] 4+ feature pages live
- [ ] 2+ comparison pages live
- [ ] Sitemap includes 40+ URLs
- [ ] Canonical tags on all pages
- [ ] Core Web Vitals stable
- [ ] 0 crawl errors in GSC

**Go/No-Go Decision:** Continue Phase 4 if metrics positive

### End of Month 1
- [ ] Blog achieving 500+/week organic impressions
- [ ] 2+ blog posts in top 100 for target keywords
- [ ] 50%+ increase in pages indexed
- [ ] 5-10% increase in organic search traffic
- [ ] 1-2 new backlinks acquired
- [ ] No indexation issues

**Go/No-Go Decision:** Full Phase 4 investment justified

### End of Month 3
- [ ] 30-50% increase in organic search traffic
- [ ] 20+ keywords in top 100
- [ ] 5-10 new backlinks acquired
- [ ] Blog consistently producing 2,000+ views/month
- [ ] 2+ blog posts in top 20 for target keywords
- [ ] Consistent month-over-month growth 20%+

---

## DOCUMENT MANAGEMENT

- [ ] Save this checklist to repo: `/SEO_IMPLEMENTATION_CHECKLIST.md`
- [ ] Share with team via Slack/email
- [ ] Assign owners to each section
- [ ] Use as daily/weekly checklist
- [ ] Update checkbox status weekly
- [ ] Schedule weekly review meetings

---

**Version:** 1.0
**Last Updated:** November 7, 2025
**Status:** Ready for Implementation
**Next Step:** Assign owners and start Phase 1
