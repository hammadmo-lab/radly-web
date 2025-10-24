import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { PrimaryCTA, SecondaryCTA } from "@/components/marketing/PrimaryCTA";
import { ClipboardSignature, Mic, FileText, CheckCircle2 } from "lucide-react";

export const dynamic = "force-static";

const metadataDescription = "Radly validation summary covering datasets, transcription accuracy, workflow timing, and limitations.";

export const metadata: Metadata = {
  title: "Validation | Radly internal testing overview",
  description: metadataDescription,
  openGraph: {
    title: "Radly Validation",
    description: metadataDescription,
  },
};

const validationHighlights = [
  {
    icon: Mic,
    title: "Voice transcription",
    description:
      "Measured on anonymised internal recordings across CT, fluoroscopy, ultrasound, and X-ray. High accuracy with minor corrections documented below.",
  },
  {
    icon: FileText,
    title: "Draft timing",
    description: "Median assistant draft time under two minutes across 180 pilot cases. Includes template load and export steps.",
  },
  {
    icon: ClipboardSignature,
    title: "Clinical review",
    description: "Radiologists review every report. Feedback loops inform template updates and guardrails.",
  },
];

const limitations = [
  "Radly assists radiologists and does not provide autonomous diagnoses.",
  "Structured findings are required; DICOM ingestion is not yet supported.",
  "Best transcription accuracy currently observed for US English; additional locales in testing.",
  "Async drafts expire after six hours if not downloaded.",
];

export default function ValidationPage() {
  return (
    <div className="bg-[var(--ds-bg-gradient)] text-white">
      <main className="mx-auto max-w-4xl px-5 py-16">
        <header className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[rgba(207,207,207,0.55)]">Validation summary</p>
          <h1 className="text-4xl font-semibold leading-tight">How we validate Radly’s assistant workflow</h1>
          <p className="text-sm text-[rgba(207,207,207,0.75)] sm:text-base">
            Radly assists clinicians. Radiologists review and finalise every report. This page outlines the datasets, metrics, and limitations informing that workflow.
          </p>
        </header>

        <section className="mt-12 space-y-6">
          <h2 className="text-3xl font-semibold">Highlights</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {validationHighlights.map((item) => (
              <div key={item.title} className="aurora-card border border-[rgba(255,255,255,0.1)] p-6 text-sm text-[rgba(207,207,207,0.72)]">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(143,130,255,0.35)] bg-[rgba(12,16,28,0.65)] text-[#D7E3FF]">
                  <item.icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 space-y-4 rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.68)] p-6 text-sm text-[rgba(207,207,207,0.75)]">
          <h2 className="text-2xl font-semibold text-white">Datasets and methods</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>180 anonymised pilot cases across CT, fluoroscopy, ultrasound, and X-ray.</li>
            <li>Voice recordings captured in real reading rooms with typical ambient noise.</li>
            <li>Reports reviewed by attending radiologists; edits categorised by section and severity.</li>
          </ul>
          <p className="mt-3">Detailed metrics and anonymised samples are available on request. Email <Link href="mailto:validation@radly.app" className="text-[rgba(143,130,255,0.85)] underline-offset-4 hover:underline">validation@radly.app</Link>.</p>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-3xl font-semibold">Limitations and clinical framing</h2>
          <ul className="space-y-3 text-sm text-[rgba(207,207,207,0.75)]">
            {limitations.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[rgba(143,130,255,0.85)]" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 space-y-4 text-center">
          <h2 className="text-3xl font-semibold">Next steps</h2>
          <p className="text-sm text-[rgba(207,207,207,0.72)] sm:text-base">
            Use the validation pack during procurement or clinical governance reviews. The team is ready to provide additional detail.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <PrimaryCTA href="/auth/signin" ariaLabel="Create a Radly account from the validation page">
              Get started free
            </PrimaryCTA>
            <SecondaryCTA href="mailto:validation@radly.app" ariaLabel="Email the Radly validation team">
              Request full validation pack
            </SecondaryCTA>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
