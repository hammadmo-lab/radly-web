# Phase 3: Content Authority Building & External Link Strategy

## Phase Overview

**Goal**: Build topical authority and domain authority through strategic content creation, external link acquisition, and E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) signals.

**Focus Areas**:
1. Content creation (blog, guides, case studies)
2. Schema markup for expertise signals
3. External link building
4. Search performance optimization

**Expected Duration**: 4-8 weeks
**Expected Impact**: +50-100% increase in organic traffic over 3 months

---

## Task 1: Keyword Research & Content Strategy

### Objectives
- Identify high-value keywords for Radly
- Understand search intent and competitor landscape
- Create content roadmap aligned with user journey
- Plan blog infrastructure

### Deliverables
- [ ] Keyword research spreadsheet (50-100 target keywords)
- [ ] Content calendar (12-24 blog posts)
- [ ] Competitor analysis report
- [ ] Blog infrastructure (routing, templates, schemas)
- [ ] Target keyword assignments per content piece

### Keywords to Target (Initial List)

**High Intent (Commercial/Transactional)**
- "radiology report generator"
- "voice transcription for radiology"
- "structured report template radiology"
- "radiology workflow optimization"
- "PACS integration radiology software"
- "radiology dictation software"
- "report generation assistant radiology"

**Mid Intent (Informational + Commercial)**
- "how to write radiology reports"
- "radiology report structure"
- "radiology template examples"
- "efficient radiology workflow"
- "radiology AI assistant"
- "clinical documentation in radiology"

**Information Intent (Establish Authority)**
- "radiology best practices"
- "structured data in medical imaging"
- "radiology terminology guide"
- "modality-specific reporting"
- "radiology reporting guidelines"
- "quality improvement in radiology"

### Content Pillars
1. **Product Features**: Positioning Radly's capabilities
2. **Workflow Optimization**: How to work more efficiently
3. **Clinical Standards**: Best practices and guidelines
4. **Industry Insights**: Trends and future of radiology
5. **Use Cases**: Real-world applications and success stories

### Tools to Use
- Google Search Console (current queries)
- Google Trends (seasonal trends)
- Ahrefs/SEMrush (competitor keywords, difficulty)
- Answer the Public (question-based keywords)
- Industry publications (context and trends)

---

## Task 2: Blog Infrastructure & Architecture

### What to Build

#### Blog Structure
```
/blog
├── page.tsx (blog landing)
├── [slug]
│   └── page.tsx (individual post)
├── category/[category]/page.tsx
└── sitemap.ts (blog URLs)
```

#### Blog Post Component
```typescript
interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string; // MDX content
  author: {
    name: string;
    title: string;
    bio: string;
    image: string;
  };
  publishedAt: string;
  updatedAt: string;
  category: string;
  tags: string[];
  image: string;
  keywords: string[];
  readingTime: number;
}
```

#### Content Storage Options
**Option A**: MDX files in repo (simpler, version controlled)
```
content/blog/
├── how-to-write-radiology-reports.mdx
├── radiology-workflow-optimization.mdx
└── structured-reporting-best-practices.mdx
```

**Option B**: Headless CMS (Contentful, Sanity)
- More flexible content editing
- Better for non-technical writers
- Scalable for large content teams

**Recommendation for Phase 3**: Start with MDX (faster implementation), migrate to CMS in Phase 4 if team grows.

### Blog Post Template
```typescript
export const blogPostSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Post Title",
  "image": "featured-image.jpg",
  "datePublished": "2025-11-15",
  "dateModified": "2025-11-20",
  "author": {
    "@type": "Person",
    "name": "Author Name",
    "url": "https://radly.app/about/author"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Radly",
    "logo": { "@type": "ImageObject", "url": "..." }
  },
  "description": "Post excerpt",
  "articleBody": "Full content text...",
  "wordCount": 1500,
  "timeToRead": "7 minutes",
  "isPartOf": { "@id": "https://radly.app/#website" }
};
```

### Schema Markup Per Blog Post
- **BlogPosting**: Main article schema
- **Article**: Alternative to BlogPosting
- **NewsArticle**: If time-sensitive content
- **FAQPage**: If post contains Q&A format
- **BreadcrumbList**: Navigation hierarchy
- **AggregateRating**: User reviews/ratings (future)

---

## Task 3: Initial Blog Content (MVP)

### Phase 3A: Launch Blog with 5-8 Posts

**Post 1: "How to Write Structured Radiology Reports"** (1,500 words)
- Target: "how to write radiology reports", "radiology report structure"
- Intent: Educational + authority building
- Keywords: radiology reports, structured reporting, PACS integration
- Include: Best practices, template examples, common mistakes

