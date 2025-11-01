import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { marketingGet } from "@/lib/http/marketing";
import { PrimaryCTA, SecondaryCTA } from "@/components/marketing/PrimaryCTA";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { siteConfig } from "@/lib/siteConfig";
import { MobileAppPricingRedirect } from "@/components/pricing/MobileAppPricingRedirect";

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

export const metadata: Metadata = {
  title: "Pricing | Radly assistant plans",
  description: "Compare Radly plans, report limits, and support options. Five complimentary reports included for new teams.",
  openGraph: {
    title: "Radly Pricing",
    description: "Compare Radly assistant plans and choose the right coverage for your team.",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Radly pricing overview",
      },
    ],
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

export default async function PricingPage(props: { searchParams?: Promise<Record<string, string | string[]>> }) {
  const searchParams = await props.searchParams;
  const regionParam = Array.isArray(searchParams?.region) ? searchParams?.region[0] : searchParams?.region;
  const region = regionParam === "international" ? "international" : regionParam === "egypt" || !regionParam ? "egypt" : null;

  if (!region) {
    notFound();
  }

  const tiers = await marketingGet<Tier[]>(`/v1/subscription/tiers?region=${region}`);

  return (
    <div className="bg-[var(--ds-bg-gradient)] text-white">
      {/* Show redirect message for mobile app users */}
      <MobileAppPricingRedirect />

      <main className="mx-auto max-w-6xl px-5 py-16">
        <header className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[rgba(207,207,207,0.55)]">Radly plans</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">Choose the plan that fits your reporting volume</h1>
          <p className="mt-4 text-sm text-[rgba(207,207,207,0.75)] sm:text-base">
            All plans include five complimentary reports to evaluate the assistant. Detailed validation notes are available for compliance teams.
          </p>
        </header>

        <div className="mt-10 flex justify-center gap-2 rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.72)] p-1 text-sm">
          {regions.map((item) => {
            const isActive = item.id === region;
            return (
              <Link
                key={item.id}
                href={item.id === "egypt" ? "/pricing" : `/pricing?region=${item.id}`}
                className={`flex items-center rounded-full px-5 py-2 font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(143,130,255,0.65)] ${
                  isActive
                    ? "bg-[linear-gradient(90deg,#2653FF_0%,#4B8EFF_45%,#8F82FF_100%)] text-white"
                    : "text-[rgba(207,207,207,0.78)] hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

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
                className={`aurora-card h-full border border-[rgba(255,255,255,0.1)] p-6 ${
                  isRecommended ? "ring-1 ring-[rgba(111,231,183,0.5)]" : ""
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
                  Radly assists clinicians. Radiologists review and finalise every report. See <Link href="/validation" className="text-[rgba(143,130,255,0.85)] underline-offset-4 hover:underline">Validation</Link> for methodology.
                </div>

                <PrimaryCTA href={tier.tier_name === "free" ? "/auth/signin" : `/pricing/checkout?tier=${tier.tier_name}&region=${region}`} ariaLabel={`Select the ${tier.tier_display_name} plan`} className="mt-6 w-full">
                  {tier.tier_name === "free" ? "Create free account" : "Subscribe now"}
                </PrimaryCTA>
              </article>
            );
          })}
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
