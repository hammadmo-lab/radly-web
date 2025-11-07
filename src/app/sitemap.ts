import type { MetadataRoute } from "next";
export const dynamic = 'force-static'
import { marketingPaths, siteConfig } from "@/lib/siteConfig";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url.replace(/\/$/, "");
  const currentDate = new Date().toISOString().split('T')[0];

  // Priority levels for different page types
  const getPriority = (path: string): number => {
    if (path === "/") return 1.0;          // Homepage - highest priority
    if (path === "/pricing") return 0.9;   // Key conversion page
    if (path === "/instructions") return 0.9; // Key onboarding page
    if (path === "/about") return 0.85;    // Authority/trust building
    if (path === "/faq") return 0.85;      // Authority/trust building
    if (path === "/security") return 0.8;  // Trust-building page
    if (path === "/validation") return 0.8; // Trust-building page
    if (path === "/contact") return 0.8;   // Trust-building page
    return 0.7;                             // Other pages
  };

  // Change frequency based on page type
  const getChangeFrequency = (path: string): "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never" => {
    if (path === "/") return "weekly";      // Homepage changes frequently
    if (path === "/pricing") return "monthly"; // Pricing may update
    return "monthly";                        // Other pages relatively static
  };

  return marketingPaths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: currentDate,
    changeFrequency: getChangeFrequency(path),
    priority: getPriority(path),
  }));
}
