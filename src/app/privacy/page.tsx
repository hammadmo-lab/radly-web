import type { Metadata } from "next";
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'

const metadataDescription = "Radly Privacy Policy: encrypted data handling, secure processing, no data sharing. Your medical information is never sold or shared.";

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
  return (
    <div className="min-h-screen bg-gradient-to-br from-muted to-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">Radly</span>
          </div>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Radly Assistant – Privacy Policy</CardTitle>
            <CardDescription>
              <strong>Effective Date:</strong> October 2025 | <strong>Last Updated:</strong> October 2025
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Radly Assistant ("Radly," "we," "our," or "us") is an AI-powered platform that helps healthcare professionals create structured radiology reports efficiently and securely. We respect your privacy and are committed to protecting your personal information.
            </p>

            <hr className="my-6 border-t border-border" />

            <h2>1. Information We Collect</h2>

            <h3>a. Information You Provide</h3>
            <ul>
              <li>Account details – name, email address, and credentials when you sign up or log in.</li>
              <li>Subscription and billing data – Apple handles all payments through the App Store; we do not access or store credit-card details.</li>
              <li>Report content – any text, dictation, or medical information you enter is processed solely to generate your report and is never sold or shared.</li>
              <li>Support requests – information you send us when contacting support.</li>
            </ul>

            <h3>b. Automatically Collected Information</h3>
            <ul>
              <li>Device and usage data – device model, operating system, app version, crash logs, and anonymous analytics to improve performance.</li>
              <li>Cookies and analytics – limited, privacy-friendly analytics tools may collect aggregated statistics about app usage.</li>
            </ul>

            <hr className="my-6 border-t border-border" />

            <h2>2. How We Use Your Information</h2>
            <p>We use collected data to:</p>
            <ul>
              <li>Operate and improve our app and services.</li>
              <li>Maintain account security and prevent misuse.</li>
              <li>Provide customer support and send essential service messages.</li>
              <li>Comply with legal obligations.</li>
            </ul>
            <p className="italic">We do not use your data for advertising or profiling.</p>

            <hr className="my-6 border-t border-border" />

            <h2>3. Legal Basis for Processing</h2>
            <p>We process your information on the basis of:</p>
            <ul>
              <li>Performance of a contract (to deliver the service you requested).</li>
              <li>Legitimate interests (to ensure security and functionality).</li>
              <li>Your consent where required (for optional analytics).</li>
            </ul>

            <hr className="my-6 border-t border-border" />

            <h2>4. Data Storage and Security</h2>
            <p>
              All information is transmitted using HTTPS and stored on secure, access-controlled servers.
              We use encryption and industry-standard safeguards to protect data from unauthorized access, alteration, or loss.
            </p>

            <hr className="my-6 border-t border-border" />

            <h2>5. Data Retention</h2>
            <p>
              We retain your information only as long as necessary to provide our services or comply with legal requirements.
              You may request deletion of your account and associated data at any time by emailing privacy@radly.app.
            </p>

            <hr className="my-6 border-t border-border" />

            <h2>6. Sharing of Information</h2>
            <p>
              We do not sell or rent personal information.
              We may share limited data only with:
            </p>
            <ul>
              <li>Service providers that host or process data on our behalf under strict confidentiality.</li>
              <li>Legal authorities if required by law or valid legal process.</li>
            </ul>

            <hr className="my-6 border-t border-border" />

            <h2>7. Children's Privacy</h2>
            <p>
              Radly Assistant is intended for professional medical use and not for children under 16.
              We do not knowingly collect information from minors.
            </p>

            <hr className="my-6 border-t border-border" />

            <h2>8. Your Rights</h2>
            <p>
              Depending on your location, you may have rights to:
            </p>
            <ul>
              <li>Access, correct, or delete your data.</li>
              <li>Object to or restrict processing.</li>
              <li>Request data portability.</li>
            </ul>
            <p>To exercise these rights, contact privacy@radly.app.</p>

            <hr className="my-6 border-t border-border" />

            <h2>9. Third-Party Links and Integrations</h2>
            <p>
              Radly Assistant may include links or integrations with third-party services (e.g., Apple, cloud storage).
              Their privacy practices are governed by their own policies.
            </p>

            <hr className="my-6 border-t border-border" />

            <h2>10. International Transfers</h2>
            <p>
              If data is transferred outside your country, we use appropriate safeguards such as contractual clauses and secure infrastructure.
            </p>

            <hr className="my-6 border-t border-border" />

            <h2>11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically.
              Any changes will be posted at https://radly.app/privacy with the revised effective date.
            </p>

            <hr className="my-6 border-t border-border" />

            <h2>12. Contact Us</h2>
            <div className="bg-muted p-4 rounded-lg">
              <p><strong>Radly Privacy Team</strong></p>
              <p><strong>Email:</strong> privacy@radly.app</p>
              <p><strong>Website:</strong> https://radly.app</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
