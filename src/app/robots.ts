import type { MetadataRoute } from "next";
export const dynamic = 'force-static'
import { siteConfig } from "@/lib/siteConfig";

export default function robots(): MetadataRoute.Robots {
  const host = siteConfig.url;
  const sitemapUrl = `${host.replace(/\/$/, "")}/sitemap.xml`;

  return {
    rules: [
      {
        // Allow all bots
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/app",           // Authenticated app pages
          "/auth",          // Authentication flows
          "/api",           // API routes
          "/admin",         // Admin dashboard
          "/*.json",        // JSON files (except sitemap.json)
          "/*?*",           // Query parameters (keep URLs clean)
        ],
        // Crawl delay in seconds
        crawlDelay: 1,
      },
      {
        // Specific rules for Googlebot (more aggressive crawling allowed)
        userAgent: "Googlebot",
        allow: ["/"],
        disallow: ["/app", "/auth", "/api", "/admin"],
        crawlDelay: 0,
      },
      {
        // Block bad bots
        userAgent: "AhrefsBot",
        disallow: ["/"],
      },
      {
        userAgent: "SemrushBot",
        disallow: ["/"],
      },
    ],
    sitemap: sitemapUrl,
    host,
  };
}
