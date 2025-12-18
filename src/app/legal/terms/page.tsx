"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateUserData } from '@/lib/user-data'
import { getSupabaseClient } from '@/lib/supabase-client-test'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { FileText, CheckCircle } from 'lucide-react'

const FALLBACK_TERMS_CONTENT = `# Radly Assistant Terms of Service

**Effective Date: January 2025**

These Terms of Service ("Terms") govern your access to and use of Radly Assistant, including the web application, iOS app, and Android app (collectively, the "Service"). By creating an account or using the Service, you agree to be bound by these Terms.

## 1. Service Description & AI Disclosure
Radly is an AI-powered productivity assistant that helps radiologists create structured reports more efficiently.

**How Radly Works:**
- You provide clinical findings through voice or text input
- Our AI generates a draft report including structured findings, suggested impressions, and recommended follow-up language
- You review, edit, and approve all content before finalizing
- The final report reflects your professional judgment and clinical decision-making

**Important:**
- All AI-generated content, including suggested opinions and recommendations, is presented as a draft for your review
- Radly does not make autonomous clinical decisions
- You, as the licensed radiologist, bear full professional responsibility for reviewing, modifying, and approving all report content
- Radly assists with efficiency and formatting; clinical interpretation remains your professional duty
- Radly is not a medical device and does not replace professional medical judgment.

## 2. Account & Access
You must provide accurate registration information and maintain the confidentiality of your login credentials. You are solely responsible for all activity that occurs under your account.

You agree to:
- Notify us immediately of any unauthorized access
- Ensure only authorized clinical professionals use your account
- Maintain appropriate security on devices used to access the Service

## 3. Clinical Responsibility
You retain full professional responsibility for all clinical content and decisions.

As a Radly user, you must:
- Review and verify all AI-generated draft content before use
- Edit and correct any suggested text as clinically appropriate
- Provide final approval on every report
- Comply with your institution's documentation standards

Radly generates drafts to enhance your productivity. The final clinical interpretation, opinion, and recommendations are yours.

## 4. Subscription & Payment
Radly offers subscription-based access to premium features.

- **Auto-Renewal:** Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current billing period. Manage your subscription in Settings (iOS: Apple ID > Subscriptions; Android: Google Play > Subscriptions).
- **Payment:** Charged to your Apple ID or Google Play account at confirmation of purchase. Subscription fees are non-refundable except as required by law.

## 5. Acceptable Use
You agree not to:
- Misuse the Service or attempt unauthorized access
- Reverse engineer or disassemble the Service
- Use the Service for unlawful purposes
- Share credentials with unauthorized parties

You will comply with all applicable laws and regulations, including those governing Protected Health Information (PHI).

## 6. Data & Privacy
Your privacy matters. See our Privacy Policy for details.

**Key Points:**
- We process your input solely to provide the Service
- Data is encrypted in transit and at rest
- We do not sell your personal information
- You may delete your account and data at any time

## 7. Account Deletion
Delete your account anytime via Settings in the app or web application. Upon deletion:
- Your account and profile are permanently removed
- Your data is deleted from our systems
- Active subscriptions are cancelled
- Certain financial records may be retained as required by law.

## 8. Intellectual Property
Radly's name, logo, and technology are protected by intellectual property laws.

**Your Content:** You retain ownership of all content you submit and reports you approve. You grant Radly a limited license to process your content solely to provide the Service.

## 9. Service Availability
We strive for reliable availability but cannot guarantee uninterrupted access. The Service may be unavailable for maintenance or due to technical issues. We may modify or discontinue features with reasonable notice.

## 10. Disclaimers
THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES INCLUDING MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.

Radly is a productivity tool. It generates draft content for your review; it does not provide autonomous diagnoses or replace your clinical judgment.

## 11. Limitation of Liability
TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES.

Total liability is limited to subscription fees paid in the 12 months preceding a claim. Nothing limits liability for gross negligence, fraud, or willful misconduct.

## 12. Termination
You may stop using Radly and delete your account anytime. We may suspend access for Terms violations or if required by law.

## 13. Changes to Terms
We may update these Terms with 30 days notice via email or in-app notification. Continued use after changes take effect constitutes acceptance.

## 14. Contact
- Email: legal@radly.app
- Support: support@radly.app
- Website: https://radly.app

Radly is developed by Dr. Mohamed Hammad.

**Last Updated: October 2025**`

// Terms page has dynamic user interactions but could use ISR
export default function TermsPage() {
  const [termsContent, setTermsContent] = useState(FALLBACK_TERMS_CONTENT)
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Fetch terms content
    fetch('/content/terms.md', {
      headers: {
        'X-Request-Id': crypto.randomUUID(),
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        return response.text()
      })
      .then(content => setTermsContent(content))
      .catch(error => {
        console.error('Error loading terms:', error)
        setTermsContent(FALLBACK_TERMS_CONTENT)
      })
  }, [])

  const handleAcceptTerms = async () => {
    setLoading(true)
    try {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('You must be signed in to accept terms')
        router.push('/login')
        return
      }

      await updateUserData(user.id, {
        accepted_terms_at: new Date().toISOString(),
      })

      toast.success('Terms accepted successfully!')
      router.push('/app/templates')
    } catch (error) {
      console.error('Error accepting terms:', error)
      toast.error('Failed to accept terms')
    } finally {
      setLoading(false)
    }
  }

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
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Terms of Service</CardTitle>
            <CardDescription>
              Please read and accept our terms of service to continue using Radly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none mb-8">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {termsContent}
              </ReactMarkdown>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center space-x-3 mb-6">
                <input
                  type="checkbox"
                  id="accept-terms"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
                />
                <label htmlFor="accept-terms" className="text-sm font-medium text-foreground">
                  I have read and agree to the Terms of Service
                </label>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={handleAcceptTerms}
                  disabled={!accepted || loading}
                  variant="default"
                  className="flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>I Accept</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/login')}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
