import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Radly",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--ds-bg-gradient)] text-white">
      <main className="mx-auto max-w-4xl px-6 py-16 sm:py-20 lg:py-24 space-y-10">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgba(207,207,207,0.55)]">
            Our Commitment
          </p>
          <h1 className="text-4xl font-semibold sm:text-[2.8rem] sm:leading-[1.1]">
            Privacy Policy
          </h1>
          <p className="max-w-2xl text-sm text-[rgba(207,207,207,0.7)] sm:text-base">
            Radly is an intelligent assistant designed for radiologists. Clinicians retain full control over every
            report, and we manage information responsibly. This document outlines how we collect, use, and safeguard
            information within the Radly platform.
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">1. Information We Collect</h2>
          <p className="text-sm text-[rgba(207,207,207,0.72)]">
            We collect information needed to provide and improve Radly&rsquo;s assistant experience, including account
            details (name, email) and usage activity (features used, timestamps). When clinicians use Radly to assist
            with reports, the content is stored securely and remains under the control of the clinical organisation. We
            never use clinician-generated content to train public models or share it with third parties without consent.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">2. How We Use Information</h2>
          <p className="text-sm text-[rgba(207,207,207,0.72)]">
            Information is used to deliver the assistant features you rely on, maintain security, provide support, and
            analyse aggregated usage trends. Clinician oversight is required on every report; Radly acts as an assistant
            within your workflow.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">3. Protecting Data</h2>
          <p className="text-sm text-[rgba(207,207,207,0.72)]">
            We implement administrative, technical, and physical safeguards to protect stored information. Access is
            limited to authorised personnel and governed by role-based controls. Data is encrypted in transit and at
            rest, and we follow secure development and monitoring practices.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">4. Your Choices &amp; Rights</h2>
          <p className="text-sm text-[rgba(207,207,207,0.72)]">
            Organisations can request access, correction, or deletion of information by contacting Radly support. We
            honour applicable privacy regulations and work with your team to meet compliance requirements.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">5. Updates</h2>
          <p className="text-sm text-[rgba(207,207,207,0.72)]">
            We may update this policy as Radly evolves. When significant changes are made, we&rsquo;ll notify account
            owners via email or in-app notices.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">6. Contact</h2>
          <p className="text-sm text-[rgba(207,207,207,0.72)]">
            Questions about privacy? Reach us at{" "}
            <Link href="mailto:privacy@radly.app" className="text-[#8F82FF] hover:underline">
              privacy@radly.app
            </Link>
            . We&rsquo;re here to help.
          </p>
        </section>

        <div className="text-xs uppercase tracking-[0.18em] text-[rgba(207,207,207,0.5)]">
          Last updated: January 2025
        </div>
      </main>
    </div>
  );
}