**Post 2: "Voice Transcription for Radiology: Best Practices"** (1,200 words)
- Target: "voice transcription radiology", "dictation radiology"
- Intent: Feature-focused + informational
- Keywords: voice dictation, transcription accuracy, modality terminology
- Include: Setup guide, accuracy tips, workflow integration

**Post 3: "Radiology Workflow Optimization: A Practical Guide"** (1,800 words)
- Target: "radiology workflow optimization", "efficient radiology workflow"
- Intent: High commercial value
- Keywords: efficiency improvement, time savings, reading room optimization
- Include: Case studies, metrics, ROI calculation

**Post 4: "Understanding PACS Integration for Report Generation"** (1,400 words)
- Target: "PACS integration", "PACS workflow"
- Intent: Technical + commercial
- Keywords: PACS, HL7, integration, interoperability
- Include: Technical overview, integration patterns, compatibility

**Post 5: "Clinical Validation of AI-Assisted Radiology Reporting"** (1,600 words)
- Target: "AI radiology", "clinical validation"
- Intent: Authority + trust building
- Keywords: AI validation, accuracy metrics, clinical studies
- Include: Validation data, references, limitations (transparency)

**Post 6: "Modality-Specific Reporting Best Practices"** (2,000 words)
- Target: "CT reporting", "ultrasound reporting", "X-ray reporting"
- Intent: Educational + SEO multiplex
- Keywords: modality-specific templates, terminology, structured data
- Include: Separate sections per modality, examples, guidelines

**Post 7: "Building Efficient Reading Rooms: Technology & Process"** (1,700 words)
- Target: "reading room efficiency", "radiology productivity"
- Intent: Commercial + informational
- Keywords: reading room setup, workstation optimization, software
- Include: Workflow diagrams, tools, best practices

### Content Guidelines for Blog Posts
- **Length**: 1,200-2,000 words (optimal for ranking)
- **Structure**: H2 subheadings every 200-300 words
- **Keywords**: 1 primary, 3-5 secondary per post
- **Links**: 3-5 internal links to related content
- **Media**: 2-4 images/diagrams per 1,000 words
- **CTA**: Call-to-action linking to pricing or free trial
- **Metadata**: SEO title (60 chars), meta description (155 chars)

---

## Task 4: Author/Expertise Markup

### Person Schema for Authors

```typescript
const authorSchema = {
  "@type": "Person",
  "name": "Dr. [Author Name]",
  "url": "https://radly.app/about/team/[author]",
  "jobTitle": "Radiologist / Product Lead",
  "description": "Expertise in clinical validation and reporting workflows",
  "affiliation": {
    "@type": "Organization",
    "name": "Radly"
  },
  "worksFor": { "@id": "https://radly.app/#organization" },
  "knowsAbout": ["Radiology", "AI", "Clinical Workflows"],
  "sameAs": [
    "https://twitter.com/[author]",
    "https://linkedin.com/in/[author]"
  ]
};
```

### Review/Rating Schema (Future)

```typescript
const reviewSchema = {
  "@type": "Review",
  "name": "Great radiology assistant",
  "text": "Radly has significantly improved our workflow...",
  "author": {
    "@type": "Person",
    "name": "Dr. John Smith",
    "jobTitle": "Chief Radiologist"
  },
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": "5",
    "bestRating": "5"
  },
  "datePublished": "2025-10-15",
  "publisher": {
    "@type": "Organization",
    "name": "Radly"
  }
};
```

### About/Team Pages Enhancement
- Add detailed team member profiles
- Include headshots and credentials
- Add social media links
- Include expertise areas (structured data)
- Build trust through transparency

---

## Task 5: FAQ Expansion

### Expand Existing FAQPage on Instructions

**Current FAQs (4)**:
- How accurate is voice dictation?
- Can I use Radly without a microphone?
- Does Radly store audio?
- How do templates stay up to date?

**Add (12-15 new FAQs)**:

**Product FAQs**:
- What modalities does Radly support?
- How does Radly handle complex cases?
- Can multiple users work on the same report?
- How are templates customized?
- What's the accuracy rate of voice transcription?
- Does Radly integrate with our PACS?

**Workflow FAQs**:
- How much time do reports take with Radly?
- Can I use Radly for all report types?
- How do I train my team to use Radly?
- What's the learning curve?

**Compliance FAQs**:
- Is Radly HIPAA compliant?
- How is patient data handled?
- Can we audit usage logs?
- Does Radly meet regulatory requirements?

**Pricing/Billing FAQs**:
- Is there a free trial?
- How does pricing scale?
- Can we do custom pricing?
- What's included in each tier?

