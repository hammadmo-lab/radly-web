import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Lock, ClipboardList, Archive, ArrowRight } from "lucide-react";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { PrimaryCTA, SecondaryCTA } from "@/components/marketing/PrimaryCTA";
import { Breadcrumb } from "@/components/marketing/Breadcrumb";

export const dynamic = "force-static";

const commitments = [
  {
    icon: Lock,
    title: "Encryption",
    body: "Data in transit is encrypted with TLS 1.2+ and data at rest is encrypted using AES-256 aligned with cloud-provider best practice.",
  },
  {
    icon: ClipboardList,
    title: "Access controls",
    body: "Role-based access limits internal data access. Administrative actions require SSO and are audited.",
  },
  {
    icon: Archive,
    title: "Retention",
    body: "Async job results expire after six hours while usage and audit logs stay available for 90 days before automatic cleanup.",
  },
];

const metadataDescription = "Enterprise-grade security controls. TLS 1.2+ encryption, AES-256 at-rest, role-based access, SSO, 90-day audit logs. HIPAA-ready architecture.";

export const metadata: Metadata = {
  title: "Security | Radly controls and safeguards | Radly Assistant",
  description: metadataDescription,
  alternates: {
    canonical: "https://radly.app/security",
  },
  openGraph: {
    title: "Radly Security & Compliance",
    description: metadataDescription,
    url: "https://radly.app/security",
    type: "article",
    images: [
      {
        url: "https://radly.app/og-default.png",
        width: 1200,
        height: 630,
        alt: "Radly Security Controls - Enterprise-grade encryption and compliance",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Radly Security & Data Protection",
    description: "Enterprise security controls for healthcare data",
    images: ["https://radly.app/og-default.png"],
  },
};

export default function SecurityPage() {
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://radly.app/security",
    "name": "Security | Radly controls and safeguards",
    "description": metadataDescription,
    "url": "https://radly.app/security",
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

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "How Radly protects clinician and patient data",
    "description": metadataDescription,
    "image": "https://radly.app/og-default.png",
    "datePublished": "2025-11-05",
    "dateModified": new Date().toISOString().split('T')[0],
    "author": {
      "@type": "Organization",
      "name": "Radly",
      "url": "https://radly.app"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Radly",
      "logo": {
        "@type": "ImageObject",
        "url": "https://radly.app/icon-512.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://radly.app/security"
    }
  };

  return (
    <div className="bg-[var(--ds-bg-gradient)] text-white">
      <script
        id="security-webpage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        id="security-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <main className="mx-auto max-w-4xl px-5 py-16">
        <header className="space-y-4">
          <Breadcrumb items={[
            { label: "Home", url: "/" },
            { label: "Security", url: "/security" }
          ]} />
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[rgba(207,207,207,0.55)]">Security and compliance</p>
          <h1 className="text-4xl font-semibold leading-tight">How Radly protects clinician and patient data</h1>
          <p className="text-sm text-[rgba(207,207,207,0.75)] sm:text-base">
            Radly supports radiologists with an assistant workflow. This page summarises the controls we use to safeguard data, honour deletion requests, and support compliance reviews.
          </p>
        </header>

        <section className="mt-12 space-y-6">
          <h2 className="text-3xl font-semibold">Core safeguards</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {commitments.map((item) => (
              <div key={item.title} className="aurora-card border border-[rgba(255,255,255,0.1)] p-6 text-sm text-[rgba(207,207,207,0.72)]">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(143,130,255,0.35)] bg-[rgba(12,16,28,0.65)] text-[#D7E3FF]">
                  <item.icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-3xl font-semibold">Audit and monitoring</h2>
          <ul className="space-y-3 text-sm text-[rgba(207,207,207,0.75)]">
            <li>
              <ShieldCheck className="mr-2 inline h-4 w-4 text-[rgba(111,231,183,0.85)]" aria-hidden />
              Access logs are retained for 90 days and can be shared with partner security teams on request.
            </li>
            <li>
              <ShieldCheck className="mr-2 inline h-4 w-4 text-[rgba(111,231,183,0.85)]" aria-hidden />
              Administrative actions (template updates, user changes) require multi-factor authentication and are reviewed weekly.
            </li>
            <li>
              <ShieldCheck className="mr-2 inline h-4 w-4 text-[rgba(111,231,183,0.85)]" aria-hidden />
              Third-party vendors undergo regular security reviews aligned with their risk profile.
            </li>
          </ul>
        </section>

        <section className="mt-12 space-y-4 rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.68)] p-6 text-sm text-[rgba(207,207,207,0.75)]">
          <h2 className="text-2xl font-semibold text-white">Data subject requests</h2>
          <p>
            Email <Link href="mailto:privacy@radly.app" className="text-[rgba(143,130,255,0.85)] underline-offset-4 hover:underline">privacy@radly.app</Link> to request deletion, export, or to review subprocessors. We respond within two business days.
          </p>
          <p>Radly assists clinicians. Radiologists review and finalise every report.</p>
        </section>

        <section className="mt-16 space-y-4 text-center">
          <h2 className="text-3xl font-semibold">Ready to evaluate with your security team?</h2>
          <p className="text-sm text-[rgba(207,207,207,0.72)] sm:text-base">
            Download the compliance pack or contact us for a tailored review. Five complimentary reports are included for trials.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <PrimaryCTA href="/auth/signin" ariaLabel="Create a Radly account from the security page">
              Get started free
            </PrimaryCTA>
            <SecondaryCTA href="mailto:security@radly.app" ariaLabel="Email the Radly security team">
              Contact security team
            </SecondaryCTA>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs">
            <Link href="/validation" className="inline-flex items-center gap-1 text-[rgba(143,130,255,0.85)] underline-offset-4 hover:underline">
              Review validation
              <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
            <span className="hidden sm:inline text-[rgba(207,207,207,0.3)]">•</span>
            <Link href="/instructions" className="inline-flex items-center gap-1 text-[rgba(143,130,255,0.85)] underline-offset-4 hover:underline">
              See how it works
              <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
