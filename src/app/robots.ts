import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/siteConfig";

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  const host = siteConfig.url;
  const sitemapUrl = `${host.replace(/\/$/, "")}/sitemap.xml`;

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/app", "/auth", "/api"],
      },
    ],
    sitemap: sitemapUrl,
    host,
  };
}
