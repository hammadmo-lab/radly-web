"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AccessibilityIcon } from 'lucide-react'

// Static page - no need for force-dynamic

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-muted to-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <AccessibilityIcon className="w-5 h-5 text-primary-foreground" />
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
            <CardTitle className="text-2xl">Accessibility Support</CardTitle>
            <CardDescription>
              Radly is designed for all users, with built-in accessibility features
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <p>
              Radly Assistant supports standard iOS accessibility features, including VoiceOver, Voice Control,
              Dynamic Type, and Dark Mode. We are committed to providing a comfortable experience for all users.
            </p>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                Supported Accessibility Features
              </h2>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex items-start gap-2">
                  <span className="text-base mt-0.5">✓</span>
                  <span><strong>VoiceOver</strong> – Full screen reader support for navigating the app</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-base mt-0.5">✓</span>
                  <span><strong>Voice Control</strong> – Hands-free navigation and control</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-base mt-0.5">✓</span>
                  <span><strong>Dynamic Type</strong> – Adjustable text sizes for readability</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-base mt-0.5">✓</span>
                  <span><strong>Dark Mode</strong> – Eye-friendly dark theme support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-base mt-0.5">✓</span>
                  <span><strong>High Contrast</strong> – Enhanced visual distinction for better visibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-base mt-0.5">✓</span>
                  <span><strong>Keyboard Navigation</strong> – Full app navigation without touch</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Our Commitment</h2>
              <p>
                We continuously work to improve accessibility and ensure that Radly Assistant is usable by healthcare
                professionals of all abilities. Our design follows WCAG 2.1 guidelines and Apple's accessibility standards.
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                Need Help?
              </h2>
              <p className="text-sm text-green-800 dark:text-green-200">
                If you encounter any accessibility issues or have suggestions for improvement, please contact us:
              </p>
              <p className="text-sm font-semibold text-green-900 dark:text-green-100 mt-2">
                <a href="mailto:support@radly.app" className="hover:underline">
                  support@radly.app
                </a>
              </p>
            </div>

            <p className="text-sm text-muted-foreground pt-6 border-t">
              Last updated: October 2025
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
