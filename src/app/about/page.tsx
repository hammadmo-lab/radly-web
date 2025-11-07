import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumb } from "@/components/marketing/Breadcrumb";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { PrimaryCTA, SecondaryCTA } from "@/components/marketing/PrimaryCTA";
import { Linkedin, Mail, Shield, Heart } from "lucide-react";

const metadataDescription = "About Radly: Built by clinicians for clinicians. Our mission is to generate clear, structured reports that respect radiologist time and patient privacy.";

export const metadata: Metadata = {
  title: "About | Radly Assistant",
  description: metadataDescription,
  alternates: {
    canonical: "https://radly.app/about",
  },
  openGraph: {
    title: "About Radly - Trust, Evidence, and Clinician-First Design",
    description: metadataDescription,
    url: "https://radly.app/about",
    type: "website",
    images: [
      {
        url: "https://radly.app/og-default.png",
        width: 1200,
        height: 630,
        alt: "About Radly - Built by radiologists, for radiologists",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "About Radly",
    description: metadataDescription,
  },
};

const values = [
  {
    title: "Clinical Rigor",
    description: "Evidence before claims. Every feature is validated with real radiologists and clinical data.",
    icon: "📊",
  },
  {
    title: "Patient Privacy",
    description: "Zero trust mindset. Encrypted end-to-end. Audio is never stored. Audit logs on demand.",
    icon: "🔒",
  },
  {
    title: "Reliability Under Pressure",
    description: "Sub-second performance and stable across high-volume reading sessions. Built for the ER.",
    icon: "⚡",
  },
  {
    title: "Structured Clarity",
    description: "Reports that match clinical standards. Proper sections, consistent terminology, PACS-ready.",
    icon: "📋",
  },
  {
    title: "Safety & Auditability",
    description: "Reproducible outputs. Every decision is traceable. Clinical teams remain in control.",
    icon: "✓",
  },
  {
    title: "Respect for Clinician Time",
    description: "Fewer clicks, fewer errors. Median draft time under 2 minutes. Time saved for patient care.",
    icon: "⏱️",
  },
];

export default function AboutPage() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Radly",
    "url": "https://radly.app",
    "description": "AI-powered voice assistant for structured radiology reporting",
    "foundingDate": "2024",
    "founder": {
      "@type": "Person",
      "name": "Dr. Mohamed A. Hammad",
      "jobTitle": "Founder and CEO",
      "url": "https://mohamedhammad.com",
      "sameAs": [
        "https://www.linkedin.com/in/mohamed-h-47953589",
        "https://twitter.com/ThisIsHammadMo",
      ],
    },
    "areaServed": "Global",
    "knowsAbout": [
      "Radiology",
      "Medical AI",
      "Clinical Workflows",
      "Patient Privacy",
      "Structured Reporting",
    ],
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://radly.app/about",
    "name": "About | Radly Assistant",
    "description": metadataDescription,
    "url": "https://radly.app/about",
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

  const founderSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Dr. Mohamed A. Hammad",
    "jobTitle": "Founder and CEO, Radiologist",
    "url": "https://mohamedhammad.com",
    "sameAs": [
      "https://www.linkedin.com/in/mohamed-h-47953589",
      "https://twitter.com/ThisIsHammadMo",
    ],
    "description": "Diagnostic radiologist and founder of Radly. Focused on building AI tools that respect clinician time and patient privacy.",
    "workLocation": "Egypt",
    "knowsAbout": ["Diagnostic Radiology", "AI/ML", "Clinical Workflows", "Product Design"],
  };

  return (
    <div className="bg-[var(--ds-bg-gradient)] text-white">
      <script
        id="about-webpage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        id="about-organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        id="about-founder-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(founderSchema) }}
      />

      <main className="mx-auto max-w-5xl px-5 py-16">
        <header className="mb-16 space-y-4">
          <Breadcrumb
            items={[
              { label: "Home", url: "/" },
              { label: "About", url: "/about" },
            ]}
          />
          <h1 className="text-5xl font-semibold sm:text-6xl leading-tight">
            Built by Radiologists,<br />for Radiologists
          </h1>
          <p className="text-xl text-[rgba(207,207,207,0.75)] max-w-2xl">
            Radly generates clear, structured reports that match how radiologists think. Privacy and reliability are non-negotiables.
          </p>
        </header>

        {/* Mission Section */}
        <section className="mb-20 space-y-6">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold">Our Mission</h2>
              <p className="text-lg text-[rgba(207,207,207,0.75)] leading-relaxed">
                Radly began in a radiology department where long shifts, inconsistent templates, and copy-paste errors slowed patient care.
              </p>
              <p className="text-lg text-[rgba(207,207,207,0.75)] leading-relaxed">
                We built Radly to generate clear, structured reports that integrate with existing tools while keeping privacy and reliability as non-negotiables.
              </p>
              <p className="text-lg text-[rgba(207,207,207,0.75)] leading-relaxed">
                Every report is reviewed and finalized by a radiologist. Radly assists—it doesn't decide.
              </p>
            </div>

            <div className="aurora-card border border-[rgba(255,255,255,0.1)] p-8 space-y-4">
              <div className="text-sm uppercase tracking-[0.28em] text-[rgba(207,207,207,0.55)] font-semibold">
                The Problem We Solve
              </div>
              <ul className="space-y-3 text-[rgba(207,207,207,0.75)]">
                <li className="flex gap-3">
                  <span className="text-[rgba(143,130,255,0.85)]">✓</span>
                  <span>Inconsistent report structure across teams</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[rgba(143,130,255,0.85)]">✓</span>
                  <span>Clerical documentation taking away from clinical time</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[rgba(143,130,255,0.85)]">✓</span>
                  <span>Copy-paste errors and missing findings</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[rgba(143,130,255,0.85)]">✓</span>
                  <span>Training new radiologists on department standards</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[rgba(143,130,255,0.85)]">✓</span>
                  <span>Integration friction with existing PACS workflows</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-20 space-y-8">
          <h2 className="text-3xl font-semibold">Our Values</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => (
              <div
                key={value.title}
                className="aurora-card border border-[rgba(255,255,255,0.08)] p-6 space-y-3"
              >
                <div className="text-3xl">{value.icon}</div>
                <h3 className="text-lg font-semibold text-white">{value.title}</h3>
                <p className="text-sm text-[rgba(207,207,207,0.75)]">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Founder Section */}
        <section className="mb-20 space-y-8">
          <h2 className="text-3xl font-semibold">Our Leadership</h2>

          <div className="aurora-card border border-[rgba(255,255,255,0.1)] p-8 lg:p-12 space-y-8">
            <div className="grid gap-8 lg:grid-cols-2 items-start">
              {/* Avatar placeholder - in production this would be an actual image */}
              <div className="flex flex-col items-center space-y-4">
                <div className="w-48 h-48 rounded-2xl overflow-hidden border border-[rgba(143,130,255,0.3)]">
                  <Image
                    src="/team/mohamed-hammad.jpg"
                    alt="Dr. Mohamed A. Hammad"
                    width={192}
                    height={192}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
                <div className="flex gap-3">
                  <a
                    href="https://www.linkedin.com/in/mohamed-h-47953589"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[rgba(143,130,255,0.15)] text-[rgba(143,130,255,0.85)] hover:bg-[rgba(143,130,255,0.25)] transition-colors"
                    aria-label="Mohamed Hammad LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a
                    href="https://twitter.com/ThisIsHammadMo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[rgba(143,130,255,0.15)] text-[rgba(143,130,255,0.85)] hover:bg-[rgba(143,130,255,0.25)] transition-colors"
                    aria-label="Mohamed Hammad Twitter"
                  >
                    𝕏
                  </a>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold text-white">Dr. Mohamed A. Hammad</h3>
                  <p className="text-[rgba(143,130,255,0.85)] font-semibold mt-1">
                    Founder and CEO, Radiologist
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-[rgba(207,207,207,0.55)] uppercase">Focus at Radly</p>
                    <p className="mt-1 text-[rgba(207,207,207,0.75)]">
                      Product direction, clinical validation, and ensuring Radly stays true to radiologist needs.
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[rgba(207,207,207,0.55)] uppercase">Background</p>
                    <p className="mt-1 text-[rgba(207,207,207,0.75)]">
                      Diagnostic radiologist with expertise in clinical workflows and healthcare technology. Combines medicine with product thinking to solve real problems in the reading room.
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[rgba(207,207,207,0.55)] uppercase">Interests</p>
                    <p className="mt-1 text-[rgba(207,207,207,0.75)]">
                      Clinical implementation, psychology, languages, and travel.
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[rgba(207,207,207,0.55)] uppercase">Location</p>
                    <p className="mt-1 text-[rgba(207,207,207,0.75)]">Egypt</p>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-[rgba(255,255,255,0.1)]">
                  <a
                    href="https://mohamedhammad.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[rgba(143,130,255,0.85)] hover:text-[rgba(143,130,255,1)] transition-colors text-sm"
                  >
                    Learn more → mohamedhammad.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Future Careers CTA */}
        <section className="mb-20 space-y-6 rounded-3xl border border-[rgba(255,255,255,0.1)] bg-[rgba(12,16,28,0.65)] p-8">
          <h2 className="text-2xl font-semibold">We're Growing</h2>
          <p className="text-[rgba(207,207,207,0.75)]">
            We're looking for clinical experts, engineers, and healthcare innovators to join our team. If you're passionate about improving radiology workflows, we'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <PrimaryCTA href="mailto:hello@radly.app?subject=Interested%20in%20Radly" ariaLabel="Email Radly about careers">
              Express Interest
            </PrimaryCTA>
            <SecondaryCTA href="/security" ariaLabel="Learn about Radly security">
              Our Commitment to Security
            </SecondaryCTA>
          </div>
        </section>

        {/* Navigation */}
        <nav className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pt-8 border-t border-[rgba(255,255,255,0.1)]">
          <Link
            href="/"
            className="text-[rgba(143,130,255,0.85)] hover:text-[rgba(143,130,255,1)] transition-colors"
          >
            ← Back to Home
          </Link>
          <div className="flex gap-4 text-sm">
            <Link
              href="/security"
              className="text-[rgba(143,130,255,0.85)] hover:text-[rgba(143,130,255,1)] transition-colors"
            >
              Security & Privacy
            </Link>
            <span className="text-[rgba(207,207,207,0.3)]">•</span>
            <a
              href="mailto:hello@radly.app"
              className="text-[rgba(143,130,255,0.85)] hover:text-[rgba(143,130,255,1)] transition-colors"
            >
              Contact Us
            </a>
          </div>
        </nav>
      </main>

      <MarketingFooter />
    </div>
  );
}
