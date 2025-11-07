import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/marketing/Breadcrumb";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { PrimaryCTA } from "@/components/marketing/PrimaryCTA";
import { Search } from "lucide-react";

const metadataDescription = "Radly FAQ: Answers to common questions about voice dictation, templates, modalities, security, pricing, and workflow integration.";

export const metadata: Metadata = {
  title: "FAQ | Radly Assistant",
  description: metadataDescription,
  alternates: {
    canonical: "https://radly.app/faq",
  },
  openGraph: {
    title: "Radly FAQ - Frequently Asked Questions",
    description: metadataDescription,
    url: "https://radly.app/faq",
    type: "website",
    images: [
      {
        url: "https://radly.app/og-default.png",
        width: 1200,
        height: 630,
        alt: "Radly FAQ - Common questions answered",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Radly FAQ",
    description: metadataDescription,
  },
};

const faqCategories = [
  {
    category: "Product & Features",
    questions: [
      {
        question: "What modalities does Radly support?",
        answer:
          "Radly currently supports X-ray, Ultrasound, CT, and Fluoroscopy. MRI and PET-CT support are coming soon. Modality-specific templates guide the structured report format for each imaging type.",
      },
      {
        question: "Can I customize templates for my department?",
        answer:
          "Yes. Templates can be customized to match your department's reporting standards. Custom fields, terminology, and structure can be adjusted with guidance from the Radly team.",
      },
      {
        question: "What export formats does Radly support?",
        answer:
          "Radly exports reports in DOCX (fully formatted) and plain text formats. Both are compatible with most PACS systems and ready for signature workflows.",
      },
      {
        question: "Can I use Radly on mobile devices?",
        answer:
          "Radly is optimized for web browsers on desktop and tablets. Mobile browser access is available, though the full experience is best on larger screens.",
      },
    ],
  },
  {
    category: "Voice & Accuracy",
    questions: [
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
        question: "What if the transcription makes a mistake?",
        answer:
          "Simply edit the text directly. Corrections are quick—most typos take seconds to fix. You remain in full control of the final report before it's finalized.",
      },
      {
        question: "Does Radly store audio?",
        answer:
          "No. Audio is processed in real time for transcription and then discarded. Only the text you keep in the report remains.",
      },
    ],
  },
  {
    category: "Workflow & Integration",
    questions: [
      {
        question: "How quickly can I generate a report?",
        answer:
          "Median draft time is under 2 minutes from template selection to export. The actual time depends on complexity and your comfort level with voice dictation vs keyboard input.",
      },
      {
        question: "Can multiple radiologists work on the same report?",
        answer:
          "Radly is designed for individual report generation. Each radiologist maintains control over their report. You can export to your existing workflow system for team coordination.",
      },
      {
        question: "How does Radly handle complex or unusual cases?",
        answer:
          "Radly excels with standard cases. For complex or unusual presentations, you can use keyboard editing to add detailed clinical context. The assistant learns from your corrections to improve future suggestions.",
      },
      {
        question: "How do templates stay up to date?",
        answer:
          "Templates are reviewed with partner sites. Updates ship with release notes and can be audited on request.",
      },
    ],
  },
  {
    category: "Security & Data",
    questions: [
      {
        question: "How is patient data protected?",
        answer:
          "All patient data is encrypted during transmission and at rest. Audio is never stored—only the text you keep in the report is retained. See our Security and Privacy pages for complete details.",
      },
      {
        question: "Can we audit usage logs?",
        answer:
          "Yes. Access logs are retained for 90 days and can be shared with your security team on request. Administrative actions are tracked and reviewed.",
      },
      {
        question: "Can I delete my reports after they're generated?",
        answer:
          "Yes. You have full control over your reports. Async job results expire after six hours if not downloaded. Stored reports can be managed through your account settings.",
      },
    ],
  },
  {
    category: "Pricing & Trials",
    questions: [
      {
        question: "How much does Radly cost?",
        answer:
          "Radly offers flexible pricing with a free tier (5 reports/month) and paid plans for higher volume. Visit our Pricing page for current rates and enterprise options.",
      },
      {
        question: "Is there a free trial or evaluation period?",
        answer:
          "Yes. All new accounts receive 5 complimentary reports with no credit card required. This is enough to evaluate Radly's accuracy and workflow fit.",
      },
    ],
  },
  {
    category: "Training & Support",
    questions: [
      {
        question: "What training does my team need?",
        answer:
          "Radly is designed to be intuitive. Most radiologists can generate their first report within minutes. We provide documentation, workflow guides, and support for team onboarding.",
      },
      {
        question: "Can I use Radly for teaching and resident training?",
        answer:
          "Yes. Radly can help residents learn structured reporting by generating templates they review and edit. This reinforces best practices while reducing documentation burden.",
      },
      {
        question: "What if I need to request a feature or report a bug?",
        answer:
          "We actively gather feedback from users. Contact our support team at support@radly.app with feature requests or bug reports. Your input helps shape Radly's development.",
      },
    ],
  },
];

export default function FAQPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqCategories.flatMap((category) =>
      category.questions.map((item) => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer,
        },
      }))
    ),
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://radly.app/faq",
    "name": "FAQ | Radly Assistant",
    "description": metadataDescription,
    "url": "https://radly.app/faq",
    "isPartOf": {
      "@id": "https://radly.app/#organization",
    },
    "publisher": {
      "@type": "Organization",
      "name": "Radly",
      "logo": {
        "@type": "ImageObject",
        "url": "https://radly.app/icon-512.png",
      },
    },
  };

  return (
    <div className="bg-[var(--ds-bg-gradient)] text-white">
      <script
        id="faq-webpage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="mx-auto max-w-4xl px-5 py-16">
        <header className="mb-12 space-y-4">
          <Breadcrumb
            items={[
              { label: "Home", url: "/" },
              { label: "FAQ", url: "/faq" },
            ]}
          />
          <h1 className="text-4xl font-semibold sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-[rgba(207,207,207,0.75)]">
            Find answers to common questions about Radly, our features, workflow
            integration, and how to get started.
          </p>
        </header>

        <div className="space-y-12">
          {faqCategories.map((category) => (
            <section key={category.category} className="space-y-6">
              <h2 className="text-2xl font-semibold text-[rgba(143,130,255,0.85)]">
                {category.category}
              </h2>

              <div className="space-y-4">
                {category.questions.map((item) => (
                  <details
                    key={item.question}
                    className="group aurora-card border border-[rgba(255,255,255,0.08)] p-6 cursor-pointer hover:border-[rgba(255,255,255,0.12)] transition-colors"
                  >
                    <summary className="flex items-center justify-between text-lg font-semibold text-white list-none">
                      <span>{item.question}</span>
                      <span className="text-[rgba(143,130,255,0.85)] group-open:rotate-180 transition-transform">
                        ▼
                      </span>
                    </summary>
                    <p className="mt-4 text-[rgba(207,207,207,0.75)] text-base">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-16 space-y-6 rounded-3xl border border-[rgba(255,255,255,0.1)] bg-[rgba(12,16,28,0.65)] p-8 text-center">
          <h2 className="text-3xl font-semibold">Didn't find your answer?</h2>
          <p className="text-[rgba(207,207,207,0.75)]">
            Contact our support team for help with specific questions or custom requirements.
          </p>
          <PrimaryCTA href="mailto:support@radly.app" ariaLabel="Email Radly support">
            Contact Support
          </PrimaryCTA>
        </section>

        <nav className="mt-12 flex justify-between items-center pt-8 border-t border-[rgba(255,255,255,0.1)]">
          <Link
            href="/instructions"
            className="text-[rgba(143,130,255,0.85)] hover:text-[rgba(143,130,255,1)] transition-colors"
          >
            ← Back to Instructions
          </Link>
          <Link
            href="/security"
            className="text-[rgba(143,130,255,0.85)] hover:text-[rgba(143,130,255,1)] transition-colors"
          >
            Security Details →
          </Link>
        </nav>
      </main>

      <MarketingFooter />
    </div>
  );
}