### New Dedicated FAQ Page
- Create `/faq` page with comprehensive FAQPage schema
- Organize by category (Product, Workflow, Compliance, Pricing)
- Link from multiple pages (improve internal linking)
- Optimize for "radly" + "FAQ" and question-based keywords

---

## Task 6: External Link Building Strategy

### Backlink Opportunities (Tier 1: High Priority)

**1. Healthcare/Medical Publications**
- MedPage Today
- Health News Review
- RSNA News
- Journal articles (press releases)
- Medical newsletters

**Outreach Strategy**:
- Press releases for clinical validation data
- Expert commentary on industry trends
- Thought leadership pieces

**Expected**: 10-15 backlinks, DA 50-70

**2. Healthcare Technology Sites**
- Healthcare IT News
- MedCity News
- Healthcare Executive
- HIT Consultant
- Digital Health News

**Outreach Strategy**:
- Case studies on workflow optimization
- Integration announcements
- Industry insights

**Expected**: 15-20 backlinks, DA 45-65

**3. Industry Directories & Listings**
- Healthcare software directories
- AI healthcare companies list
- Medical device databases
- Industry association listings

**Outreach Strategy**:
- Direct submissions
- Partnership announcements
- Industry association memberships

**Expected**: 20-30 backlinks, DA 40-60

**4. Academic/Research Partnerships**
- University medical schools
- Research institutions
- Radiology departments
- Clinical research sites

**Outreach Strategy**:
- Research collaboration announcements
- Study result publications
- Educational partnerships

**Expected**: 5-10 high-DA backlinks (DA 60+)

**5. Podcast & Speaking Opportunities**
- Healthcare podcasts
- Medical technology interviews
- Webinar speaking slots
- Conference presentations

**Outreach Strategy**:
- Pitch founders/team as experts
- Offer case studies or data
- Participate in panel discussions

**Expected**: 5-10 backlinks + brand mentions

### Backlink Acquisition Targets

**Phase 3A (Weeks 1-4)**: 15-20 backlinks
- Press release distribution (5 links)
- Healthcare publication outreach (5 links)
- Directory submissions (5 links)

**Phase 3B (Weeks 5-8)**: 20-30 additional backlinks
- Case study publications (5 links)
- Academic partnerships (5 links)
- Podcast appearances (5 links)
- Industry association listings (5-10 links)

**Total Phase 3 Goal**: 35-50 new backlinks (quality-focused)

### Backlink Quality Metrics
- **Domain Authority**: Target DA 40+ (avoid DA <30)
- **Relevance**: Healthcare/Medical/Technology focus
- **Anchor text**: Brand + keyword variations (avoid over-optimization)
- **Dofollow**: Prioritize dofollow links
- **Traffic**: Prefer sites with actual referral traffic

---

## Task 7: Search Performance Monitoring

### Metrics to Track (Daily in Search Console)

**Indexation Metrics**:
- Total pages indexed (target: 35+ with blog)
- Pages in sitemaps vs indexed
- Coverage errors/warnings
- Mobile usability issues

**Search Performance**:
- Impressions (baseline: phase 2, target: +50-100%)
- Clicks (target: +30-50%)
- CTR (target: +20-30%)
- Average position (target: -3 to -5 positions)

**Rich Results**:
- Breadcrumb coverage (target: 100%)
- FAQ/structured data eligible pages
- Blog post Article schema detection

**Query Analysis**:
- Top performing queries
- Queries with high impression but low CTR (optimization targets)
- Brand vs non-brand search split
- Long-tail keyword discovery

### Analytics Setup (GA4)

**Key Events to Track**:
- Blog post views
- CTA clicks (pricing, free trial)
- Time on page
- Scroll depth (engagement)
- Internal link clicks
- Form submissions

**Conversion Goals**:
- Free trial signups (from blog)
- Pricing page visits from blog
- Demo request submissions
- Newsletter signups (if applicable)

### Monitoring Dashboard

Create a weekly report tracking:
1. **Search metrics** (impressions, clicks, CTR, position)
2. **Blog performance** (traffic, engagement, conversions)
3. **Backlink profile** (new links, referring domains)
4. **Rankings** (position tracking for target keywords)
5. **Competitor analysis** (comparative metrics)

---

## Implementation Timeline

### Week 1-2: Foundation
- [ ] Finalize keyword research (50-100 keywords)
- [ ] Create content calendar (12-24 posts)
- [ ] Set up blog infrastructure (MDX + routing)
- [ ] Design blog post template + schemas
- [ ] Create author profiles

