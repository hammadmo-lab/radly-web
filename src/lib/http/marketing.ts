import { getAuthHeaderName } from '@/lib/config';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE;
const CLIENT_KEY = process.env.NEXT_PUBLIC_RADLY_CLIENT_KEY;

const pricingFallback = {
  egypt: [
    {
      tier_id: 1,
      tier_name: "free",
      tier_display_name: "Starter",
      monthly_report_limit: 25,
      price_monthly: 0,
      currency: "EGP",
      features: JSON.stringify({
        templates: "core",
        queue_priority: 0,
      }),
    },
    {
      tier_id: 2,
      tier_name: "professional",
      tier_display_name: "Professional",
      monthly_report_limit: 120,
      price_monthly: 1750,
      currency: "EGP",
      features: JSON.stringify({
        templates: "all",
        queue_priority: 1,
        support: "Priority email support",
      }),
    },
  ],
  international: [
    {
      tier_id: 3,
      tier_name: "free",
      tier_display_name: "Starter",
      monthly_report_limit: 25,
      price_monthly: 0,
      currency: "USD",
      features: JSON.stringify({
        templates: "core",
        queue_priority: 0,
      }),
    },
    {
      tier_id: 4,
      tier_name: "professional",
      tier_display_name: "Professional",
      monthly_report_limit: 120,
      price_monthly: 199,
      currency: "USD",
      features: JSON.stringify({
        templates: "all",
        queue_priority: 1,
        support: "Priority email support",
      }),
    },
  ],
};

function resolveFallback<T>(path: string): T {
  if (path.startsWith("/v1/subscription/tiers")) {
    if (path.includes("region=international")) {
      return pricingFallback.international as T;
    }
    return pricingFallback.egypt as T;
  }

  throw new Error(`No fallback defined for marketing path: ${path}`);
}

export async function marketingGet<T>(path: string): Promise<T> {
  if (!BASE_URL || !CLIENT_KEY) {
    console.warn("[marketingGet] Missing API configuration. Returning fallback data for", path);
    return resolveFallback<T>(path);
  }

  // Determine which auth header to use based on environment
  // Production (edge.radly.app) uses x-client-key, staging uses x-api-key
  const authHeaderName = getAuthHeaderName();

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: {
        [authHeaderName]: CLIENT_KEY,
        "X-Request-Id": crypto.randomUUID(),
      },
      cache: "no-store",
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${path}: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.warn("[marketingGet] Fetch failed, using fallback data for", path, error);
    return resolveFallback<T>(path);
  }
}
