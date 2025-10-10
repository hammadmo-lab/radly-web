"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getSupabaseClient } from '@/lib/supabase'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { FileText, CheckCircle } from 'lucide-react'

export default function TermsPage() {
  const [termsContent, setTermsContent] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Fetch terms content
    fetch('/content/terms.md')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        return response.text()
      })
      .then(content => setTermsContent(content))
      .catch(error => {
        console.error('Error loading terms:', error)
        setTermsContent(`# Terms of Use
Last updated: 2025-01-08

By using Radly you agree to the Terms of Use. (Full text to be inserted.)

This is a placeholder. Please contact support if you need the complete terms.`)
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

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          accepted_terms_at: new Date().toISOString(),
        })

      if (error) throw error

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
