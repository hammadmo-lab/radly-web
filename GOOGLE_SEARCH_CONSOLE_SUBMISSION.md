# Google Search Console Submission Guide

This guide explains how to submit Radly's sitemap to Google Search Console and monitor indexing performance.

## Prerequisites

Before submitting the sitemap, ensure you have:

1. **Google Account**: You must have a Google account to access Search Console
2. **Website Access**: You need to verify ownership of radly.app
3. **Admin Access**: Work with the person managing the Radly Google account

---

## Step 1: Access Google Search Console

1. Navigate to: **https://search.google.com/search-console/welcome**
2. Sign in with your Google account (use the account that manages Radly)
3. You should see "radly.app" in your property list (or add it if missing)

---

## Step 2: Verify Website Ownership (If Needed)

If radly.app is not already verified in Search Console:

### Option A: DNS Record (Recommended for Vercel-hosted sites)
1. Go to **Settings > Owners and permissions**
2. Click **Verify using DNS record**
3. Copy the TXT record provided
4. Add it to radly.app's DNS settings (via domain registrar)
5. Google will automatically verify within 24-48 hours

### Option B: HTML File (If DNS access unavailable)
1. Go to **Verification details** section
2. Download the HTML verification file
3. Upload it to `/public/` directory in the repository
4. Ensure it's accessible at `https://radly.app/[filename]`
5. Complete verification in Search Console

### Option C: Vercel Integration (Easiest)
1. If using Vercel for hosting (which Radly is):
2. Search Console may auto-detect and verify the domain
3. Check the **Verification** tab to confirm status

---

## Step 3: Submit Sitemap to Google Search Console

### Submitting the Sitemap

1. In **Google Search Console**, select the **radly.app** property
2. Click **Sitemaps** in the left sidebar (under Index → Sitemaps)
3. At the top right, click the **+Add/test sitemaps** button
4. Enter: `https://radly.app/sitemap.xml`
5. Click **Submit**

### What to Expect

✅ **Success**: Google displays "Submitted successfully"
- You'll see coverage stats showing how many URLs Google found
- Status may show "Success" immediately or "Pending" (check again in 24 hours)

⚠️ **Pending**: Google is processing the sitemap
- Typically processes within 24 hours
- Check back tomorrow for results

❌ **Issues**: If you see errors:
- Verify sitemap URL is accessible: `curl https://radly.app/sitemap.xml`
- Check that sitemap.xml returns valid XML (not HTML error page)
- Ensure robots.txt allows access to sitemap: `Sitemap: https://radly.app/sitemap.xml`

---

## Step 4: Monitor Sitemap Coverage

After submitting the sitemap:

1. **Immediate** (within minutes):
   - Google discovers the sitemap
   - Displays URL count and coverage stats

2. **Within 24 hours**:
   - Google crawls URLs from the sitemap
   - Updates "Indexed" vs "Not indexed" counts

3. **Expected Coverage for Radly**:
   - Total URLs in sitemap: **8** (marketing pages)
   - Expected indexed: **8/8** (all should be indexed)
   - **Pending errors**: If some URLs are "Excluded" or "Not indexed", investigate

### Interpreting Coverage Metrics

| Status | Meaning | Action |
|--------|---------|--------|
| **Indexed** | URL successfully crawled and indexed | ✅ Good - page appears in search |
| **Pending indexing** | Google found URL but hasn't indexed yet | ℹ️ Wait 24-48 hours |
| **Excluded** | Google found URL but excluded from index | 🔍 Check robots.txt/meta robots |
| **Not found** | URL in sitemap but no crawl attempt | 🔍 Verify URL is accessible |

---

## Step 5: Request Indexing for Critical Pages

To expedite indexing of key pages:

1. In Search Console, click **URL Inspection** tool
2. Enter each critical page URL:
   - `https://radly.app/` (homepage)
   - `https://radly.app/pricing` (conversion page)
   - `https://radly.app/instructions` (onboarding page)
3. Click "Request indexing" button
4. Repeat for each page

**Why this helps**: Tells Google to prioritize crawling these pages immediately rather than waiting for regular crawl schedule.

---

## Step 6: Monitor Search Performance

Over the following weeks, monitor these metrics in Search Console:

### 1. Coverage Report
- Location: **Index > Coverage**
- **What to check**:
  - All 8 marketing pages should show "Valid"
  - No "Excluded" entries for marketing pages
  - Monitor trend: coverage should stay stable

### 2. Performance Report
- Location: **Performance**
- **What to track**:
  - **Impressions**: How often Radly appears in search results
  - **Clicks**: How often users click from search results
  - **CTR**: Click-through rate (should improve with rich results)
  - **Position**: Average ranking position (monitor for improvements)

### 3. Enhancements Report
- Location: **Enhancements**
- **What to look for**:
  - **Breadcrumbs**: Should show 8/8 valid (one per page)
  - **Structured data**: Any schema validation errors
  - **AMP**: Not applicable for Radly

