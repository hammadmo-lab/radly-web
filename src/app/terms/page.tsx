import type { Metadata } from "next";
import Link from "next/link";
import { ReactNode } from "react";
import { Breadcrumb } from "@/components/marketing/Breadcrumb";

const metadataDescription = "Radly Assistant Terms of Service (Effective January 2025): AI-assisted reporting, clinical responsibility, subscriptions, data privacy, and limitations of liability.";

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
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://radly.app/terms",
    "name": "Terms of Service | Radly Assistant",
    "description": metadataDescription,
    "url": "https://radly.app/terms",
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

  return (
    <div className="min-h-screen bg-[var(--ds-bg-gradient)] text-white">
      <script
        id="terms-webpage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <main className="mx-auto max-w-4xl px-6 py-16 sm:py-20 lg:py-24 space-y-10">
        <div className="space-y-3">
          <Breadcrumb items={[
            { label: "Home", url: "/" },
            { label: "Terms", url: "/terms" }
          ]} />
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgba(207,207,207,0.55)]">
            Using Radly
          </p>
          <h1 className="text-4xl font-semibold sm:text-[2.8rem] sm:leading-[1.1]">
            Terms of Service
          </h1>
          <p className="max-w-2xl text-sm text-[rgba(207,207,207,0.7)] sm:text-base">
            These Terms of Service govern your access to Radly Assistant across the web app, iOS app, and Android app.
            By creating an account or using Radly, you agree to the terms below. Radiologists retain responsibility for
            reviewing, editing, and approving every report.
          </p>
          <p className="text-xs font-semibold tracking-[0.18em] text-[rgba(207,207,207,0.65)]">
            Effective Date: January 2025
          </p>
        </div>

        <Section title="1. Service Description &amp; AI Disclosure">
          <p>
            Radly is an AI-powered productivity assistant that helps radiologists create structured reports more efficiently.
          </p>
          <div className="space-y-2">
            <p className="font-semibold text-white">How Radly Works:</p>
            <ul className="list-disc list-inside space-y-2 text-[rgba(207,207,207,0.8)]">
              <li>You provide clinical findings through voice or text input</li>
              <li>Our AI generates a draft report including structured findings, suggested impressions, and recommended follow-up language</li>
              <li>You review, edit, and approve all content before finalizing</li>
              <li>The final report reflects your professional judgment and clinical decision-making</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-white">Important:</p>
            <ul className="list-disc list-inside space-y-2 text-[rgba(207,207,207,0.8)]">
              <li>All AI-generated content, including suggested opinions and recommendations, is presented as a draft for your review</li>
              <li>Radly does not make autonomous clinical decisions</li>
              <li>You, as the licensed radiologist, bear full professional responsibility for reviewing, modifying, and approving all report content</li>
              <li>Radly assists with efficiency and formatting; clinical interpretation remains your professional duty</li>
              <li>Radly is not a medical device and does not replace professional medical judgment.</li>
            </ul>
          </div>
        </Section>

        <Section title="2. Account &amp; Access">
          <p>
            You must provide accurate registration information and maintain the confidentiality of your login credentials.
            You are solely responsible for all activity that occurs under your account.
          </p>
          <p className="font-semibold text-white">You agree to:</p>
          <ul className="list-disc list-inside space-y-2 text-[rgba(207,207,207,0.8)]">
            <li>Notify us immediately of any unauthorized access</li>
            <li>Ensure only authorized clinical professionals use your account</li>
            <li>Maintain appropriate security on devices used to access the Service</li>
          </ul>
        </Section>

        <Section title="3. Clinical Responsibility">
          <p>
            You retain full professional responsibility for all clinical content and decisions.
          </p>
          <p className="font-semibold text-white">As a Radly user, you must:</p>
          <ul className="list-disc list-inside space-y-2 text-[rgba(207,207,207,0.8)]">
            <li>Review and verify all AI-generated draft content before use</li>
            <li>Edit and correct any suggested text as clinically appropriate</li>
            <li>Provide final approval on every report</li>
            <li>Comply with your institution&apos;s documentation standards</li>
          </ul>
          <p>
            Radly generates drafts to enhance your productivity. The final clinical interpretation, opinion, and recommendations are yours.
          </p>
        </Section>

        <Section title="4. Subscription &amp; Payment">
          <p>
            Radly offers subscription-based access to premium features.
          </p>
          <ul className="list-disc list-inside space-y-2 text-[rgba(207,207,207,0.8)]">
            <li><span className="font-semibold text-white">Auto-Renewal:</span> Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current billing period. Manage your subscription in Settings (iOS: Apple ID &gt; Subscriptions; Android: Google Play &gt; Subscriptions).</li>
            <li><span className="font-semibold text-white">Payment:</span> Charged to your Apple ID or Google Play account at confirmation of purchase. Subscription fees are non-refundable except as required by law.</li>
          </ul>
        </Section>

        <Section title="5. Acceptable Use">
          <p>You agree not to:</p>
          <ul className="list-disc list-inside space-y-2 text-[rgba(207,207,207,0.8)]">
            <li>Misuse the Service or attempt unauthorized access</li>
            <li>Reverse engineer or disassemble the Service</li>
            <li>Use the Service for unlawful purposes</li>
            <li>Share credentials with unauthorized parties</li>
          </ul>
          <p>
            You will comply with all applicable laws and regulations, including those governing Protected Health Information (PHI).
          </p>
        </Section>

        <Section title="6. Data &amp; Privacy">
          <p>
            Your privacy matters. See our Privacy Policy for details.
          </p>
          <p className="font-semibold text-white">Key Points:</p>
          <ul className="list-disc list-inside space-y-2 text-[rgba(207,207,207,0.8)]">
            <li>We process your input solely to provide the Service</li>
            <li>Data is encrypted in transit and at rest</li>
            <li>We do not sell your personal information</li>
            <li>You may delete your account and data at any time</li>
          </ul>
        </Section>

        <Section title="7. Account Deletion">
          <p>
            Delete your account anytime via Settings in the app or web application. Upon deletion:
          </p>
          <ul className="list-disc list-inside space-y-2 text-[rgba(207,207,207,0.8)]">
            <li>Your account and profile are permanently removed</li>
            <li>Your data is deleted from our systems</li>
            <li>Active subscriptions are cancelled</li>
            <li>Certain financial records may be retained as required by law.</li>
          </ul>
        </Section>

        <Section title="8. Intellectual Property">
          <p>
            Radly&apos;s name, logo, and technology are protected by intellectual property laws.
          </p>
          <p>
            <span className="font-semibold text-white">Your Content:</span> You retain ownership of all content you submit and reports you approve. You grant Radly a limited license to process your content solely to provide the Service.
          </p>
        </Section>

        <Section title="9. Service Availability">
          <p>
            We strive for reliable availability but cannot guarantee uninterrupted access. The Service may be unavailable for maintenance or due to technical issues. We may modify or discontinue features with reasonable notice.
          </p>
        </Section>

        <Section title="10. Disclaimers">
          <p className="font-semibold text-white">
            THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES INCLUDING MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
          </p>
          <p>
            Radly is a productivity tool. It generates draft content for your review; it does not provide autonomous diagnoses or replace your clinical judgment.
          </p>
        </Section>

        <Section title="11. Limitation of Liability">
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES.
          </p>
          <p>
            Total liability is limited to subscription fees paid in the 12 months preceding a claim. Nothing limits liability for gross negligence, fraud, or willful misconduct.
          </p>
        </Section>

        <Section title="12. Termination">
          <p>
            You may stop using Radly and delete your account anytime. We may suspend access for Terms violations or if required by law.
          </p>
        </Section>

        <Section title="13. Changes to Terms">
          <p>
            We may update these Terms with 30 days notice via email or in-app notification. Continued use after changes take effect constitutes acceptance.
          </p>
        </Section>

        <Section title="14. Contact">
          <ul className="list-disc list-inside space-y-2 text-[rgba(207,207,207,0.8)]">
            <li>Email: <Link href="mailto:legal@radly.app" className="text-[#8F82FF] hover:underline">legal@radly.app</Link></li>
            <li>Support: <Link href="mailto:support@radly.app" className="text-[#8F82FF] hover:underline">support@radly.app</Link></li>
            <li>Website: <Link href="https://radly.app" className="text-[#8F82FF] hover:underline">https://radly.app</Link></li>
          </ul>
        </Section>

        <div className="space-y-2">
          <p className="text-sm text-[rgba(207,207,207,0.7)]">
            Radly is developed by Dr. Mohamed Hammad.
          </p>
          <div className="text-xs uppercase tracking-[0.18em] text-[rgba(207,207,207,0.5)]">
            Last updated: October 2025
          </div>
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
