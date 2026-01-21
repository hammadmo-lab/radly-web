import type { Metadata } from "next";
import Link from "next/link";
import { ReactNode } from "react";
import { Breadcrumb } from "@/components/marketing/Breadcrumb";

const metadataDescription = "Radly Assistant Privacy Policy (Effective January 2025): how we collect, use, and protect your data across web, iOS, and Android. No data selling or ads.";

export const metadata: Metadata = {
  title: "Privacy Policy | Radly Assistant",
  description: metadataDescription,
  alternates: {
    canonical: "https://radly.app/privacy",
  },
  openGraph: {
    title: "Radly Privacy Policy",
    description: metadataDescription,
    url: "https://radly.app/privacy",
    type: "website",
    images: [
      {
        url: "https://radly.app/og-default.png",
        width: 1200,
        height: 630,
        alt: "Radly Privacy Policy",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Radly Privacy Policy",
    description: metadataDescription,
  },
};

export default function PrivacyPage() {
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://radly.app/privacy",
    "name": "Privacy Policy | Radly Assistant",
    "description": metadataDescription,
    "url": "https://radly.app/privacy",
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
        id="privacy-webpage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <main className="mx-auto max-w-4xl px-6 py-16 sm:py-20 lg:py-24 space-y-10">
        <div className="space-y-3">
          <Breadcrumb items={[
            { label: "Home", url: "/" },
            { label: "Privacy", url: "/privacy" }
          ]} />
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgba(207,207,207,0.55)]">
            Protecting your data
          </p>
          <h1 className="text-4xl font-semibold sm:text-[2.8rem] sm:leading-[1.1]">
            Privacy Policy
          </h1>
          <p className="max-w-2xl text-sm text-[rgba(207,207,207,0.7)] sm:text-base">
            Radly Assistant ("Radly," "we," "our," or "us") is an AI-powered productivity tool that helps radiologists
            create structured reports efficiently and securely. This Privacy Policy explains how we collect, use, and
            protect your information across our web application, iOS app, and Android app.
          </p>
          <p className="text-xs font-semibold tracking-[0.18em] text-[rgba(207,207,207,0.65)]">
            Effective Date: January 2025
          </p>
          <p className="text-xs text-[rgba(207,207,207,0.75)]">
            Radly is developed by Dr. Mohamed Hammad.
          </p>
        </div>

        <Section title="1. Information We Collect">
          <p className="font-semibold text-white">a. Information You Provide</p>
          <ul className="list-disc list-inside space-y-2 text-[rgba(207,207,207,0.8)]">
            <li><span className="font-semibold text-white">Account details:</span> Name, email address, and credentials for authentication</li>
            <li><span className="font-semibold text-white">Clinical input:</span> Text, voice dictation, and findings you enter to generate draft reports</li>
            <li><span className="font-semibold text-white">Subscription data:</span> Managed by Apple/Google; we do not store payment card details</li>
            <li><span className="font-semibold text-white">Support requests:</span> Information you share when contacting us</li>
          </ul>
          <p className="font-semibold text-white pt-2">b. Automatically Collected Information</p>
          <ul className="list-disc list-inside space-y-2 text-[rgba(207,207,207,0.8)]">
            <li><span className="font-semibold text-white">Device data:</span> Device model, OS version, app version for compatibility</li>
            <li><span className="font-semibold text-white">Usage analytics:</span> Anonymous, aggregated statistics to improve the Service</li>
            <li><span className="font-semibold text-white">Crash reports:</span> Technical logs to identify and fix issues</li>
          </ul>
        </Section>

        <Section title="2. How We Use Your Information">
          <p>We use your information to:</p>
          <ul className="list-disc list-inside space-y-2 text-[rgba(207,207,207,0.8)]">
            <li>Provide the Service - process your clinical input through our AI to generate draft reports for your review</li>
            <li>Maintain your account - authenticate access and manage subscriptions</li>
            <li>Improve Radly - analyze usage patterns and fix technical issues</li>
            <li>Communicate with you - send essential service notifications and respond to support requests</li>
            <li>Comply with law - meet legal and regulatory obligations</li>
          </ul>
          <p className="font-semibold text-white pt-3">We do not:</p>
          <ul className="list-disc list-inside space-y-2 text-[rgba(207,207,207,0.8)]">
            <li>Sell or rent your personal information</li>
            <li>Use your data for advertising or profiling</li>
            <li>Share clinical content with third parties except as described below</li>
          </ul>
        </Section>

        <Section title="3. AI Processing">
          <ul className="list-disc list-inside space-y-2 text-[rgba(207,207,207,0.8)]">
            <li>Your clinical findings are transmitted securely to our servers</li>
            <li>Our AI processes your input to generate draft report content including structured findings, suggested impressions, and recommended language</li>
            <li>This processing occurs solely to provide the Service</li>
            <li>Generated drafts are presented for your review and approval</li>
            <li>You retain full control over final report content</li>
            <li>Your clinical content is processed only to deliver the Service and is never used to train AI models shared with other users</li>
          </ul>
        </Section>

        <Section title="4. Legal Basis for Processing">
          <ul className="list-disc list-inside space-y-2 text-[rgba(207,207,207,0.8)]">
            <li>Contract performance - to deliver the Service you requested</li>
            <li>Legitimate interests - to ensure security, prevent fraud, and improve functionality</li>
            <li>Legal compliance - to meet applicable laws and regulations</li>
            <li>Consent - where required for optional features or analytics</li>
          </ul>
        </Section>

        <Section title="5. Data Storage and Security">
          <ul className="list-disc list-inside space-y-2 text-[rgba(207,207,207,0.8)]">
            <li>Encryption in transit - all data transmitted via HTTPS/TLS</li>
            <li>Encryption at rest - data stored using AES-256 encryption</li>
            <li>Access controls - strict authentication and authorization</li>
            <li>Infrastructure security - hosted on secure, access-controlled cloud servers</li>
            <li>Regular audits - security practices reviewed and updated</li>
          </ul>
        </Section>

        <Section title="6. Data Retention">
          <ul className="list-disc list-inside space-y-2 text-[rgba(207,207,207,0.8)]">
            <li><span className="font-semibold text-white">Account data:</span> Until you delete your account</li>
            <li><span className="font-semibold text-white">Clinical content:</span> Until you delete your account</li>
            <li><span className="font-semibold text-white">Usage analytics:</span> 24 months (anonymized)</li>
            <li><span className="font-semibold text-white">Financial records:</span> 7 years (legal requirement, anonymized)</li>
          </ul>
        </Section>

        <Section title="7. Account Deletion">
          <p>
            You may delete your account at any time through Settings in the app or web application.
          </p>
          <p className="font-semibold text-white">Upon deletion:</p>
          <ul className="list-disc list-inside space-y-2 text-[rgba(207,207,207,0.8)]">
            <li>Your account and profile information are permanently removed</li>
            <li>Your clinical content and reports are deleted from our systems</li>
            <li>Active subscriptions are cancelled</li>
          </ul>
          <p className="font-semibold text-white">What we retain:</p>
          <ul className="list-disc list-inside space-y-2 text-[rgba(207,207,207,0.8)]">
            <li>Anonymized financial transaction records (legal compliance, 7 years)</li>
            <li>Anonymized, aggregated analytics data</li>
          </ul>
          <p>
            To request deletion, use the in-app option or email{" "}
            <Link href="mailto:privacy@radly.app" className="text-[#F5D791] hover:underline">
              privacy@radly.app
            </Link>.
          </p>
        </Section>

        <Section title="8. Sharing of Information">
          <p>
            We do not sell or rent personal information. We may share limited data only with:
          </p>
          <ul className="list-disc list-inside space-y-2 text-[rgba(207,207,207,0.8)]">
            <li><span className="font-semibold text-white">Service providers:</span> Cloud hosting, infrastructure (under strict confidentiality)</li>
            <li><span className="font-semibold text-white">Payment processors:</span> Apple/Google handle payments directly</li>
            <li><span className="font-semibold text-white">Legal authorities:</span> If required by law or valid legal process</li>
          </ul>
        </Section>

        <Section title="9. Your Rights">
          <p>
            Depending on your location (GDPR, CCPA, etc.), you may have rights to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-[rgba(207,207,207,0.8)]">
            <li>Access your personal data</li>
            <li>Correct inaccurate information</li>
            <li>Delete your account and data</li>
            <li>Export your data (portability)</li>
            <li>Object to or restrict certain processing</li>
            <li>Withdraw consent for optional features</li>
          </ul>
          <p>
            To exercise these rights, contact{" "}
            <Link href="mailto:privacy@radly.app" className="text-[#F5D791] hover:underline">
              privacy@radly.app
            </Link>.
          </p>
        </Section>

        <Section title="10. Children's Privacy">
          <p>
            Radly is designed for licensed healthcare professionals. We do not knowingly collect information from anyone under 16. If we become aware of such data, we will delete it promptly.
          </p>
        </Section>

        <Section title="11. Third-Party Services">
          <p>
            Radly integrates with:
          </p>
          <ul className="list-disc list-inside space-y-2 text-[rgba(207,207,207,0.8)]">
            <li>Apple App Store - for iOS app distribution and payments</li>
            <li>Google Play Store - for Android app distribution and payments</li>
            <li>Authentication providers - Sign in with Apple, Google Sign-In</li>
          </ul>
          <p>
            These services have their own privacy policies. We encourage you to review them.
          </p>
        </Section>

        <Section title="12. International Transfers">
          <p>
            If your data is transferred outside your country, we use appropriate safeguards including:
          </p>
          <ul className="list-disc list-inside space-y-2 text-[rgba(207,207,207,0.8)]">
            <li>Standard contractual clauses</li>
            <li>Encryption and secure infrastructure</li>
            <li>Compliance with applicable data protection laws</li>
          </ul>
        </Section>

        <Section title="13. Changes to This Policy">
          <p>
            We may update this Privacy Policy periodically. Material changes will be communicated via email or in-app notification. The current version is always available at{" "}
            <Link href="https://radly.app/privacy" className="text-[#F5D791] hover:underline">
              https://radly.app/privacy
            </Link>.
          </p>
        </Section>

        <Section title="14. Contact Us">
          <ul className="list-disc list-inside space-y-2 text-[rgba(207,207,207,0.8)]">
            <li>Privacy inquiries: <Link href="mailto:privacy@radly.app" className="text-[#F5D791] hover:underline">privacy@radly.app</Link></li>
            <li>General support: <Link href="mailto:support@radly.app" className="text-[#F5D791] hover:underline">support@radly.app</Link></li>
            <li>Website: <Link href="https://radly.app" className="text-[#F5D791] hover:underline">https://radly.app</Link></li>
          </ul>
          <div className="space-y-2 pt-2">
            <p className="text-sm text-[rgba(207,207,207,0.7)]">
              Radly is developed by Dr. Mohamed Hammad.
            </p>
            <div className="text-xs uppercase tracking-[0.18em] text-[rgba(207,207,207,0.5)]">
              Last Updated: October 2025
            </div>
          </div>
        </Section>
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
