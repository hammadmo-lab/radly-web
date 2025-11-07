# Phase 3 Quick Start Guide - What to Do First

## The Big Picture

Phase 3 is about **building authority** through content and backlinks. It's less technical than Phase 2, more about strategy and execution.

**Simple Goal**:
- Write 5-8 blog posts about radiology, AI, and workflow optimization
- Get 35-50 websites to link back to Radly
- Track results in Google Search Console

**Time Investment**: 4-8 weeks (depending on content team size)

---

## Step-by-Step: Week 1 Actions

### Step 1: Understand Your Keywords (1-2 hours)

**What you need**:
1. Open Google Search Console: https://search.google.com/search-console/
2. Click "Queries" in Performance report
3. Scroll through your current search queries
4. Look for questions people are asking about radiology, reporting, etc.

**What to do**:
- Note 20-30 questions that people are asking
- Think about blog posts you could write to answer them
- Example: If someone searches "how to write radiology reports", that's a blog post idea

**Create a simple spreadsheet**:
```
Keyword | Search Volume | Intent | Blog Post Idea
"how to write radiology reports" | Medium | Educational | "Writing Structured Reports Guide"
"voice dictation radiology" | Low | Commercial | "Voice Transcription Best Practices"
"radiology workflow" | Medium | Informational | "Optimizing Your Workflow"
```