### 4. Mobile Usability
- Location: **Enhancements > Mobile Usability**
- **What to check**:
  - Should show "0 errors" (no mobile issues detected)
  - Monitor for any usability problems reported

---

## Troubleshooting Common Issues

### Issue: "Sitemap is too large"
**Cause**: More than 50,000 URLs in single sitemap
**Solution**: Not applicable for Radly (only 8 marketing pages)

### Issue: "Submitted successfully" but no URLs indexed
**Cause**: Possible robots.txt blocking, server errors, or crawl issues
**Solution**:
1. Check robots.txt allows crawling: `grep -i "disallow" robots.txt`
2. Verify marketing pages are accessible: `curl https://radly.app/pricing`
3. Check Server logs for 403/500 errors
4. Wait 48 hours - Google may be scheduling crawls

### Issue: "Invalid sitemap format"
**Cause**: XML is malformed
**Solution**:
1. Test sitemap validation: `npm run build` (checks for errors)
2. Visit `https://radly.app/sitemap.xml` in browser - should show XML (not HTML)
3. Use XML validator: https://www.xmlvalidation.com/

### Issue: Fewer URLs indexed than expected
**Cause**: Some pages are blocked or have noindex tag
**Solution**:
1. Check each page for meta robots: `<meta name="robots" content="..."`
2. Verify none of the marketing pages have `noindex`
3. Use URL Inspection to see why specific pages weren't indexed

---

## Monitoring Timeline

| When | Action | Metric |
|------|--------|--------|
| **Day 0** | Submit sitemap | Submission confirmation |
| **Day 1** | Check coverage report | URLs found: 8 |
| **Day 2-3** | Wait for crawl | Status: Indexed |
| **Week 1** | Request indexing for key pages | Priority crawl |
| **Week 2** | Monitor impressions | Baseline traffic |
| **Month 1** | Check rich results | Breadcrumb/structured data enhancements |
| **Month 2** | Analyze search performance | CTR improvements from rich results |

---

## Expected Outcomes

### Immediate (Within 1 week)
- ✅ Sitemap submitted and recognized
- ✅ All 8 marketing pages appear in Coverage report
- ✅ Most pages indexed (may see "Pending" for 1-2 pages)

### Short-term (Within 2-4 weeks)
- ✅ All marketing pages indexed (100% coverage)
- ✅ Breadcrumb rich results detected in Enhancements
- ✅ Initial search impressions appear in Performance report
- ✅ First structured data rich results may appear in SERP

### Long-term (Within 2-3 months)
- ✅ Steady search impressions for brand terms
- ✅ Visible improvement in CTR (10-30% typical for rich results)
- ✅ Possible knowledge panel if Organization schema is recognized
- ✅ SearchAction enabling sitelink search box in results

---

## Key Performance Indicators (KPIs) to Monitor

After 30 days, analyze:

1. **Indexation Rate**: Target = 100% (8/8 pages indexed)
2. **Impressions Growth**: Target = +50% vs baseline
3. **Rich Results Coverage**: Target = Breadcrumbs on all 8 pages
4. **CTR Improvement**: Target = +15-30% for pages with rich results
5. **Crawl Stats**: Target = 1-3 crawls per day (healthy)

---

## Advanced: Sitemaps Structure

For future reference, if Radly expands, consider creating multiple sitemaps:

```
sitemap_index.xml
├── sitemap_marketing.xml (current: / /pricing /security etc)
├── sitemap_blog.xml      (future: blog posts)
└── sitemap_dynamic.xml   (future: user-generated content)
```

Submit only `sitemap_index.xml` to Google Search Console.

---

## Next Steps

### Immediate Actions
1. ✅ Verify radly.app ownership in Search Console
2. ✅ Submit `https://radly.app/sitemap.xml` to Search Console
3. ✅ Request indexing for key pages (homepage, pricing, instructions)

### Ongoing Monitoring
1. Check Coverage report daily for first week, then weekly
2. Monitor Performance report for search impressions/clicks
3. Watch Enhancements report for rich results detection

### Phase 3 (Future Work)
- [ ] Create Blog section with Article schema
- [ ] Add local business markup if applicable
- [ ] Implement FAQ schema on more pages
- [ ] Monitor search console monthly for optimization opportunities

---

## Useful Links

- **Google Search Console**: https://search.google.com/search-console/
- **Radly Sitemap**: https://radly.app/sitemap.xml
- **Radly Robots.txt**: https://radly.app/robots.txt
- **Google Sitemap Format**: https://www.sitemaps.org/
- **Search Console Help**: https://support.google.com/webmasters/

---

## Contact & Escalation

If issues persist:

1. **Check Search Console Help**: https://support.google.com/webmasters/
2. **Use URL Inspection Tool**: Provides detailed crawl/index diagnostics
3. **Submit Feedback in Search Console**: Report bugs to Google team
4. **Wait 2-3 weeks**: Sometimes Google just needs time to process

