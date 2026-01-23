import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Check, ArrowRight, Briefcase, Truck, RotateCcw, Lock, Mail } from "lucide-react";
import { marketingGet } from "@/lib/http/marketing";
import { PrimaryCTA, SecondaryCTA } from "@/components/marketing/PrimaryCTA";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Breadcrumb } from "@/components/marketing/Breadcrumb";
import { MobileAppPricingRedirect } from "@/components/pricing/MobileAppPricingRedirect";
import { RegionDetectionWrapper } from "@/components/pricing/RegionDetectionWrapper";

export const dynamic = "force-dynamic";

type TierFeatures = {
  templates?: string;
  queue_priority?: number;
  support?: string;
};

interface Tier {
  tier_id: number;
  tier_name: string;
  tier_display_name: string;
  monthly_report_limit: number;
  price_monthly: number;
  currency: string;
  features: string;
}

const regions = [
  { id: "egypt", label: "Egypt (EGP)" },
  { id: "international", label: "International (USD)" },
] as const;

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

function parseFeatures(raw: string): TierFeatures {
  try {
    return JSON.parse(raw) as TierFeatures;
  } catch (error) {
    console.warn("Failed to parse tier features", error);
    return {} as TierFeatures;
  }
}

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

      <main className="mx-auto max-w-6xl px-5 py-16">
        <header className="text-center space-y-4">
          <Breadcrumb items={[
            { label: "Home", url: "/" },
            { label: "Pricing", url: "/pricing" }
          ]} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[rgba(207,207,207,0.55)]">Radly plans</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">Choose the plan that fits your reporting volume</h1>
          </div>
          <p className="mt-4 text-sm text-[rgba(207,207,207,0.75)] sm:text-base">
            All plans include five complimentary reports to evaluate the assistant. Detailed validation notes are available for compliance teams.{" "}
            <a href="#pricing-policies" className="text-[rgba(245,215,145,0.9)] underline-offset-4 hover:underline">
              Need policies?
            </a>
          </p>
        </header>

        {/* Region detection wrapper with fallback modal */}
        <RegionDetectionWrapper regionDetected={regionDetected} />

        <section className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier) => {
            const features = parseFeatures(tier.features);
            const isRecommended = tier.tier_name === "professional";
            const hasPriorityProcessing = typeof features.queue_priority === "number" && features.queue_priority > 0;
            const supportLabel = typeof features.support === "string" && features.support.trim().length
              ? features.support.trim()
              : null;

            return (
              <article
                key={tier.tier_id}
                className={`aurora-card h-full border border-[rgba(255,255,255,0.1)] p-6 ${isRecommended ? "ring-1 ring-[rgba(111,231,183,0.5)]" : ""
                  }`}
              >
                {isRecommended ? (
                  <span className="mb-4 inline-flex items-center rounded-full bg-[rgba(111,231,183,0.18)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[rgba(111,231,183,0.9)]">
                    Most selected
                  </span>
                ) : null}
                <h2 className="text-2xl font-semibold text-white">{tier.tier_display_name}</h2>
                <div className="mt-2 text-sm text-[rgba(207,207,207,0.72)]">{formatPrice(tier)}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.28em] text-[rgba(207,207,207,0.55)]">
                  {tier.monthly_report_limit} reports/month
                </div>

                <ul className="mt-6 space-y-3 text-sm text-[rgba(207,207,207,0.75)]">
                  <li className="flex items-start gap-2">
                    <Check className="mt-1 h-4 w-4 text-[rgba(111,231,183,0.85)]" aria-hidden />
                    <span>{features.templates === "all" ? "Access to the full Radly template library" : "Core template library"}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-1 h-4 w-4 text-[rgba(111,231,183,0.85)]" aria-hidden />
                    <span>Structured DOCX export and copy-to-clipboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-1 h-4 w-4 text-[rgba(111,231,183,0.85)]" aria-hidden />
                    <span>{hasPriorityProcessing ? "Priority assistant processing" : "Standard assistant processing"}</span>
                  </li>
                  {supportLabel ? (
                    <li className="flex items-start gap-2">
                      <Check className="mt-1 h-4 w-4 text-[rgba(111,231,183,0.85)]" aria-hidden />
                      <span>{supportLabel}</span>
                    </li>
                  ) : null}
                </ul>

                <div className="mt-8 text-sm text-[rgba(207,207,207,0.65)]">
                  Radly assists clinicians. Radiologists review and finalise every report. See <Link href="/validation" className="text-[rgba(245,215,145,0.9)] underline-offset-4 hover:underline">Validation</Link> for methodology.
                </div>

                <PrimaryCTA href={tier.tier_name === "free" ? "/auth/signin" : `/pricing/checkout?tier=${tier.tier_name}&region=${region}`} ariaLabel={`Select the ${tier.tier_display_name} plan`} className="mt-6 w-full">
                  {tier.tier_name === "free" ? "Create free account" : "Subscribe now"}
                </PrimaryCTA>
              </article>
            );
          })}
        </section>
        <section
          id="pricing-policies"
          className="mt-12 rounded-3xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.7)] p-8 shadow-[0_30px_80px_rgba(12,16,28,0.55)]"
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.5em] text-[rgba(255,255,255,0.55)]">Compliance</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Digital Service Policies</h2>
              <p className="mt-3 text-base text-[rgba(207,207,207,0.78)] max-w-3xl">
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <PolicyCard
                icon={<Briefcase className="h-5 w-5 text-[rgba(111,231,183,0.9)]" aria-hidden />}
                title="Services & Pricing"
                description="Radly provides digital-only radiology report generation through monthly subscriptions. Tiers match the cards above: Free (5 reports/month), Starter (20 reports/month), Professional (100 reports/month), and Premium with enterprise-managed capacity and dedicated support. Every plan unlocks immediately after you create or upgrade an account."
              />
              <PolicyCard
                icon={<Truck className="h-5 w-5 text-[rgba(245,215,145,0.95)]" aria-hidden />}
                title="Delivery & Shipping"
                description="Access is delivered online - no physical products, couriers, or shipping timelines. Subscribers can use both the dashboard and API as soon as their tier is active."
              />
              <PolicyCard
                icon={<RotateCcw className="h-5 w-5 text-[rgba(248,183,77,0.9)]" aria-hidden />}
                title="Returns & Refunds"
                description="Because reports are generated digitally, they cannot be “returned.” You may cancel or downgrade before the next billing date to stop future charges. Refunds are only issued for duplicate billings or verified service outages reported to support within 7 days of the charge."
              />
              <PolicyCard
                icon={<Lock className="h-5 w-5 text-[rgba(239,68,68,0.9)]" aria-hidden />}
                title="Privacy"
                description={
                  <>
                    We only process the clinical text you submit to generate reports and retain exports for a limited window. Detailed handling is documented in our{" "}
                    <Link href="https://radly.app/privacy" className="text-[rgba(245,215,145,0.95)] underline-offset-4 hover:underline">
                      Privacy Policy
                    </Link>
                    , and questions are always welcome.
                  </>
                }
              />
              <PolicyCard
                icon={<Mail className="h-5 w-5 text-[rgba(59,130,246,0.9)]" aria-hidden />}
                title="Contact"
                description="Email support@radly.app for billing or account questions, call 01090000773, or reach us on Facebook at www.facebook.com/radlyapp. We are based in Egypt."
                fullWidth
              />
            </div>
          </div>
        </section>

        <section className="mt-16 space-y-4 rounded-3xl border border-[rgba(255,255,255,0.1)] bg-[rgba(12,16,28,0.65)] p-8 text-center">
          <h2 className="text-3xl font-semibold">Need a detailed comparison?</h2>
          <p className="text-sm text-[rgba(207,207,207,0.72)] sm:text-base">
            Download the plan matrix or contact the team for bespoke agreements.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <PrimaryCTA href="/auth/signin" ariaLabel="Create a Radly account from pricing">
              Get started free
              <Check className="ml-2 h-5 w-5" aria-hidden />
            </PrimaryCTA>
            <SecondaryCTA href="mailto:sales@radly.app" ariaLabel="Email Radly sales">
              Talk to sales
            </SecondaryCTA>
          </div>
          <p className="text-xs uppercase tracking-[0.24em] text-[rgba(207,207,207,0.55)]">
            Includes five complimentary reports • No billing setup required to evaluate
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs">
            <Link href="/instructions" className="inline-flex items-center gap-1 text-[rgba(245,215,145,0.9)] underline-offset-4 hover:underline">
              See workflow guide
              <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
            <span className="hidden sm:inline text-[rgba(207,207,207,0.3)]">•</span>
            <Link href="/security" className="inline-flex items-center gap-1 text-[rgba(111,231,183,0.85)] underline-offset-4 hover:underline">
              Security & compliance
              <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          </div>
        </section>

        <noscript>
          <table className="mt-12 w-full border border-[rgba(255,255,255,0.12)] text-left text-sm text-[rgba(207,207,207,0.78)]">
            <caption className="p-4 font-semibold text-white">Radly pricing tiers</caption>
            <thead>
              <tr className="bg-[rgba(12,16,28,0.75)] text-white">
                <th className="p-3">Plan</th>
                <th className="p-3">Monthly price</th>
                <th className="p-3">Reports / month</th>
                <th className="p-3">Key features</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier) => {
                const features = parseFeatures(tier.features);
                return (
                  <tr key={`noscript-${tier.tier_id}`} className="border-t border-[rgba(255,255,255,0.12)]">
                    <td className="p-3 text-white">{tier.tier_display_name}</td>
                    <td className="p-3">{formatPrice(tier)}</td>
                    <td className="p-3">{tier.monthly_report_limit}</td>
                    <td className="p-3">
                      Templates: {features.templates === "all" ? "All" : "Core"}; queue: {(features.queue_priority ?? 0) > 0 ? "Priority" : "Standard"}; DOCX export; support options.
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </noscript>
      </main>

      <MarketingFooter />
    </div>
  );
}

type PolicyCardProps = {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  fullWidth?: boolean;
};

function PolicyCard({ icon, title, description, fullWidth }: PolicyCardProps) {
  return (
    <div className={`flex gap-4 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-5 ${fullWidth ? "md:col-span-2" : ""}`}>
      <div className="rounded-2xl bg-[rgba(255,255,255,0.08)] p-3">
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-[15px] leading-relaxed text-[rgba(207,207,207,0.82)]">{description}</p>
      </div>
    </div>
  );
}
