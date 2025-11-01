"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'

// Static page - no need for force-dynamic

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
            <CardTitle className="text-2xl">Radly Assistant – Privacy Policy</CardTitle>
            <CardDescription>
              Effective Date: October 2025 | Last Updated: October 2025
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <p>
              Radly Assistant ("Radly," "we," "our," or "us") is an AI-powered platform that helps healthcare
              professionals create structured radiology reports efficiently and securely. We respect your privacy
              and are committed to protecting your personal information.
            </p>

            <div>
              <h2 className="text-lg font-semibold">1. Information We Collect</h2>

              <h3 className="text-base font-semibold mt-4">a. Information You Provide</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account details</strong> – name, email address, and credentials when you sign up or log in.</li>
                <li><strong>Subscription and billing data</strong> – Apple handles all payments through the App Store; we do not access or store credit-card details.</li>
                <li><strong>Report content</strong> – any text, dictation, or medical information you enter is processed solely to generate your report and is never sold or shared.</li>
                <li><strong>Support requests</strong> – information you send us when contacting support.</li>
              </ul>

              <h3 className="text-base font-semibold mt-4">b. Automatically Collected Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Device and usage data</strong> – device model, operating system, app version, crash logs, and anonymous analytics to improve performance.</li>
                <li><strong>Cookies and analytics</strong> – limited, privacy-friendly analytics tools may collect aggregated statistics about app usage.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold">2. How We Use Your Information</h2>
              <p>We use collected data to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Operate and improve our app and services.</li>
                <li>Maintain account security and prevent misuse.</li>
                <li>Provide customer support and send essential service messages.</li>
                <li>Comply with legal obligations.</li>
              </ul>
              <p className="mt-3 font-semibold text-sm">We do not use your data for advertising or profiling.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">3. Legal Basis for Processing</h2>
              <p>We process your information on the basis of:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Performance of a contract (to deliver the service you requested).</li>
                <li>Legitimate interests (to ensure security and functionality).</li>
                <li>Your consent where required (for optional analytics).</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold">4. Data Storage and Security</h2>
              <p>
                All information is transmitted using HTTPS and stored on secure, access-controlled servers.
                We use encryption and industry-standard safeguards to protect data from unauthorized access,
                alteration, or loss.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">5. Data Retention</h2>
              <p>
                We retain your information only as long as necessary to provide our services or comply with legal
                requirements. You may request deletion of your account and associated data at any time by emailing{' '}
                <a href="mailto:privacy@radly.app" className="text-primary hover:underline">privacy@radly.app</a>.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">6. Sharing of Information</h2>
              <p className="font-semibold">We do not sell or rent personal information.</p>
              <p className="mt-2">We may share limited data only with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Service providers that host or process data on our behalf under strict confidentiality.</li>
                <li>Legal authorities if required by law or valid legal process.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold">7. Children's Privacy</h2>
              <p>
                Radly Assistant is intended for professional medical use and not for children under 16.
                We do not knowingly collect information from minors.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">8. Your Rights</h2>
              <p>Depending on your location, you may have rights to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access, correct, or delete your data.</li>
                <li>Object to or restrict processing.</li>
                <li>Request data portability.</li>
              </ul>
              <p className="mt-3">
                To exercise these rights, contact{' '}
                <a href="mailto:privacy@radly.app" className="text-primary hover:underline">privacy@radly.app</a>.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">9. Third-Party Links and Integrations</h2>
              <p>
                Radly Assistant may include links or integrations with third-party services (e.g., Apple, cloud
                storage). Their privacy practices are governed by their own policies.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">10. International Transfers</h2>
              <p>
                If data is transferred outside your country, we use appropriate safeguards such as contractual
                clauses and secure infrastructure.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">11. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy periodically. Any changes will be posted at{' '}
                <a href="https://radly.app/privacy" className="text-primary hover:underline">https://radly.app/privacy</a>{' '}
                with the revised effective date.
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg mt-6">
              <h2 className="text-lg font-semibold mb-2">12. Contact Us</h2>
              <p className="font-semibold">Radly Privacy Team</p>
              <p>Email: <a href="mailto:privacy@radly.app" className="text-primary hover:underline">privacy@radly.app</a></p>
              <p>Website: <a href="https://radly.app" className="text-primary hover:underline">https://radly.app</a></p>
            </div>

            <p className="text-sm text-muted-foreground mt-8 pt-6 border-t">
              <strong>Last updated:</strong> October 2025
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
