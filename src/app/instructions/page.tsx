import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText, Mic, Sparkles, Download, Brain, Radio, ChevronDown } from "lucide-react";
import { PrimaryCTA, SecondaryCTA } from "@/components/marketing/PrimaryCTA";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Breadcrumb } from "@/components/marketing/Breadcrumb";

export const dynamic = "force-static";

const workflowSteps = [
  {
    number: 1,
    icon: FileText,
    title: "Choose template",
    description: "Select a modality-specific template. Radly supports all modalities including CT, MRI, Ultrasound, X-ray, Mammography, and more.",
  },
  {
    number: 2,
    icon: Mic,
    title: "Dictate findings",
    description: "Speak naturally or type. Radly understands radiology vocabulary, measurements, and laterality.",
  },
  {
    number: 3,
    icon: Sparkles,
    title: "Review draft",
    description: "Radly assembles structured sections - History, Technique, Findings, Impression. You review and refine.",
  },
  {
    number: 4,
    icon: Download,
    title: "Export",
    description: "Download DOCX or copy plain text. PACS-ready, formatted for your signature workflow.",
  },
];

const stats = [
  {
    value: "≈ 2.7s",
    label: "Median transcription latency",
  },
  {
    value: "All modalities supported",
    label: "Including Mammography",
  },
  {
    value: "< 2 minutes",
    label: "Median draft time",
  },
];

const proTips = [
  {
    title: "Lead with context",
    description: "Mention modality and comparison early so Radly anchors the right template fields.",
    icon: Radio,
  },
  {
    title: "Blend voice and typing",
    description: "Switch between dictation and keyboard without losing formatting - Radly merges both inputs.",
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
    answer: "Internal validation shows high transcription accuracy on radiology vocabulary. See methods and samples on the Validation page.",
  },
  {
    question: "Can I use Radly without a microphone?",
    answer: "Yes. Every field is keyboard accessible. The workflow works identically without dictation.",
  },
  {
    question: "Does Radly store audio?",
    answer: "No. Audio is processed in real time and immediately discarded. Only the text you keep in the report is retained.",
  },
  {
    question: "What export formats are available?",
    answer: "DOCX (fully formatted) and plain text. Both are compatible with most PACS systems.",
  },
  {
    question: "Is there a free trial?",
    answer: "Yes. All new accounts get 5 free reports with no credit card required.",
  },
];

const metadataDescription = "Watch Radly turn voice dictation into a structured radiology report in under 2 minutes. See the 4-step workflow: template, dictate, review, export.";

