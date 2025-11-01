import type { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig";
import { HomePageRenderer } from "@/components/HomePageRenderer";
import { AuthGuardHome } from "@/components/auth-guard-home";

// Metadata is not supported in client components, will be handled by root layout
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
    <AuthGuardHome>
      <div className="bg-[var(--ds-bg-gradient)] text-white overflow-x-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <HomePageRenderer
          workflowSteps={workflowSteps}
          valuePillars={valuePillars}
          comparisonPoints={comparisonPoints}
          spotlightHighlights={spotlightHighlights}
          stats={stats}
        />
      </div>
    </AuthGuardHome>
  );
}
