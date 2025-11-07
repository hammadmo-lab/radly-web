# Google Rich Results Testing Guide

This guide explains how to validate the structured data (JSON-LD schemas) implemented across Radly's marketing pages.

## Quick Start

1. Visit **Google Rich Results Test**: https://search.google.com/test/rich-results
2. Enter the URL you want to test or paste HTML/JSON-LD code directly
3. Review the results for valid schema detection and any errors

## Pages to Test

### High Priority (Conversion & Trust Pages)

Test these pages in order - they have the most important structured data:

#### 1. Homepage (`https://radly.app/`)
- **Schemas**: SoftwareApplication, SearchAction, Service
- **Expected Results**:
  - ✅ SoftwareApplication schema detected (HealthApplication category)
  - ✅ SearchAction schema enables sitelink search box
  - ✅ Service schema describes the offering
- **Why Important**: Homepage authority and sitelink search visibility

#### 2. Pricing Page (`https://radly.app/pricing`)
- **Schemas**: WebPage, BreadcrumbList, Pricing Collection with Offers
- **Expected Results**:
  - ✅ WebPage schema with organization reference
  - ✅ BreadcrumbList navigation structure
  - ✅ Collection schema with multiple Offer entries
- **Why Important**: Price tracking and product rich results

#### 3. Security Page (`https://radly.app/security`)
- **Schemas**: WebPage, Article, BreadcrumbList
- **Expected Results**:
  - ✅ WebPage and Article schema hierarchy
  - ✅ BreadcrumbList for navigation clarity
  - ✅ Organization reference via isPartOf
- **Why Important**: Trust signal for enterprise buyers

#### 4. Validation Page (`https://radly.app/validation`)
- **Schemas**: WebPage, Article, FAQPage (if applicable), BreadcrumbList
- **Expected Results**:
  - ✅ WebPage and Article schema detected
  - ✅ BreadcrumbList for site structure
  - ✅ FAQPage schema if FAQ section is structured
- **Why Important**: Authority and fact-checking signals

### Secondary Priority (Content Pages)

#### 5. Instructions Page (`https://radly.app/instructions`)
- **Schemas**: WebPage, Article, FAQPage, BreadcrumbList
- **Expected Results**:
  - ✅ Complete FAQ schema with questions and answers
  - ✅ WebPage and Article hierarchy
  - ✅ BreadcrumbList navigation
- **Why Important**: Help content indexing and FAQ snippets

#### 6. Terms (`https://radly.app/terms`) & Privacy (`https://radly.app/privacy`)
- **Schemas**: WebPage, BreadcrumbList
- **Expected Results**:
  - ✅ WebPage schema with metadata
  - ✅ BreadcrumbList navigation
- **Why Important**: Legal page completeness

---

## Schema Validation Checklist

For each page tested, verify:

- [ ] **No critical errors** - Schema is syntactically valid JSON-LD
- [ ] **Organization reference** - `isPartOf` correctly links to `https://radly.app/#organization`
- [ ] **Metadata completeness** - Description, URL, and name fields populated
- [ ] **Breadcrumb chain** - All breadcrumb items have proper positions and links
- [ ] **Schema hierarchy** - WebPage references Organization publisher correctly

---

## Common Schema Issues & Fixes

### Issue: "Invalid JSON-LD"
**Cause**: Malformed JSON syntax
**Fix**: Ensure all strings are quoted, no trailing commas, proper bracket nesting

### Issue: "Missing required property"
**Cause**: Schema incomplete
**Fix**: Verify all required fields are present (e.g., `name`, `description`, `url` for WebPage)

### Issue: "URL not canonical"
**Cause**: URL format inconsistency
**Fix**: Use `https://radly.app` (no trailing slash) consistently across all schemas

### Issue: "Breadcrumb not structured"
**Cause**: BreadcrumbList items missing required fields
**Fix**: Ensure each item has `position`, `name`, and `item` properties

---

## Testing with URL Inspection

After testing structured data validity:

1. Go to **Google Search Console**: https://search.google.com/search-console/
2. Request indexing of key pages:
   - Homepage (`/`)
   - Pricing (`/pricing`)
   - Instructions (`/instructions`)
3. Check **Coverage** report for indexation status
4. Check **Enhancements** section for:
   - Breadcrumb detection
   - Organization schema recognition
   - Any related errors

---

## Expected Rich Results Features

Once all schemas are validated and indexed, you may see:

| Page | Feature | Trigger |
|------|---------|---------|
| Homepage | Sitelink search box | SearchAction schema + high authority |
| Pricing | Product price info | Offer schema + Collection |
| Instructions | FAQ snippets | FAQPage schema with questions/answers |
| All pages | Breadcrumb navigation | BreadcrumbList + proper site structure |
| Trust pages | Knowledge panel info | Organization + Article + WebPage |

---

## Testing Timeline

- **Immediate** (within 24 hours): Run Rich Results Test on all pages
- **Week 1**: Submit sitemap to Google Search Console
- **Week 2-4**: Google crawls and indexes pages with new schemas
- **Week 4-8**: First rich results may start appearing in SERPs (if eligible)
- **Month 2**: Full assessment of rich results coverage

---

## Key Metrics to Monitor

After deployment, track in Google Search Console:

1. **Impressions with Rich Results** - Should increase over time
2. **CTR improvement** - Rich results typically improve CTR 10-30%
3. **Crawl stats** - Should show consistent crawling of sitemap URLs
4. **Coverage report** - All marketing pages should be indexed
5. **Mobile usability** - Ensure no mobile indexing issues

---

## Links & Resources

- **Google Rich Results Test**: https://search.google.com/test/rich-results
- **Schema.org Documentation**: https://schema.org
- **Google Structured Data Guide**: https://developers.google.com/search/docs/beginner/intro-structured-data
- **SERP Feature Preview Tool**: https://www.seotoolscentral.com/serp-preview-tool/
- **Radly Sitemap**: https://radly.app/sitemap.xml
- **Radly Robots.txt**: https://radly.app/robots.txt

---

## Next Steps

1. ✅ **Phase 2 Task 6 (This Task)**: Test all pages in Rich Results Test (manual testing required)
2. **Phase 2 Task 7**: Submit sitemap to Google Search Console
3. **Phase 3**: Monitor search performance and refine based on data