export const metadata = {
  title: 'How Radly Works — Voice Dictation to Structured Report Demo | Radly',
  description: 'Watch Radly turn voice dictation into a structured radiology report in under 2 minutes. See the 4-step workflow: choose template, dictate findings, review draft, export to PACS.',
  keywords: 'radiology reporting demo, voice dictation radiology, how Radly works, radiology workflow demo',
  openGraph: {
    type: 'website',
    url: 'https://radly.app/instructions',
    title: 'See Radly in Action — 2-Minute Demo',
    description: 'Watch the full workflow: dictate findings, Radly structures, you sign. From voice to PACS-ready report in under 2 minutes.',
    images: [
      {
        url: 'https://radly.app/og-image-homepage.png',
        width: 1200,
        height: 630,
        alt: 'Radly Demo - Voice to Structured Report',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'See Radly in Action — 2-Minute Demo',
    description: 'Watch the full workflow: dictate findings, Radly structures, you sign.',
    images: ['https://radly.app/og-image-homepage.png'],
  },
  canonical: 'https://radly.app/instructions',
};

function FAQAccordionItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(10,14,28,0.6)]">
      <summary className="flex cursor-pointer items-center justify-between p-5 text-left">
        <h3 className="text-base font-semibold text-white pr-4">{question}</h3>
        <ChevronDown className="h-5 w-5 text-[rgba(207,207,207,0.6)] transition-transform group-open:rotate-180 flex-shrink-0" />
      </summary>
      <div className="px-5 pb-5 pt-0">
        <p className="text-sm text-[rgba(207,207,207,0.75)] leading-relaxed">{answer}</p>
      </div>
    </details>
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

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://radly.app/instructions",
    "name": "How Radly Works - Voice Dictation to Structured Report Demo",
    "description": metadataDescription,
    "url": "https://radly.app/instructions",
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

  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": "Radly Demo - Voice Dictation to Structured Radiology Report",
    "description": "Watch how Radly turns voice dictation into a structured radiology report in under 2 minutes.",
    "thumbnailUrl": "https://img.youtube.com/vi/0lfm787mh4I/maxresdefault.jpg",
    "uploadDate": "2025-01-01",
    "contentUrl": "https://www.youtube.com/watch?v=0lfm787mh4I",
    "embedUrl": "https://www.youtube-nocookie.com/embed/0lfm787mh4I"
  };

  return (
    <div className="bg-[var(--ds-bg-gradient)] text-white">
      <script
        id="instructions-webpage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        id="instructions-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        id="instructions-video-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
      />

      <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-16 px-5 py-16">
        {/* SECTION 1: HERO WITH VIDEO */}
        <header className="space-y-8 text-center">
          <Breadcrumb items={[
            { label: "Home", url: "/" },
            { label: "How it works", url: "/instructions" }
          ]} />

          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">See Radly in action</h1>
            <p className="mx-auto max-w-2xl text-base text-[rgba(207,207,207,0.8)] sm:text-lg">
              From dictation to structured report in under 2 minutes. Watch the full workflow.
            </p>
          </div>

          {/* YouTube Video Embed */}
          <div className="mx-auto max-w-4xl">
            <div
              className="relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.1)]"
              style={{ paddingBottom: '56.25%' }}
            >
              <iframe
                className="absolute inset-0 h-full w-full"
                src="https://www.youtube-nocookie.com/embed/0lfm787mh4I?rel=0&modestbranding=1"
                title="Radly Demo - Voice Dictation to Structured Radiology Report"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <PrimaryCTA href="/auth/signin" ariaLabel="Create a free Radly account">
              Get started free
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
            </PrimaryCTA>
            <SecondaryCTA href="/app/templates" ariaLabel="Browse Radly templates">
              Browse templates
            </SecondaryCTA>
          </div>

          <p className="text-xs text-[rgba(207,207,207,0.6)]">
            No credit card required • 5 free reports to start
          </p>
        </header>

        {/* SECTION 2: 4-STEP WORKFLOW */}
        <section className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold">How it works</h2>
            <p className="text-base text-[rgba(207,207,207,0.75)]">
              Four steps from findings to finished report
            </p>
          </div>

          {/* Workflow cards - horizontal on desktop, vertical on mobile */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {workflowSteps.map((step, index) => (
              <div
                key={step.title}
                className="aurora-card relative border border-[rgba(255,255,255,0.1)] p-6 text-center"
              >
                {/* Connector arrow (hidden on last item and mobile) */}
                {index < workflowSteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="h-4 w-4 text-[rgba(245,215,145,0.5)]" />
                  </div>
                )}

                {/* Step number */}
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#F5D791] to-[#E5C478] text-lg font-bold text-[#1A1510]">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(245,215,145,0.3)] bg-[rgba(12,16,28,0.65)] text-[#F5D791]">
                  <step.icon className="h-5 w-5" aria-hidden />
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-[rgba(207,207,207,0.72)] leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-[rgba(207,207,207,0.6)]">
            Keyboard accessible: Tab through fields, Enter for dropdowns, Shift+Enter for new lines. Voice dictation is optional.
          </p>
        </section>

        {/* SECTION 3: STATS BAR */}
        <section className="rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(12,16,28,0.5)] p-6">
          <div className="grid gap-6 sm:grid-cols-3">
            {stats.map((stat) => (
              <Link
                key={stat.label}
                href="/validation"
                className="text-center group transition-colors hover:bg-[rgba(245,215,145,0.05)] rounded-xl p-3 -m-3"
              >
                <p className="text-2xl font-semibold text-[#F5D791] group-hover:text-[#FFE8B0] transition-colors">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[rgba(207,207,207,0.6)]">
                  {stat.label}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* SECTION 4: PRO TIPS */}
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold text-center">Tips from pilot teams</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {proTips.map((tip) => (
              <div key={tip.title} className="aurora-card border border-[rgba(255,255,255,0.1)] p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(245,215,145,0.3)] bg-[rgba(12,16,28,0.65)] text-[#F5D791]">
                  <tip.icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-white">{tip.title}</h3>
                <p className="mt-2 text-sm text-[rgba(207,207,207,0.72)]">{tip.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: MINI FAQ */}
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold text-center">Common questions</h2>
          <div className="space-y-3 max-w-3xl mx-auto">
            {faq.map((item) => (
              <FAQAccordionItem key={item.question} {...item} />
            ))}
          </div>
          <p className="text-center">
            <Link
              href="/faq"
              className="inline-flex items-center gap-1 text-sm text-[rgba(245,215,145,0.9)] hover:text-[#FFE8B0] transition-colors"
            >
              Have more questions? See our full FAQ
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </p>
        </section>

        {/* SECTION 6: FINAL CTA */}
        <section className="space-y-6 rounded-3xl border border-[rgba(255,255,255,0.1)] bg-[rgba(12,16,28,0.6)] p-10 text-center">
          <h2 className="text-3xl font-semibold">Ready to try Radly?</h2>
          <p className="text-base text-[rgba(207,207,207,0.75)]">
            5 free reports. No credit card. Start in under a minute.
          </p>
          <PrimaryCTA href="/auth/signin" ariaLabel="Create a Radly account">
            Get started free
            <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
          </PrimaryCTA>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