### Week 3-4: MVP Blog Launch
- [ ] Write 5-8 initial blog posts (1,500-2,000 words each)
- [ ] Implement BlogPosting schema on all posts
- [ ] Create blog landing page
- [ ] Update sitemap to include blog URLs
- [ ] Set up internal linking from homepage/products

### Week 5-6: Content Expansion
- [ ] Add 8-12 additional blog posts
- [ ] Expand FAQ section with 12-15 new questions
- [ ] Create dedicated FAQ page
- [ ] Add author/expertise markup
- [ ] Implement blog search functionality (optional)

### Week 7-8: Link Building & Optimization
- [ ] Execute press release (5+ backlinks)
- [ ] Reach out to healthcare publications (5+ backlinks)
- [ ] Submit to directories (5+ backlinks)
- [ ] Plan academic partnerships
- [ ] Pitch podcast appearances
- [ ] Monitor rankings and adjust content

---

## Expected ROI & Results

### Short-term (4 weeks)
- ✅ 5-8 blog posts live with proper schema
- ✅ 15-20 new backlinks acquired
- ✅ +25-35% increase in indexed pages
- ✅ First blog posts ranking for long-tail keywords

### Medium-term (8 weeks)
- ✅ 20-24 blog posts live
- ✅ 35-50 new backlinks
- ✅ +50-100% increase in organic impressions
- ✅ 5-10 target keywords in top 20 positions
- ✅ Blog generating 10-20% of organic traffic

### Long-term (3 months)
- ✅ Topical authority established
- ✅ Domain authority improvement (+5-10 DA points)
- ✅ +100-150% total organic traffic growth
- ✅ Multiple blog posts ranking #1-3 for target keywords
- ✅ Brand recognition as healthcare technology thought leader

---

## Tools & Resources

### Content Creation
- **Writing**: Google Docs, Notion, or writing apps
- **SEO Check**: Yoast SEO, Surfer, ClearScope
- **Images**: Unsplash, Pexels, Canva
- **MDX**: Next.js MDX plugin for blog integration

### Keyword Research
- Google Search Console (free)
- Google Trends (free)
- Ahrefs or SEMrush (paid, but worth it)
- Answer the Public (free tier available)

### Link Building
- HARO (Help A Reporter Out) - free
- Muck Rack - free tier
- Ahrefs Backlink Checker
- Monitor Backlinks tool

### Analytics & Monitoring
- Google Search Console (free)
- Google Analytics 4 (free)
- Rank tracker (Ahrefs, SEMrush, or free alternative)
- Spreadsheet for manual tracking

---

## Success Metrics (End of Phase 3)

| Metric | Target | Source |
|--------|--------|--------|
| Blog Posts | 20-24 | Internal tracking |
| Backlinks | 35-50 | Ahrefs/SEMrush |
| Domain Authority | +5-10 points | Ahrefs/Moz |
| Indexed Pages | 35-50 | Search Console |
| Organic Impressions | +50-100% vs Phase 2 | Search Console |
| Organic Clicks | +30-50% vs Phase 2 | Search Console |
| Keyword Rankings | 10+ in top 20 | Rank tracker |
| Blog Traffic | 10-20% of organic | Google Analytics |
| Referral Traffic | 50-100 clicks/month | Google Analytics |

---

## Next Phase Preview (Phase 4)

After Phase 3 success, Phase 4 will focus on:

- **Conversion Optimization**: Improve landing pages and CTAs
- **User Experience**: Enhance blog readability and engagement
- **Community Building**: Guest posting, collaboration, partnerships
- **Content Expansion**: Case studies, whitepapers, webinars
- **CMS Migration**: Move to Headless CMS if content team expands

---

## Questions to Answer Before Starting

1. **Content Team**: Who will write blog posts? (internal vs external writers)
2. **Publishing Cadence**: How many posts per week? (suggest 2-3 per week)
3. **Writer Budget**: Do you need to hire freelance writers? ($50-150 per post)
4. **Blog Scope**: Should blog focus on product features or industry insights? (recommend both)
5. **Backlink Strategy**: Who manages outreach? (suggest agency or internal dedicated person)

---

## Ready to Start?

Phase 3 is comprehensive but highly impactful. Let me know:

1. **Which task should we start with?**
   - Task 1: Keyword research & strategy planning
   - Task 2: Blog infrastructure setup
   - Task 3: Content creation (write first posts)
   - Task 5-6: FAQ expansion & link building

2. **What's your timeline?**
   - Aggressive: 4-6 weeks (heavy workload)
   - Moderate: 8-10 weeks (balanced)
   - Conservative: 12+ weeks (slower pace)

3. **Who's involved?**
   - Internal team only
   - External writers + internal management
   - Full agency partnership

Let me know what makes sense for your team, and we'll dive into execution! 🚀

