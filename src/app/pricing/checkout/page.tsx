'use client'

import { useEffect, useState, Suspense, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Copy, Check, ArrowLeft, Mail } from 'lucide-react'
import Link from 'next/link'
import { httpGet } from '@/lib/http'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Tier {
  tier_id: number
  tier_name: string
  tier_display_name: string
  monthly_report_limit: number
  price_monthly: number
  currency: string
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tier = searchParams.get('tier')
  const region = searchParams.get('region')
  
  const [copied, setCopied] = useState(false)
  const [tierInfo, setTierInfo] = useState<Tier | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchTierInfo = useCallback(async () => {
    try {
      setLoading(true)
      const tiers = await httpGet<Tier[]>(`/v1/subscription/tiers?region=${region}`)
      const selected = tiers.find((t) => t.tier_name === tier)
      
      if (!selected) {
        router.push('/pricing')
        return
      }
      
      setTierInfo(selected)
    } catch (error) {
      console.error('Failed to fetch tier:', error)
      router.push('/pricing')
    } finally {
      setLoading(false)
    }
  }, [tier, region, router])

  useEffect(() => {
    if (!tier || !region) {
      router.push('/pricing')
      return
    }
    fetchTierInfo()
  }, [tier, region, router, fetchTierInfo])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading || !tierInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/pricing"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to pricing
        </Link>

        <Card>
          <CardHeader className="text-center border-b">
            <CardTitle className="text-3xl mb-2">
              Subscribe to {tierInfo.tier_display_name}
            </CardTitle>
            <CardDescription>
              <span className="text-2xl font-semibold text-foreground">
                {tierInfo.price_monthly} {tierInfo.currency}/month
              </span>
              <div className="text-muted-foreground mt-2">
                {tierInfo.monthly_report_limit} reports per month
              </div>
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {region === 'egypt' ? (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Payment Instructions
                </h2>

                {/* Bank Transfer */}
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Option 1: Bank Transfer</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Bank Name</label>
                      <div className="flex items-center justify-between bg-background rounded-md px-3 py-2 border mt-1">
                        <span className="font-medium">Banque Misr</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard('Banque Misr')}
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground">Account Number</label>
                      <div className="flex items-center justify-between bg-background rounded-md px-3 py-2 border mt-1">
                        <span className="font-medium font-mono">1234567890123456</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard('1234567890123456')}
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground">Amount</label>
                      <div className="flex items-center justify-between bg-background rounded-md px-3 py-2 border mt-1">
                        <span className="font-medium text-lg">{tierInfo.price_monthly} EGP</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(tierInfo.price_monthly.toString())}
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground">Reference</label>
                      <div className="bg-background rounded-md px-3 py-2 border mt-1">
                        <span className="font-medium">Your email address</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Please include your registered email in the transfer reference
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Fawry */}
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Option 2: Fawry</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Visit any Fawry location and use this payment code:
                    </p>
                    <div className="flex items-center justify-between bg-background rounded-md px-4 py-3 border">
                      <span className="text-2xl font-bold text-primary">12345678</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard('12345678')}
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      Amount to pay: <span className="font-semibold">{tierInfo.price_monthly} EGP</span>
                    </p>
                  </CardContent>
                </Card>

                {/* After Payment Instructions */}
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      After Payment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground mb-4">
                      Email your payment screenshot or transaction reference to:
                    </p>
                    <a
                      href={`mailto:billing@radly.app?subject=Payment for ${tierInfo.tier_display_name} Plan`}
                      className="inline-block"
                    >
                      <Button size="lg" className="w-full sm:w-auto">
                        <Mail className="w-4 h-4 mr-2" />
                        billing@radly.app
                      </Button>
                    </a>
                    <p className="text-sm text-muted-foreground mt-4">
                      We&apos;ll activate your subscription within 24 hours and send you a confirmation email.
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              // International users
              <div className="text-center py-8">
                <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">International Payments</h3>
                <p className="text-muted-foreground mb-6">
                  International payment processing is coming soon! 
                  <br />
                  Please contact us to set up your subscription.
                </p>
                <a
                  href={`mailto:billing@radly.app?subject=International Subscription - ${tierInfo.tier_display_name}`}
                >
                  <Button size="lg">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Us
                  </Button>
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
