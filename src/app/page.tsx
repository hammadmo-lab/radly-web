import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Brain, CheckCircle2, ClipboardList, Layers, Sparkles } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";
import { PrimaryCTA, SecondaryCTA } from "@/components/marketing/PrimaryCTA";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export const dynamic = "force-static";

const workflowSteps = [
  {
    title: "Capture findings",
    description:
      "Dictate or paste the headline findings. Radly recognises modality, laterality, and comparison cues instantly.",
  },
  {
    title: "Assistant assembles",
    description:
      "The assistant drafts structured sections – history, technique, findings, impression – following your template guidance.",
  },
  {
    title: "You review",
    description:
      "Radiologists stay in command, editing or annotating in seconds before exporting to your downstream workflow.",
  },
];

const valuePillars = [
  {
    icon: Brain,
    title: "Clinical nuance",
    description: "Understands modality terminology and comparison language drawn from radiology best practice.",
  },
  {
    icon: Layers,
    title: "Structured output",
    description: "Delivers fully structured text ready for PACS, templates, or resident teaching files.",
  },
  {
    icon: ClipboardList,
    title: "Assistant workflow",
    description: "Designed to support clinical judgement while reducing clerical effort across the reading room.",
  },
];

const comparisonPoints = [
  {
    radly: "Purpose-built assistant with safeguards around modality context and structured sections.",
    generic: "General language model that requires constant prompting and manual clean-up.",
  },
  {
    radly: "Voice capture tuned for radiology vocabulary with guidance for measurements and staging.",
    generic: "Basic dictation without medical language support or template awareness.",
  },
  {
    radly: "Supports residents and consultants alike while keeping sign-off firmly with the radiologist.",
    generic: "Chat-style experience that blurs ownership of the final report.",
  },
];

const spotlightHighlights = [
  "Median draft time under two minutes in internal validation.",
  "High transcription accuracy measured on cross-modality samples.",
  "Five complimentary reports so teams can trial without procurement friction.",
];

const stats = [
  {
    value: "< 2 minutes",
    label: "Median draft time in internal tests",
  },
  {
    value: "High accuracy",
    label: "Voice transcription on clinical vocabulary",
  },
  {
    value: "5 reports",
    label: "Complimentary to start, no credit card",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: siteConfig.name,
  applicationCategory: "HealthApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Five complimentary reports to evaluate Radly.",
  },
  areaServed: "Global",
  operatingSystem: "Web",
  url: siteConfig.url,
};

export const metadata: Metadata = {
  title: "Radly Assistant | Voice-supported radiology reporting",
  description:
    "Radly is a voice-supported assistant that helps radiologists draft structured reports quickly while keeping clinicians in full control.",
  openGraph: {
    title: "Radly Assistant",
    description:
      "Voice-supported reporting that keeps radiologists in command of every case.",
    url: siteConfig.url,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Radly Assistant interface preview",
      },
    ],
  },
  twitter: {
    title: "Radly Assistant",
    description: "Voice-supported reporting built for radiologists.",
    card: "summary_large_image",
    images: [siteConfig.ogImage],
  },
};

