# Blog Infrastructure Setup Guide

This guide walks through implementing a blog in the Radly frontend using MDX and Next.js.

---

## Architecture Overview

### File Structure

```
radly-frontend/
├── src/
│   ├── app/
│   │   ├── blog/
│   │   │   ├── page.tsx (blog landing/listing page)
│   │   │   ├── layout.tsx (blog layout with sidebar, etc)
│   │   │   └── [slug]/
│   │   │       └── page.tsx (individual blog post template)
│   │   └── ... (other pages)
│   ├── components/
│   │   ├── blog/
│   │   │   ├── BlogPostHeader.tsx
│   │   │   ├── BlogPostFooter.tsx
│   │   │   ├── RecentPosts.tsx
│   │   │   └── TableOfContents.tsx
│   │   └── ... (other components)
│   └── lib/
│       ├── blog.ts (blog utility functions)
│       └── ... (other utilities)
├── content/
│   ├── blog/
│   │   ├── how-to-write-radiology-reports.mdx
│   │   ├── voice-transcription-radiology.mdx
│   │   └── ... (more posts)
│   └── metadata.json (optional: post metadata)
├── next.config.ts (needs @next/mdx)
└── package.json (needs mdx-js dependencies)
```

---

## Step 1: Install MDX Dependencies

```bash
npm install @next/mdx @mdx-js/loader @mdx-js/react
npm install --save-dev @types/mdx
```

Update `package.json` to include:
```json
{
  "dependencies": {
    "@next/mdx": "^15.5.4",
    "@mdx-js/loader": "^3.0.0",
    "@mdx-js/react": "^3.0.0"
  }
}
```

---

## Step 2: Configure Next.js for MDX

Create `next.config.ts`:

```typescript
import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    // Configure @mdx-js/react plugin
    providerImportSource: "@mdx-js/react",
  },
});

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  // ... other config
};

export default withMDX(nextConfig);
```

---

## Step 3: Create Blog Utilities

Create `src/lib/blog.ts`:

```typescript
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  category?: string;
  tags: string[];
  image: string;
  keywords: string[];
  readingTime: number;
}

const blogDir = path.join(process.cwd(), "content/blog");

export function getAllBlogPosts(): BlogPost[] {
  const files = fs.readdirSync(blogDir);

  return files
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const slug = file.replace(".mdx", "");
      const filePath = path.join(blogDir, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContent);

      return {
        slug,
        title: data.title || "Untitled",
        excerpt: data.excerpt || "",
        content,
        author: data.author || "Radly Team",
        publishedAt: data.publishedAt || new Date().toISOString(),
        updatedAt: data.updatedAt,
        category: data.category || "General",
        tags: data.tags || [],
        image: data.image || "/blog/default-image.jpg",
        keywords: data.keywords || [],
        readingTime: calculateReadingTime(content),
      };
    })
    .sort((a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  const posts = getAllBlogPosts();
  return posts.find((post) => post.slug === slug) || null;
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export function getBlogCategories(): string[] {
  const posts = getAllBlogPosts();
  return [...new Set(posts.map((post) => post.category))];
}
```

Install gray-matter for parsing frontmatter:
```bash
npm install gray-matter
npm install --save-dev @types/node
```

---

## Step 4: Create Blog Landing Page

Create `src/app/blog/page.tsx`:

```typescript
import { Metadata } from "next";
import { getAllBlogPosts } from "@/lib/blog";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog | Radly Assistant",
  description: "Expert insights on radiology reporting, clinical workflows, and healthcare AI technology.",
  alternates: {
    canonical: "https://radly.app/blog",
  },
};

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <div className="min-h-screen bg-[var(--ds-bg-gradient)] text-white">
      <main className="mx-auto max-w-4xl px-5 py-16">
        <header className="mb-12 space-y-4">
          <h1 className="text-4xl font-semibold sm:text-5xl">Radly Blog</h1>
          <p className="text-lg text-[rgba(207,207,207,0.75)]">
            Expert insights on radiology reporting, clinical workflows, and AI in healthcare.
          </p>
        </header>

        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="aurora-card border border-[rgba(255,255,255,0.1)] p-6 hover:border-[rgba(255,255,255,0.2)] transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <time className="text-sm text-[rgba(207,207,207,0.55)]">
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  {post.category && (
                    <span className="inline-block rounded-full bg-[rgba(143,130,255,0.2)] px-3 py-1 text-xs font-semibold text-[rgba(143,130,255,0.9)]">
                      {post.category}
                    </span>
                  )}
                  <span className="text-sm text-[rgba(207,207,207,0.55)]">
                    {post.readingTime} min read
                  </span>
                </div>

                <Link href={`/blog/${post.slug}`}>
                  <h2 className="text-2xl font-semibold hover:text-[rgba(143,130,255,0.85)] transition-colors">
                    {post.title}
                  </h2>
                </Link>

                <p className="text-[rgba(207,207,207,0.75)]">{post.excerpt}</p>

                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-[rgba(143,130,255,0.1)] text-[rgba(143,130,255,0.8)] px-2 py-1 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 text-[rgba(143,130,255,0.85)] hover:text-[rgba(143,130,255,1)] transition-colors"
                >
                  Read article
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
```

