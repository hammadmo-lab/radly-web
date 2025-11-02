"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'

// Static page - no need for force-dynamic

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-muted to-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-foreground" />
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
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl">Accessibility Support</CardTitle>
            <CardDescription>
              Making Radly Assistant accessible for all users
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none text-center">
            <div className="bg-muted/50 rounded-lg p-6 mb-6">
              <p className="text-lg leading-relaxed">
                Radly Assistant supports <strong>VoiceOver</strong>, <strong>Voice Control</strong>, <strong>Larger Text</strong>, and <strong>Dark Mode</strong> on iPhone and iPad.
              </p>
            </div>

            <p className="text-lg text-muted-foreground mb-6">
              We are committed to making Radly accessible for all users.
            </p>

            <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
              <p className="text-base">
                <strong>For help, contact</strong>{' '}
                <a
                  href="mailto:support@radly.app"
                  className="text-primary hover:text-primary/80 underline font-medium"
                >
                  support@radly.app
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}