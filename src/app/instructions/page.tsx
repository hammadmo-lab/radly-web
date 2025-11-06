import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Brain, Mic, Radio, ShieldCheck } from "lucide-react";
import { PrimaryCTA, SecondaryCTA } from "@/components/marketing/PrimaryCTA";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { siteConfig } from "@/lib/siteConfig";

export const dynamic = "force-static";

const journey = [
  {
    title: "Choose a template",
    subtitle: "Modality-aware starting point",
    description: "Select a modality template or favourite layout. Every option mirrors the structure used in the reading room.",
  },
  {
    title: "Capture findings",
    subtitle: "Voice or keyboard",
    description: "Use the microphone or keyboard to capture findings. Radly aligns terminology with the chosen template.",
  },
  {
    title: "Review and refine",
    subtitle: "Assistant draft",
    description: "Radly assembles structured sections. Radiologists review, adjust, and confirm clinical wording.",
  },
  {
    title: "Export and hand off",
    subtitle: "PACS-ready formats",
    description: "Download DOCX or copy structured text straight into your reporting system.",
  },
];

const voiceStats = [
  {
    label: "Median transcription latency",
    value: "≈ 2.7 s",
  },
  {
    label: "Modalities covered",
    value: "CT, MR, US, X-ray",
  },
  {
    label: "Pilot sites",
    value: "Academic & private groups",
  },
];

const proTips = [
  {
    title: "Lead with context",
    description: "Mention modality and comparison early in your dictation so Radly anchors the right template fields.",
    icon: Radio,
  },
  {
    title: "Blend voice and typing",
    description: "Switch between dictation and keyboard without losing formatting—Radly merges both inputs.",
    icon: Mic,
  },
  {
    title: "Review intentionally",
    description: "Spend 20 seconds checking impression and recommendations before export.",
    icon: Brain,
  },
];

const faq = [
  {
    question: "How accurate is the voice dictation?",
    answer:
      "Internal validation across multiple modalities shows high transcription accuracy on radiology vocabulary. See methods and samples on the Validation page.",
  },
  {
    question: "Can I use Radly without a microphone?",
    answer:
      "Yes. Every field is keyboard accessible, and the workflow replicates the same steps without dictation.",
  },
  {
    question: "Does Radly store audio?",
    answer:
      "No. Audio is processed in real time for transcription and then discarded. Only the text you keep in the report remains.",
  },
  {
    question: "How do templates stay up to date?",
    answer:
      "Templates are reviewed with partner sites. Updates ship with release notes and can be audited on request.",
  },
];

const metadataDescription = "Learn how to generate structured radiology reports with Radly. 4-step workflow: choose template, capture findings, review assistant draft, export. Median time: 2 minutes.";

export const metadata: Metadata = {
  title: "Instructions | Radly assistant walkthrough | Radly Assistant",
  description: metadataDescription,
  alternates: {
    canonical: "https://radly.app/instructions",
  },
  openGraph: {
    title: "Voice-Supported Reporting in 4 Clear Stages",
    description: metadataDescription,
    url: "https://radly.app/instructions",
    type: "article",
    images: [
      {
        url: "https://radly.app/og-default.png",
        width: 1200,
        height: 630,
        alt: "Radly voice-supported reporting workflow - 4 step process",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Use Radly - Step-by-Step Guide",
    description: "Voice-supported reporting workflow for radiology",
    images: ["https://radly.app/og-default.png"],
  },
};

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.14)] bg-[rgba(10,14,28,0.72)] p-6 text-left">
      <h3 className="text-lg font-semibold text-white">{question}</h3>
      <p className="mt-3 text-sm text-[rgba(207,207,207,0.75)]">{answer}</p>
    </div>
  );
}