---

## Step 5: Create Blog Post Template

Create `src/app/blog/[slug]/page.tsx`:

```typescript
import { Metadata } from "next";
import { getBlogPostBySlug, getAllBlogPosts } from "@/lib/blog";
import { notFound } from "next/navigation";
import MDXContent from "@/components/blog/MDXContent";
import BlogPostHeader from "@/components/blog/BlogPostHeader";
import BlogPostFooter from "@/components/blog/BlogPostFooter";
import RecentPosts from "@/components/blog/RecentPosts";

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    return {};
  }

  return {
    title: `${post.title} | Radly Blog`,
    description: post.excerpt,
    keywords: post.keywords,
    alternates: {
      canonical: `https://radly.app/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      images: [{ url: post.image }],
    },
  };
}

export default function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const blogPostSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.image,
    "datePublished": post.publishedAt,
    "dateModified": post.updatedAt || post.publishedAt,
    "author": {
      "@type": "Person",
      "name": post.author,
    },
    "publisher": {
      "@type": "Organization",
      "name": "Radly",
      "logo": {
        "@type": "ImageObject",
        "url": "https://radly.app/icon-512.png",
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://radly.app/blog/${post.slug}`,
    },
  };

  return (
    <div className="min-h-screen bg-[var(--ds-bg-gradient)] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostSchema) }}
      />

      <main className="mx-auto max-w-4xl px-5 py-16">
        <BlogPostHeader post={post} />

        <article className="prose prose-invert max-w-none">
          <MDXContent slug={post.slug} />
        </article>

        <BlogPostFooter post={post} />

        <div className="mt-16 border-t border-[rgba(255,255,255,0.1)] pt-12">
          <h3 className="text-2xl font-semibold mb-6">Recent posts</h3>
          <RecentPosts excludeSlug={post.slug} />
        </div>
      </main>
    </div>
  );
}
```

---

## Step 6: Create Blog Components

Create `src/components/blog/BlogPostHeader.tsx`:

```typescript
import { BlogPost } from "@/lib/blog";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BlogPostHeader({ post }: { post: BlogPost }) {
  return (
    <header className="mb-12 space-y-6">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-[rgba(143,130,255,0.85)] hover:text-[rgba(143,130,255,1)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to blog
      </Link>

      <div className="space-y-4">
        <h1 className="text-4xl sm:text-5xl font-semibold leading-tight">
          {post.title}
        </h1>

        <p className="text-lg text-[rgba(207,207,207,0.75)]">{post.excerpt}</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 border-t border-[rgba(255,255,255,0.1)]">
        <time className="text-sm text-[rgba(207,207,207,0.55)]">
          Published {new Date(post.publishedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>

        {post.readingTime && (
          <span className="text-sm text-[rgba(207,207,207,0.55)]">
            {post.readingTime} min read
          </span>
        )}

        {post.author && (
          <span className="text-sm text-[rgba(207,207,207,0.55)]">
            By {post.author}
          </span>
        )}
      </div>
    </header>
  );
}
```

Create `src/components/blog/RecentPosts.tsx`:

```typescript
import { getAllBlogPosts } from "@/lib/blog";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function RecentPosts({
  limit = 3,
  excludeSlug,
}: {
  limit?: number;
  excludeSlug?: string;
}) {
  const posts = getAllBlogPosts()
    .filter((post) => post.slug !== excludeSlug)
    .slice(0, limit);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <Link key={post.slug} href={`/blog/${post.slug}`}>
          <div className="aurora-card border border-[rgba(255,255,255,0.1)] p-6 h-full hover:border-[rgba(255,255,255,0.2)] transition-colors cursor-pointer">
            <time className="text-sm text-[rgba(207,207,207,0.55)]">
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </time>

            <h3 className="mt-3 text-lg font-semibold line-clamp-2">
              {post.title}
            </h3>

            <p className="mt-2 text-sm text-[rgba(207,207,207,0.75)] line-clamp-2">
              {post.excerpt}
            </p>

            <div className="mt-4 flex items-center gap-2 text-[rgba(143,130,255,0.85)]">
              Read more
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
```

---

## Step 7: Create Blog Content

Create `content/blog/how-to-write-radiology-reports.mdx`:

```mdx
---
title: "How to Write Structured Radiology Reports: A Complete Guide"
excerpt: "Learn the essential components of structured radiology reports with practical examples and best practices."
author: "Dr. John Smith"
publishedAt: "2025-11-15"
updatedAt: "2025-11-20"
category: "Best Practices"
tags: ["reporting", "structure", "clinical"]
image: "/blog/radiology-reports.jpg"
keywords: ["structured radiology reports", "report writing", "radiology standards", "clinical documentation"]
---

# How to Write Structured Radiology Reports: A Complete Guide

Structured radiology reports are the foundation of clear communication in medical imaging. In this guide, we'll explore the essential components and best practices.

## The Four Core Sections

Every radiology report should include these sections:

### 1. History
Brief clinical context for the exam...

### 2. Technique
What imaging modality was used...

### 3. Findings
The actual observations...

### 4. Impression
Clinical summary and key conclusions...

## Best Practices by Modality

### CT Imaging
Special considerations for CT reports...

### Ultrasound
Guidelines specific to ultrasound...

## Common Mistakes to Avoid

1. Unclear language
2. Excessive detail
3. Missing key findings

## Conclusion

Structured reporting improves clarity and efficiency across your department. [Learn how Radly helps](https://radly.app/pricing).
```

---

## Step 8: Update Sitemap

Update `src/app/sitemap.ts` to include blog posts:

```typescript
import type { MetadataRoute } from "next";
import { marketingPaths, siteConfig } from "@/lib/siteConfig";
import { getAllBlogPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url.replace(/\/$/, "");

  // Marketing pages
  const marketingUrls = marketingPaths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Blog posts
  const blogPosts = getAllBlogPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt || post.publishedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Blog landing page
  const blogLanding = {
    url: `${baseUrl}/blog`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: "weekly" as const,
    priority: 0.8,
  };

  return [...marketingUrls, blogLanding, ...blogPosts];
}
```

---

## Step 9: Update Navigation

Add blog link to homepage or main navigation:

```typescript
<Link href="/blog" className="...">
  Blog
</Link>
```

---

## Testing

```bash
# Test build
npm run build

# Test dev server
npm run dev

# Visit blog pages
# http://localhost:3000/blog (landing)
# http://localhost:3000/blog/how-to-write-radiology-reports (post)
```

---

## Next Steps

1. **Create content directory**: `mkdir -p content/blog`
2. **Add first blog post**: Copy example post to `.mdx` file
3. **Test locally**: `npm run dev` and visit `/blog`
4. **Build and deploy**: Standard deployment process

---

## Common Issues & Solutions

**Issue**: Blog posts not showing up
- **Solution**: Ensure `.mdx` files are in `content/blog/` directory with proper frontmatter

**Issue**: MDX syntax not working
- **Solution**: Check Next.js version (15.0+), reinstall `@next/mdx`

**Issue**: Build fails with MDX error
- **Solution**: Check `next.config.ts` has proper MDX configuration

**Issue**: Blog slugs not generating static params correctly
- **Solution**: Verify `generateStaticParams()` is returning correct format

---

## Resources

- [Next.js MDX Documentation](https://nextjs.org/docs/app/building-your-application/configuring/mdx)
- [MDX Syntax Reference](https://mdxjs.com/)
- [gray-matter Package](https://www.npmjs.com/package/gray-matter)
- [Schema.org BlogPosting](https://schema.org/BlogPosting)

