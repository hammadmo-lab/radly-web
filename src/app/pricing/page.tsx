import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Check, ArrowRight } from "lucide-react";
import { marketingGet } from "@/lib/http/marketing";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Breadcrumb } from "@/components/marketing/Breadcrumb";
import { MobileAppPricingRedirect } from "@/components/pricing/MobileAppPricingRedirect";
import { RegionDetectionWrapper } from "@/components/pricing/RegionDetectionWrapper";
import { PricingPageContent, type Tier } from "@/components/pricing/PricingPageContent";

export const dynamic = "force-dynamic";

const metadataDescription = "Radly pricing: free tier + paid plans with full template library, priority processing, and enterprise support. Compare now. Includes 5 complimentary reports.";

export const metadata: Metadata = {
  title: "Pricing | Radly assistant plans | Radly Assistant",
  description: metadataDescription,
  alternates: {
    canonical: "https://radly.app/pricing",
  },
  openGraph: {
    title: "Radly Pricing Plans - Free and Paid Tiers",
    description: metadataDescription,
    url: "https://radly.app/pricing",
    type: "website",
    images: [
      {
        url: "https://radly.app/og-default.png",
        width: 1200,
        height: 630,
        alt: "Radly pricing plans - compare free, starter, professional, and premium tiers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Radly Pricing Plans",
    description: "Compare Radly assistant plans and report limits for your team",
    images: ["https://radly.app/og-default.png"],
  },
};

function formatPrice(tier: Tier) {
  if (tier.price_monthly === 0) return "Free";
  return `${tier.price_monthly.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${tier.currency}/month`;
}
export default async function PricingPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[]>> }) {
  const sp = searchParams ? await searchParams : undefined;
  const regionParam = Array.isArray(sp?.region) ? sp?.region[0] : sp?.region;
  const region = regionParam === "international" ? "international" : regionParam === "egypt" || !regionParam ? "egypt" : null;

  if (!region) {
    notFound();
  }

  // Check if middleware detected the region
  const headersList = await headers();
  const regionDetected = headersList.get('x-region-detected') === 'true';

  const tiers = await marketingGet<Tier[]>(`/v1/subscription/tiers?region=${region}`);

  // Build WebPage schema
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://radly.app/pricing",
    "name": "Pricing | Radly assistant plans",
    "description": metadataDescription,
    "url": "https://radly.app/pricing",
    "isPartOf": {
      "@id": "https://radly.app/#organization"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Radly",
      "logo": {
        "@type": "ImageObject",
        "url": "https://radly.app/icon-512.png"
      }
    }
  };

  // Build ProductCollection schema from pricing tiers
  const pricingSchema = {
    "@context": "https://schema.org",
    "@type": "Collection",
    "name": "Radly Pricing Plans",
    "description": metadataDescription,
    "url": "https://radly.app/pricing",
    "offers": tiers.map((tier) => ({
      "@type": "Offer",
      "name": tier.tier_display_name,
      "description": `${tier.monthly_report_limit} reports per month with ${formatPrice(tier)}`,
      "price": tier.price_monthly.toString(),
      "priceCurrency": tier.currency,
      "availability": "https://schema.org/InStock",
      "url": tier.tier_name === "free"
        ? "https://radly.app/auth/signin"
        : `https://radly.app/pricing/checkout?tier=${tier.tier_name}&region=${region}`
    }))
  };

  return (
    <div className="bg-[var(--ds-bg-gradient)] text-white">
      <script
        id="pricing-webpage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        id="pricing-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema) }}
      />
      {/* Show redirect message for mobile app users */}
      <MobileAppPricingRedirect />

      <main className="mx-auto max-w-7xl px-5 py-16">
        <Breadcrumb items={[
          { label: "Home", url: "/" },
          { label: "Pricing", url: "/pricing" }
        ]} />

        {/* Region detection wrapper with fallback modal */}
        <RegionDetectionWrapper regionDetected={regionDetected} />

        <div className="mt-8">
          <PricingPageContent tiers={tiers} region={region} />
        </div>

        <noscript>
          <table className="mt-12 w-full border border-[rgba(255,255,255,0.12)] text-left text-sm text-[rgba(207,207,207,0.78)]">
            <caption className="p-4 font-semibold text-white">Radly pricing tiers</caption>
            <thead>
              <tr className="bg-[rgba(12,16,28,0.75)] text-white">
                <th className="p-3">Plan</th>
                <th className="p-3">Monthly price</th>
                <th className="p-3">Reports / month</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier) => {
                return (
                  <tr key={`noscript-${tier.tier_id}`} className="border-t border-[rgba(255,255,255,0.12)]">
                    <td className="p-3 text-white">{tier.tier_display_name}</td>
                    <td className="p-3">{formatPrice(tier)}</td>
                    <td className="p-3">{tier.monthly_report_limit}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </noscript>
      </main>

      <MarketingFooter />
    </div >
  );
}