export default function InstructionsPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faq.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Voice-supported reporting in four clear stages",
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
      "@id": "https://radly.app/instructions"
    }
  };

  return (
    <div className="bg-[var(--ds-bg-gradient)] text-white">
      <script
        id="instructions-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        id="instructions-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-20 px-5 py-16">
        <header className="space-y-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[rgba(207,207,207,0.55)]">Radly assistant walkthrough</p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">Voice-supported reporting in four clear stages</h1>
          <p className="mx-auto max-w-3xl text-sm text-[rgba(207,207,207,0.75)] sm:text-base">
            This guide shows the exact flow clinicians follow: selecting a template, capturing findings, reviewing the assistant draft, and exporting the final report. Keyboard-only guidance is included for environments where microphones are unavailable.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <PrimaryCTA href="/auth/signin" ariaLabel="Create a free Radly account">
              Get started free
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
            </PrimaryCTA>
            <SecondaryCTA href="/app/templates" ariaLabel="Browse Radly templates">
              Review templates
            </SecondaryCTA>
          </div>
          <p className="text-xs uppercase tracking-[0.28em] text-[rgba(207,207,207,0.55)]">
            No credit card required • Radly assists, radiologists review and finalise every report
          </p>
        </header>

        <section className="space-y-6">
          <h2 className="text-3xl font-semibold">Workflow overview</h2>
          <ol className="space-y-4">
            {journey.map((step, index) => (
              <li key={step.title} className="aurora-card flex gap-4 border border-[rgba(255,255,255,0.08)] p-6">
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(143,130,255,0.35)] bg-[rgba(12,16,28,0.65)] text-sm font-semibold">
                  {index + 1}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgba(207,207,207,0.55)]">{step.subtitle}</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm text-[rgba(207,207,207,0.72)]">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(12,16,28,0.62)] p-6 text-sm text-[rgba(207,207,207,0.72)]">
            Keyboard path: Tab through form fields, press Enter to open dropdowns, and use Shift+Enter to add new lines within findings. Dictation is optional.
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl font-semibold">Voice capture demo</h2>
          <div className="rounded-3xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.68)] p-6">
            <video
              className="w-full rounded-2xl"
              controls
              muted
              playsInline
              poster="/brand/Radly.png"
              preload="metadata"
            >
              <source src="https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4" type="video/mp4" />
              <track
                kind="captions"
                srcLang="en"
                label="English captions"
                src="https://filesampleshub.com/download/captions/sample.vtt"
                default
              />
              Sorry, your browser doesn’t support embedded videos. Download the demo via the Validation page.
            </video>
            <p className="mt-4 text-sm text-[rgba(207,207,207,0.72)]">
              The clip shows a clinician dictating findings, Radly transcribing in real time, and the assistant presenting a structured draft for review.
            </p>
          </div>
          <p className="text-sm text-[rgba(207,207,207,0.68)]">
            Need to review methodology? View recording notes and timing data on the <Link href="/validation" className="text-[rgba(143,130,255,0.85)] underline-offset-4 hover:underline">Validation</Link> page.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl font-semibold">Voice performance at a glance</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {voiceStats.map((stat) => (
              <div key={stat.label} className="aurora-card border border-[rgba(255,255,255,0.08)] p-5 text-sm text-[rgba(207,207,207,0.72)]">
                <p className="text-xl font-semibold text-white">{stat.value}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.28em] text-[rgba(207,207,207,0.55)]">{stat.label}</p>
                <Link
                  href="/validation"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[rgba(143,130,255,0.85)] underline-offset-4 hover:underline"
                >
                  Methods
                  <ArrowRight className="h-3 w-3" aria-hidden />
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl font-semibold">Working tips from pilot teams</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {proTips.map((tip) => (
              <div key={tip.title} className="aurora-card border border-[rgba(255,255,255,0.08)] p-6 text-sm text-[rgba(207,207,207,0.72)]">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(143,130,255,0.35)] bg-[rgba(12,16,28,0.65)] text-[#D7E3FF]">
                  <tip.icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-white">{tip.title}</h3>
                <p className="mt-2">{tip.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl font-semibold">Frequently asked questions</h2>
          <div className="space-y-4">
            {faq.map((item) => (
              <FAQItem key={item.question} {...item} />
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-[rgba(255,255,255,0.1)] bg-[rgba(12,16,28,0.65)] p-8 text-center">
          <h2 className="text-3xl font-semibold">Ready to evaluate Radly?</h2>
          <p className="text-sm text-[rgba(207,207,207,0.72)] sm:text-base">
            Five complimentary reports, detailed validation notes, and support from the team whenever you need it.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <PrimaryCTA href="/auth/signin" ariaLabel="Create a Radly account">
              Get started free
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
            </PrimaryCTA>
            <SecondaryCTA href="/validation" ariaLabel="Read validation details">
              Read validation
            </SecondaryCTA>
          </div>
          <p className="text-xs uppercase tracking-[0.28em] text-[rgba(207,207,207,0.55)]">
            Radly assists. Radiologists review and finalise every report.
          </p>
        </section>

        <div className="sticky bottom-6 z-20">
          <div className="mx-auto max-w-md rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.85)] p-4 shadow-[0_24px_64px_rgba(12,16,28,0.65)] backdrop-blur">
            <div className="flex items-center gap-3 text-sm text-[rgba(207,207,207,0.75)]">
              <ShieldCheck className="h-5 w-5 text-[rgba(111,231,183,0.85)]" aria-hidden />
              <span>Need security details? Review encryption and access controls on the Security page.</span>
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <SecondaryCTA href="/security" ariaLabel="View Radly security measures" className="w-full">
                Security overview
              </SecondaryCTA>
              <PrimaryCTA href="/auth/signin" ariaLabel="Create a Radly account" className="w-full" eventName="sticky-cta">
                Get started free
              </PrimaryCTA>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