export default function Home() {
  return (
    <div className="bg-[var(--ds-bg-gradient)] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 pb-24">
        <header className="pt-20 lg:pt-28">
          <div className="hero-starfield relative overflow-hidden rounded-[48px] px-10 py-16 sm:px-14 sm:py-20 lg:px-16 lg:py-24">
            <div className="hero-aurora" />
            <div className="relative flex flex-col items-center text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(143,130,255,0.38)] bg-[rgba(12,16,28,0.65)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-[rgba(207,207,207,0.68)]">
                <Sparkles className="h-4 w-4" aria-hidden />
                Voice-supported reporting
              </span>
              <Image
                src="/brand/Radly.png"
                alt="Radly wordmark"
                width={400}
                height={400}
                priority
                className="mt-10 h-60 w-60 sm:h-72 sm:w-72 lg:h-80 lg:w-80"
              />
              <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-[3.6rem]">
                Draft radiology reports faster while keeping clinical control
              </h1>
              <p className="mt-4 max-w-2xl text-base text-[rgba(207,207,207,0.78)] sm:text-lg">
                Radly combines voice capture and structured templates so radiologists can move from findings to sign-off without leaving their workflow. The assistant supports clinical judgement—it never replaces it.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
                <PrimaryCTA href="/auth/signin" ariaLabel="Get started for free">
                  Get started free
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
                </PrimaryCTA>
                <SecondaryCTA href="/app/templates" ariaLabel="See available templates">
                  See templates
                </SecondaryCTA>
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.24em] text-[rgba(207,207,207,0.55)]">
                No credit card required • Radly assists, radiologists review and finalise every report
              </p>
              <div className="mt-4 text-sm text-[rgba(207,207,207,0.72)]">
                <Link href="/pricing" className="inline-flex items-center gap-1 text-[rgba(143,130,255,0.85)] underline-offset-4 hover:underline">
                  View pricing
                  <ArrowRight className="h-3 w-3" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-16 grid gap-6 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="aurora-card border border-[rgba(255,255,255,0.1)] p-6 text-center">
              <p className="text-2xl font-semibold sm:text-3xl">{stat.value}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.28em] text-[rgba(207,207,207,0.55)]">
                {stat.label}
              </p>
              <Link
                href="/validation"
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[rgba(143,130,255,0.85)] underline-offset-4 hover:underline"
              >
                Methods
                <ArrowRight className="h-3 w-3" aria-hidden />
              </Link>
            </div>
          ))}
        </section>

        <section className="mt-20 space-y-10">
          <div className="text-center">
            <h2 className="text-3xl font-semibold sm:text-4xl">Assistant-first advantages</h2>
            <p className="mt-3 text-sm text-[rgba(207,207,207,0.72)]">
              Built with radiology teams to keep language consistent, findings structured, and clinicians in control.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {valuePillars.map((pillar) => (
              <div key={pillar.title} className="aurora-card border border-[rgba(255,255,255,0.08)] p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(143,130,255,0.35)] bg-[rgba(12,16,28,0.65)] text-[#D7E3FF]">
                  <pillar.icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-white">{pillar.title}</h3>
                <p className="mt-2 text-sm text-[rgba(207,207,207,0.7)]">{pillar.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24 space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold sm:text-4xl">How Radly fits your workflow</h2>
            <p className="mt-3 text-sm text-[rgba(207,207,207,0.72)]">
              Three steps from capturing findings to exporting—in each case, the radiologist keeps final sign-off.
            </p>
          </div>
          <ol className="space-y-4">
            {workflowSteps.map((step, index) => (
              <li key={step.title} className="aurora-card flex gap-4 border border-[rgba(255,255,255,0.08)] p-6">
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(143,130,255,0.35)] bg-[rgba(12,16,28,0.65)] text-sm font-semibold">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm text-[rgba(207,207,207,0.72)]">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(12,16,28,0.62)] p-6 text-sm text-[rgba(207,207,207,0.72)]">
            Prefer keyboard only? Use the tab order to move through template fields, press Enter to trigger actions, and opt for manual text entry whenever a microphone is unavailable.
          </div>
        </section>

        <section className="mt-24 rounded-[44px] border border-[rgba(255,255,255,0.1)] bg-[rgba(12,16,28,0.68)] p-8 sm:p-10">
          <h2 className="text-3xl font-semibold sm:text-[2.4rem]">Radly vs generic AI tools</h2>
          <p className="mt-3 text-sm text-[rgba(207,207,207,0.72)]">
            Purpose-built safeguards keep terminology precise and responsibility with the radiologist.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[rgba(143,130,255,0.45)] bg-[rgba(75,142,255,0.12)] p-6">
              <h3 className="text-lg font-semibold text-[#D7E3FF]">Radly Assistant</h3>
              <ul className="mt-4 space-y-3 text-sm text-[rgba(207,207,207,0.8)]">
                {comparisonPoints.map((point, idx) => (
                  <li key={`radly-${idx}`} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-1 h-4 w-4 text-[#7AE7B4]" aria-hidden />
                    <span>{point.radly}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(12,16,28,0.55)] p-6">
              <h3 className="text-lg font-semibold text-[rgba(207,207,207,0.78)]">Generic AI</h3>
              <ul className="mt-4 space-y-3 text-sm text-[rgba(207,207,207,0.7)]">
                {comparisonPoints.map((point, idx) => (
                  <li key={`generic-${idx}`} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[rgba(207,207,207,0.3)]" aria-hidden />
                    <span>{point.generic}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-24 space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold sm:text-4xl">What teams notice first</h2>
            <p className="mt-3 text-sm text-[rgba(207,207,207,0.72)]">
              Highlights from internal pilots across academic and private practices.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {spotlightHighlights.map((highlight) => (
              <div key={highlight} className="aurora-card border border-[rgba(255,255,255,0.08)] p-6 text-sm text-[rgba(207,207,207,0.75)]">
                {highlight} <Link href="/validation" className="ml-2 text-[rgba(143,130,255,0.85)] underline-offset-4 hover:underline">Validation</Link>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24 rounded-[44px] border border-[rgba(255,255,255,0.1)] bg-[rgba(12,16,28,0.68)] p-10 text-center">
          <h2 className="text-3xl font-semibold sm:text-[2.4rem]">Bring Radly into your next reporting session</h2>
          <p className="mt-4 text-sm text-[rgba(207,207,207,0.75)] sm:text-base">
            Start with five complimentary reports. Radly assists, radiologists review and finalise every case.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <PrimaryCTA href="/auth/signin" ariaLabel="Get started for free">
              Get started free
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
            </PrimaryCTA>
            <SecondaryCTA href="/instructions" ariaLabel="See how Radly works">
              See instructions
            </SecondaryCTA>
          </div>
          <p className="mt-3 text-xs uppercase tracking-[0.24em] text-[rgba(207,207,207,0.55)]">
            Includes keyboard-only path • No commitment
          </p>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