**Tools to use**:
- Google Search Console (free - what queries are people using?)
- Google Trends (free - what's popular now?)
- Just ask yourself: "What questions do radiologists ask about our product?"

### Step 2: Plan Your First 5 Blog Posts (1 hour)

**Pick 5 topics from Phase 3 Plan** that match your expertise and audience:

1. **Post 1**: "How to Write Structured Radiology Reports"
   - Audience: Radiology residents, new consultants
   - Why: High search volume, aligns with Radly

2. **Post 2**: "Voice Transcription Tips for Radiology Reporting"
   - Audience: Current Radly users, radiologists
   - Why: Showcases key feature

3. **Post 3**: "Radiology Workflow Optimization Guide"
   - Audience: Practice managers, department heads
   - Why: High commercial intent

4. **Post 4**: "Understanding Clinical Validation in AI Radiology"
   - Audience: Healthcare decision makers
   - Why: Trust-building, authority signal

5. **Post 5**: "Modality-Specific Reporting: CT, US, X-ray Best Practices"
   - Audience: All radiologists
   - Why: Broad appeal, multiple keywords

### Step 3: Assign Ownership (30 minutes)

**Questions to answer**:
- Who will write these posts? (internal radiologist? external writer? mixture?)
- Who will review for technical accuracy?
- Who will optimize for SEO before publishing?
- Who will promote on social media?

**Simple responsibility chart**:
```
Post 1: [Writer Name] → [Reviewer] → [SEO Person] → [Promoter]
Post 2: [Writer Name] → [Reviewer] → [SEO Person] → [Promoter]
...
```

### Step 4: Set Up Blog Infrastructure (2-4 hours)

**Option A: Simple (MDX Files)**
- Easiest to implement
- Version controlled via Git
- Good for Phase 3
- Limitations: Limited content editing for non-coders

**Option B: Full CMS (Sanity, Contentful)**
- More flexible
- Better for larger teams
- More setup required
- Worth doing later if content scales

**For Phase 3, I recommend**: Start with **Option A (MDX)** - we can help you set this up.

### Step 5: Create Blog Directory Structure (30 minutes)

Ask to implement these folders and files:

```
src/app/blog/
├── page.tsx (blog landing page)
├── [slug]/
│   └── page.tsx (individual post template)
├── sitemap.ts (auto-generates blog URLs for sitemap)
└── layout.tsx (shared layout for all blog posts)

content/blog/
├── how-to-write-radiology-reports.mdx
├── voice-transcription-radiology.mdx
├── radiology-workflow-optimization.mdx
├── ai-validation-radiology.mdx
└── modality-specific-reporting.mdx
```

Each `.mdx` file contains:
```markdown
---
title: "How to Write Structured Radiology Reports"
excerpt: "A practical guide to creating accurate, standardized radiology reports"
author: "Dr. John Smith"
publishedAt: "2025-11-15"
tags: ["reporting", "best-practices", "structured-data"]
image: "/blog/radiology-reports.jpg"
---

# How to Write Structured Radiology Reports

Your post content here in Markdown...
```

---

## Week 2 Actions: Write Your First Post

### The 4-Hour Blog Post Formula

**Hour 1: Outline (30 minutes)**
- Introduction (hook the reader)
- 3-5 main sections (each with H2 heading)
- Conclusion with CTA
- Examples/visuals

**Hour 2: Draft (45 minutes)**
- Write main content
- Don't worry about perfection
- Just get ideas down

**Hour 3: Edit (30 minutes)**
- Read for flow
- Add examples/visuals
- Ensure 1,200-1,800 words

**Hour 4: Optimize & Publish (15 minutes)**
- Add SEO title (60 chars)
- Write meta description (155 chars)
- Add internal links (3-5)
- Add images
- Schedule/publish

### First Post: "How to Write Structured Radiology Reports"

**Meta**:
- Title: "How to Write Structured Radiology Reports: A Complete Guide"
- Description: "Learn the essential components of structured radiology reports with practical examples and best practices."
- Keywords: structured reporting, report writing, radiology standards

**Outline**:
1. Why structured reports matter (SEO: "radiology standards", "reporting best practices")
2. The 4 core sections (history, technique, findings, impression)
3. Best practices per modality
4. Common mistakes to avoid
5. Using templates effectively
6. Conclusion + CTA to Radly

**Internal Links**:
- Link to Pricing (for templates)
- Link to Validation (for clinical standards)
- Link to Instructions (for workflow)

**Estimated Time**: 4 hours

---

## Weeks 3-4: Publish & Build Momentum

### Action Items Per Week:

**Week 3**:
- [ ] Publish Post 1
- [ ] Start writing Post 2
- [ ] Share Post 1 on social media (3 times)
- [ ] Monitor Search Console for impressions

**Week 4**:
- [ ] Publish Post 2
- [ ] Start writing Post 3
- [ ] Publish Post 3
- [ ] Begin link outreach (see link strategy below)

---

## Link Building: Start Simple

### Week 3-4: PR & Directory Submissions (5-10 links)

**Action 1: Write Press Release** (2 hours)
- Announce your blog launch
- Distribute via PRWeb, EIN Presswire, or PRNewswire
- Cost: $50-200 per distribution
- Expected: 5-10 backlinks

**Template**:
```
FOR IMMEDIATE RELEASE

Radly Launches Blog on Clinical Radiology Reporting

[City, Date] - Radly, an AI assistant for radiology reporting, today launched its blog covering best practices in clinical reporting, workflow optimization, and healthcare AI.

The blog features expert insights from radiologists and healthcare IT professionals on topics including structured reporting, voice transcription accuracy, and PACS integration.

[Include 2-3 quotes from your team]
[Include Radly overview paragraph]
[Include contact info]

###
```

**Action 2: Submit to Healthcare Directories** (1-2 hours)
- Healthcare software directories
- AI/ML company listings
- Medical technology databases
- 5-10 sites, takes 30 minutes each

**Example directories**:
- G2 (www.g2.com) - add Radly listing
- Capterra (www.capterra.com) - healthcare software
- AlternativeTo (alternativeto.net) - software alternatives
- MobileHealth news healthcare solutions database
- HIMSS certified vendor listings

### Week 5+: Strategic Outreach (15-20 more links)

**Action 1: Healthcare Publications** (2-3 hours/week)
- Pitch guest posts to MedPage Today, Healthcare IT News, etc.
- Offer expert commentary on industry trends
- Share your clinical validation data
- Expected: 1-2 guest posts/month = 2-4 links/month

**Pitch template**:
```
Subject: Expert Commentary Opportunity - AI in Radiology Reporting

Hi [Editor Name],

I noticed your article on [relevant topic] and thought we might have valuable insights to share. At Radly, we've conducted validation studies on AI-assisted radiology reporting and found [specific finding].

We'd be happy to:
- Provide an expert quote for your article
- Write a guest column on clinical validation in radiology AI
- Participate in a podcast/interview series

I've attached our recent validation white paper for context.

Best,
[Your Name]
Radly
```

**Action 2: Podcast/Speaking Opportunities** (1-2 hours/week)
- Find healthcare and AI podcasts
- Pitch team member as guest
- Provide talking points
- Expected: 1 podcast/month = 1-2 links + 50+ referral traffic

---

## Monitoring & Metrics (What to Watch)

### Daily Check (5 minutes)
- Google Search Console → Performance
- Are your blog posts getting impressions?
- Which posts are getting clicks?

### Weekly Check (15 minutes)
- Total blog traffic (Google Analytics)
- Most viewed posts
- Average time on page (engagement)
- New backlinks (Ahrefs or free tools)

### Monthly Check (30 minutes)
- Search rankings (are blog posts ranking?)
- Total organic traffic growth
- Blog traffic as % of total organic
- Backlinks acquired
- Domain authority trend

---

## Success Checklist: End of Phase 3

- [ ] 5-8 blog posts published
- [ ] BlogPosting schema on all posts
- [ ] 15-20 backlinks acquired
- [ ] Blog generating 5-10% of organic traffic
- [ ] 3-5 target keywords in top 30
- [ ] Team trained on ongoing content process
- [ ] Monitoring dashboard set up

---

## Budget Estimate (Optional Costs)

| Item | Cost | Optional? |
|------|------|-----------|
| Freelance writers (8 posts @ $100 each) | $800 | Yes |
| Press release distribution | $50-200 | No |
| Ahrefs/SEMrush subscription | $100-400/month | Yes |
| Stock photos & graphics | $0-100 | Mostly no |
| **Total** | **$950-1,500** | ~$200 minimum |

**Zero-budget version**: Write internally, use free SEO tools, submit directories only.

---

## Ready to Start?

### Right Now:
1. Check Google Search Console for current queries
2. Create 5 blog post ideas
3. Decide who will write (internal or freelance)
4. Let me know if you want me to set up blog infrastructure

### Next: Set Up Blog
- I can create the MDX infrastructure and blog routing
- Set up BlogPosting schema template
- Create blog landing page
- Update sitemap with /blog URLs

### Then: Start Writing
- Week 1: Outline + draft Post 1
- Week 2: Finish Post 1, publish
- Week 3: Publish Post 2-3
- Week 4: Begin link outreach

---

## Questions Before We Start?

1. **Who will write the blog posts?**
   - Internal team member?
   - External freelancer?
   - Mix of both?

2. **Publishing pace?**
   - 1 post per week?
   - 2 posts per week?
   - Every other week?

3. **Focus areas?**
   - Product features?
   - Clinical best practices?
   - Industry insights?
   - Mix?

4. **Link building approach?**
   - DIY (internal outreach)?
   - Hire agency?
   - Mix?

Let me know what works best for your team, and we'll get started! 🚀

