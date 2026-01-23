import type { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import HomePageRenderer from "@/components/HomePageRenderer";

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
    icon: "Brain" as const,
    title: "Clinical nuance",
    description: "Understands modality terminology and comparison language drawn from radiology best practice.",
  },
  {
    icon: "Layers" as const,
    title: "Structured output",
    description: "Delivers fully structured text ready for PACS, templates, or resident teaching files.",
  },
  {
    icon: "ClipboardList" as const,
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
    value: "97%+ accuracy",
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
  "name": "Radly",
  "applicationCategory": "HealthApplication",
  "operatingSystem": "Web, iOS",
  "description": "AI-powered radiology reporting assistant that turns voice dictation into structured, PACS-ready reports in under 2 minutes.",
  "url": "https://radly.app",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "Free tier with 5 reports/month"
  },
  "creator": {
    "@type": "Organization",
    "name": "Radly Labs",
    "url": "https://radly.app"
  }
};

const searchActionSchema = {
  "@context": "https://schema.org",
  "@type": "SearchAction",
  "target": {
    "@type": "EntryPoint",
    "urlTemplate": "https://radly.app/?search={search_term_string}"
  },
  "query-input": "required name=search_term_string"
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Radly Assistant",
  "description": "Voice-supported AI assistant for structured radiology report generation",
  "provider": {
    "@type": "Organization",
    "name": "Radly",
    "url": "https://radly.app"
  },
  "areaServed": "Global",
  "serviceType": "Healthcare IT Service",
  "applicationCategory": "HealthApplication",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "USD",
    "price": "0",
    "description": "Free tier with 5 complimentary reports monthly"
  },
  "url": "https://radly.app"
};

export const metadata = {
  title: 'Radly — AI-Powered Radiology Reporting | Dictate to Structured Report in 2 Minutes',
  description: 'Radly turns voice dictation into structured, PACS-ready radiology reports in under 2 minutes. 97%+ accuracy on clinical vocabulary. Built by radiologists. Start free.',
  keywords: 'radiology reporting software, AI radiology assistant, voice dictation radiology, structured radiology reports, PACS reporting',
  authors: [{ name: 'Radly Labs' }],
  openGraph: {
    type: 'website',
    url: 'https://radly.app/',
    title: 'Radly — Radiology Reports in Half the Time',
    description: 'You dictate. We structure. You sign. AI-powered radiology reporting with 97%+ accuracy. Start free with 5 reports.',
    siteName: 'Radly',
    images: [
      {
        url: 'https://radly.app/og-image-homepage.png',
        width: 1200,
        height: 630,
        alt: 'Radly - Radiology Reports in Half the Time',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Radly — Radiology Reports in Half the Time',
    description: 'You dictate. We structure. You sign. AI-powered radiology reporting with 97%+ accuracy.',
    images: ['https://radly.app/og-image-homepage.png'],
  },
  robots: 'index, follow',
  canonical: 'https://radly.app/',
};

export default function Home() {
  return (
    <div className="bg-[var(--ds-bg-gradient)] text-white overflow-x-hidden">
      <script
        id="home-software-app-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        id="home-search-action-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(searchActionSchema) }}
      />
      <script
        id="home-service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      <HomePageRenderer
        workflowSteps={workflowSteps}
        valuePillars={valuePillars}
        comparisonPoints={comparisonPoints}
        spotlightHighlights={spotlightHighlights}
        stats={stats}
      />

      <MarketingFooter />
    </div>
  );
}
