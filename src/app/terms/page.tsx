import type { Metadata } from "next";
import Link from "next/link";
import { ReactNode } from "react";

const metadataDescription = "Radly Terms of Service: clinical oversight, acceptable use, data handling. Radiologists remain accountable for all reports generated with Radly.";

export const metadata: Metadata = {
  title: "Terms of Service | Radly Assistant",
  description: metadataDescription,
  alternates: {
    canonical: "https://radly.app/terms",
  },
  openGraph: {
    title: "Radly Terms of Service",
    description: metadataDescription,
    url: "https://radly.app/terms",
    type: "website",
    images: [
      {
        url: "https://radly.app/og-default.png",
        width: 1200,
        height: 630,
        alt: "Radly Terms of Service",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Radly Terms of Service",
    description: metadataDescription,
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--ds-bg-gradient)] text-white">
      <main className="mx-auto max-w-4xl px-6 py-16 sm:py-20 lg:py-24 space-y-10">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgba(207,207,207,0.55)]">
            Using Radly
          </p>
          <h1 className="text-4xl font-semibold sm:text-[2.8rem] sm:leading-[1.1]">
            Terms of Service
          </h1>
          <p className="max-w-2xl text-sm text-[rgba(207,207,207,0.7)] sm:text-base">
            These terms govern your access to and use of the Radly assistant. By creating an account or using the
            service, you agree to the clauses below. Radiologists retain responsibility for reviewing and approving every
            report produced with Radly.
          </p>
        </div>

        <Section title="1. Account &amp; Access">
          <p>
            You must provide accurate registration information and maintain the confidentiality of your credentials. You
            are responsible for activity within your account and ensuring only authorised clinical staff use Radly on
            your behalf.
          </p>
        </Section>

        <Section title="2. Clinical Oversight">
          <p>
            Radly is an intelligent assistant, not a medical device. It generates report content based on clinician
            input. Radiologists must review, edit, and sign off every report, and remain accountable for final clinical
            decisions.
          </p>
        </Section>

        <Section title="3. Acceptable Use">
          <p>
            You agree not to misuse Radly, attempt unauthorised access, or reverse engineer the service. You will comply
            with applicable laws and ensure Protected Health Information is handled according to your organisation’s
            policies.
          </p>
        </Section>

        <Section title="4. Intellectual Property">
          <p>
            Radly and its brand elements are owned by Radly Labs. You retain ownership of the content you submit and the
            reports you approve. You grant us a limited licence to process that content solely to provide the assistant
            experience.
          </p>
        </Section>

        <Section title="5. Service Availability">
          <p>
            We strive to keep Radly available and performant, but temporary interruptions may occur for maintenance or
            unforeseen issues. We may modify features or discontinue the service with reasonable notice.
          </p>
        </Section>

        <Section title="6. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, Radly Labs is not liable for indirect or consequential damages. Our
            total liability is limited to the subscription fees paid during the 12 months preceding a claim. Nothing here
            limits liability for gross negligence, fraud, or intentional misconduct.
          </p>
        </Section>

        <Section title="7. Termination">
          <p>
            You may stop using Radly at any time. We may suspend or terminate access if these terms are violated or if
            continued use poses risk to the service or other users.
          </p>
        </Section>

        <Section title="8. Changes">
          <p>
            We may update these terms from time to time. Material changes will be communicated via email or in-app
            notices. Continued use after changes become effective constitutes acceptance of the new terms.
          </p>
        </Section>

        <Section title="9. Contact">
          <p>
            Questions about these terms? Contact{" "}
            <Link href="mailto:legal@radly.app" className="text-[#8F82FF] hover:underline">
              legal@radly.app
            </Link>
            .
          </p>
        </Section>

        <div className="text-xs uppercase tracking-[0.18em] text-[rgba(207,207,207,0.5)]">
          Last updated: January 2025
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="space-y-3 text-sm text-[rgba(207,207,207,0.72)] sm:text-base">
        {children}
      </div>
    </section>
  );
}
