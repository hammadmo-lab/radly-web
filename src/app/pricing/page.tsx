'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { httpGet } from '@/lib/http'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface Tier {
  tier_id: number
  tier_name: string
  tier_display_name: string
  monthly_report_limit: number
  price_monthly: number
  currency: string
  features: string // JSON string from API
}

export default function PricingPage() {
  const [tiers, setTiers] = useState<Tier[]>([])
  const [region, setRegion] = useState<'egypt' | 'international'>('egypt')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Helper function to parse features JSON string
  const parseFeatures = (featuresString: string) => {
    try {
      return JSON.parse(featuresString)
    } catch (error) {
      console.error('Failed to parse features:', error)
      return {}
    }
  }

  const fetchTiers = useCallback(async () => {
    try {
      setLoading(true)
      const data = await httpGet<Tier[]>(`/v1/subscription/tiers?region=${region}`)
      setTiers(data)
    } catch (error) {
      console.error('Failed to fetch tiers:', error)
    } finally {
      setLoading(false)
    }
  }, [region])

  useEffect(() => {
    fetchTiers()
  }, [fetchTiers])

  const handleSelectPlan = (tier: Tier) => {
    if (tier.tier_name === 'free') {
      router.push('/app/dashboard')
      return
    }
    
    // Navigate to checkout/payment instructions
    router.push(`/pricing/checkout?tier=${tier.tier_name}&region=${region}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading pricing...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground">
            Professional radiology reports in under 90 seconds
          </p>

          {/* Region Selector */}
          <div className="mt-8 inline-flex rounded-lg border border-border p-1 bg-card">
            <button
              onClick={() => setRegion('egypt')}
              className={`px-6 py-2 rounded-md font-medium transition ${
                region === 'egypt'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Egypt (EGP)
            </button>
            <button
              onClick={() => setRegion('international')}
              className={`px-6 py-2 rounded-md font-medium transition ${
                region === 'international'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              International (USD)
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier) => {
            const isPopular = tier.tier_name === 'professional'
            const features = parseFeatures(tier.features)

            return (
              <Card
                key={tier.tier_id}
                className={`relative ${
                  isPopular ? 'border-primary border-2 shadow-lg' : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-2xl">
                    {tier.tier_display_name}
                  </CardTitle>
                  <CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-foreground">
                        {tier.price_monthly === 0 ? 'Free' : tier.price_monthly}
                      </span>
                      {tier.price_monthly > 0 && (
                        <span className="text-muted-foreground ml-2">
                          {tier.currency}/month
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-lg font-semibold text-foreground">
                      {tier.monthly_report_limit} reports/month
                    </div>
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        {features.templates === 'all' ? 'All 100+ templates' : 'Basic templates'}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        DOCX export
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        {features.queue_priority > 0 ? 'Priority' : 'Standard'} processing
                      </span>
                    </li>
                    {features.support && (
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">
                          {features.support === 'priority' ? 'Priority' : 'Email'} support
                        </span>
                      </li>
                    )}
                    {features.analytics && (
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">Usage analytics</span>
                      </li>
                    )}
                    {features.api_access && (
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">API access</span>
                      </li>
                    )}
                    {features.custom_templates && (
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">Custom templates</span>
                      </li>
                    )}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    onClick={() => handleSelectPlan(tier)}
                    className="w-full"
                    variant={isPopular ? 'default' : 'outline'}
                  >
                    {tier.tier_name === 'free' ? 'Get Started' : 'Subscribe Now'}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center text-muted-foreground">
          <p>All plans include clinical validators and professional DOCX export</p>
          <p className="mt-2">Reports available for 24 hours after generation</p>
        </div>
      </div>
    </div>
  )
}
