import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/marketing/Breadcrumb";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { PrimaryCTA } from "@/components/marketing/PrimaryCTA";
import { Mail, Linkedin, MessageSquare, Building2 } from "lucide-react";

const metadataDescription = "Contact Radly: Reach out for support, sales inquiries, partnerships, or career opportunities. We're here to help.";

export const metadata: Metadata = {
  title: "Contact | Radly Assistant",
  description: metadataDescription,
  alternates: {
    canonical: "https://radly.app/contact",
  },
  openGraph: {
    title: "Contact Radly",
    description: metadataDescription,
    url: "https://radly.app/contact",
    type: "website",
    images: [
      {
        url: "https://radly.app/og-default.png",
        width: 1200,
        height: 630,
        alt: "Contact Radly",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Contact Radly",
    description: metadataDescription,
  },
};

const contactChannels = [
  {
    icon: Mail,
    title: "General Inquiries",
    email: "hello@radly.app",
    description: "Questions about Radly, feature requests, or general feedback",
  },
  {
    icon: MessageSquare,
    title: "Support",
    email: "support@radly.app",
    description: "Account help, technical issues, troubleshooting",
  },
  {
    icon: Building2,
    title: "Sales & Partnerships",
    email: "partnerships@radly.app",
    description: "Enterprise plans, integrations, collaboration opportunities",
  },
  {
    icon: Linkedin,
    title: "Careers",
    email: "careers@radly.app",
    description: "Job opportunities and career inquiries",
  },
];

export default function ContactPage() {
  const contactPointSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPoint",
    "telephone": "+20-XXX-XXX-XXXX",
    "contactType": "Customer Support",
    "email": "support@radly.app",
    "areaServed": "Global",
    "availableLanguage": ["en"],
  };

  const organizationContactSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Radly",
    "url": "https://radly.app",
    "logo": "https://radly.app/icon-512.png",
    "description": "AI-powered voice assistant for structured radiology reporting",
    "foundingDate": "2024",
    "areaServed": "Global",
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+20-XXX-XXX-XXXX",
        "contactType": "Customer Support",
        "email": "support@radly.app",
        "areaServed": "Global",
      },
      {
        "@type": "ContactPoint",
        "contactType": "Sales",
        "email": "partnerships@radly.app",
        "areaServed": "Global",
      },
    ],
    "sameAs": [
      "https://www.linkedin.com/company/radly",
      "https://twitter.com/RadlyHealth",
    ],
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://radly.app/contact",
    "name": "Contact | Radly Assistant",
    "description": metadataDescription,
    "url": "https://radly.app/contact",
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
        id="contact-point-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPointSchema) }}
      />
      <script
        id="organization-contact-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationContactSchema) }}
      />
      <script
        id="contact-webpage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />

      <main className="mx-auto max-w-5xl px-5 py-16">
        <header className="mb-16 space-y-4">
          <Breadcrumb
            items={[
              { label: "Home", url: "/" },
              { label: "Contact", url: "/contact" },
            ]}
          />
          <h1 className="text-5xl font-semibold sm:text-6xl leading-tight">
            Get in Touch
          </h1>
          <p className="text-xl text-[rgba(207,207,207,0.75)] max-w-2xl">
            Have questions about Radly? Want to partner with us? Join our team? We'd love to hear from you.
          </p>
        </header>

        {/* Contact Methods */}
        <section className="mb-20 space-y-8">
          <h2 className="text-3xl font-semibold">How to Reach Us</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {contactChannels.map((channel) => {
              const IconComponent = channel.icon;
              return (
                <div
                  key={channel.title}
                  className="aurora-card border border-[rgba(255,255,255,0.08)] p-6 space-y-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-[rgba(143,130,255,0.15)] text-[rgba(143,130,255,0.85)]">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">
                        {channel.title}
                      </h3>
                      <p className="text-sm text-[rgba(207,207,207,0.75)] mt-1">
                        {channel.description}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`mailto:${channel.email}`}
                    className="inline-flex items-center gap-2 text-[rgba(143,130,255,0.85)] hover:text-[rgba(143,130,255,1)] transition-colors text-sm font-semibold"
                  >
                    {channel.email}
                    <span>→</span>
                  </a>
                </div>
              );
            })}
          </div>
        </section>

        {/* Contact Form */}
        <section className="mb-20 space-y-8">
          <h2 className="text-3xl font-semibold">Send us a Message</h2>
          <div className="aurora-card border border-[rgba(255,255,255,0.1)] p-8 lg:p-12">
            <form className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-semibold text-[rgba(207,207,207,0.9)]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Your name"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder:text-[rgba(207,207,207,0.5)] focus:outline-none focus:border-[rgba(143,130,255,0.5)] transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-[rgba(207,207,207,0.9)]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="your@email.com"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder:text-[rgba(207,207,207,0.5)] focus:outline-none focus:border-[rgba(143,130,255,0.5)] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="inquiry-type" className="text-sm font-semibold text-[rgba(207,207,207,0.9)]">
                  Inquiry Type
                </label>
                <select
                  id="inquiry-type"
                  name="inquiry-type"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white focus:outline-none focus:border-[rgba(143,130,255,0.5)] transition-colors appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238f82ff' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 0.75rem center",
                    backgroundSize: "1.5em 1.5em",
                    paddingRight: "2.5rem",
                  }}
                >
                  <option value="">Select inquiry type...</option>
                  <option value="support">General Support</option>
                  <option value="sales">Sales & Enterprise</option>
                  <option value="partnership">Partnership Opportunities</option>
                  <option value="careers">Careers</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-semibold text-[rgba(207,207,207,0.9)]">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Tell us more about your inquiry..."
                  rows={6}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder:text-[rgba(207,207,207,0.5)] focus:outline-none focus:border-[rgba(143,130,255,0.5)] transition-colors resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="privacy"
                  name="privacy"
                  required
                  className="w-4 h-4 rounded border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.05)] checked:bg-[rgba(143,130,255,0.5)] checked:border-[rgba(143,130,255,0.5)] cursor-pointer"
                />
                <label htmlFor="privacy" className="text-sm text-[rgba(207,207,207,0.75)]">
                  I agree to our{" "}
                  <a
                    href="/privacy"
                    className="text-[rgba(143,130,255,0.85)] hover:text-[rgba(143,130,255,1)] transition-colors"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>

              <PrimaryCTA
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  // Form submission would be handled here
                  alert(
                    "Thank you for reaching out! We'll get back to you soon."
                  );
                }}
                ariaLabel="Send message"
              >
                Send Message
              </PrimaryCTA>
            </form>
          </div>
        </section>

        {/* Social Links */}
        <section className="mb-20 space-y-6 rounded-3xl border border-[rgba(255,255,255,0.1)] bg-[rgba(12,16,28,0.65)] p-8">
          <h2 className="text-2xl font-semibold">Connect With Us</h2>
          <p className="text-[rgba(207,207,207,0.75)]">
            Follow Radly on social media for updates, insights, and company news.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="https://www.linkedin.com/company/radly"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-[rgba(143,130,255,0.15)] border border-[rgba(143,130,255,0.3)] text-[rgba(143,130,255,0.85)] hover:bg-[rgba(143,130,255,0.25)] transition-colors font-semibold"
            >
              <Linkedin className="w-5 h-5" />
              LinkedIn
            </a>
            <a
              href="https://twitter.com/RadlyHealth"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-[rgba(143,130,255,0.15)] border border-[rgba(143,130,255,0.3)] text-[rgba(143,130,255,0.85)] hover:bg-[rgba(143,130,255,0.25)] transition-colors font-semibold"
            >
              𝕏
              <span>Twitter</span>
            </a>
          </div>
        </section>

        {/* Navigation */}
        <nav className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pt-8 border-t border-[rgba(255,255,255,0.1)]">
          <Link
            href="/about"
            className="text-[rgba(143,130,255,0.85)] hover:text-[rgba(143,130,255,1)] transition-colors"
          >
            ← Back to About
          </Link>
          <div className="flex gap-4 text-sm">
            <Link
              href="/security"
              className="text-[rgba(143,130,255,0.85)] hover:text-[rgba(143,130,255,1)] transition-colors"
            >
              Security & Privacy
            </Link>
            <span className="text-[rgba(207,207,207,0.3)]\">•</span>
            <Link
              href="/faq"
              className="text-[rgba(143,130,255,0.85)] hover:text-[rgba(143,130,255,1)] transition-colors"
            >
              FAQ
            </Link>
          </div>
        </nav>
      </main>

      <MarketingFooter />
    </div>
  );
}
