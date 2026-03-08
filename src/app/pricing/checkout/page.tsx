'use client'

import { useEffect, useState, Suspense, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Copy, Check, ArrowLeft, Mail } from 'lucide-react'
import Link from 'next/link'
import { httpGet } from '@/lib/http'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MobileAppPricingRedirect } from '@/components/pricing/MobileAppPricingRedirect'

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

  const isEgypt = region === 'egypt'

  return (
    <div className="min-h-screen bg-background py-12 px-4" dir={isEgypt ? 'rtl' : 'ltr'}>
      {/* Redirect mobile app users */}
      <MobileAppPricingRedirect />

      <div className="max-w-3xl mx-auto">
        <Link
          href="/pricing"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className={`w-4 h-4 ${isEgypt ? 'ml-2 rotate-180' : 'mr-2'}`} />
          {isEgypt ? 'العودة إلى الأسعار' : 'Back to pricing'}
        </Link>

        <Card>
          <CardHeader className="text-center border-b">
            <CardTitle className="text-3xl mb-2">
              {isEgypt ? `الاشتراك في ${tierInfo.tier_display_name}` : `Subscribe to ${tierInfo.tier_display_name}`}
            </CardTitle>
            <div className="space-y-2 text-sm text-muted-foreground">
              <span className="block text-2xl font-semibold text-foreground">
                {isEgypt
                  ? `${tierInfo.price_monthly} جنيه مصري/شهرياً`
                  : `${tierInfo.price_monthly} ${tierInfo.currency}/month`}
              </span>
              <span className="block">
                {isEgypt
                  ? `${tierInfo.monthly_report_limit} تقرير شهرياً`
                  : `${tierInfo.monthly_report_limit} reports per month`}
              </span>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {isEgypt ? (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground">
                  تعليمات الدفع
                </h2>

                {/* Instapay Transfer */}
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">تحويل عبر إنستاباي</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      اضغط على الرابط أدناه لإرسال الدفع عبر إنستاباي:
                    </p>

                    <div className="flex flex-col items-center gap-3">
                      <a
                        href="https://ipn.eg/S/hammadmo/instapay/22LGQ0"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full"
                      >
                        <Button size="lg" className="w-full text-base">
                          ادفع عبر إنستاباي
                        </Button>
                      </a>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground">المبلغ</label>
                      <div className="flex items-center justify-between bg-background rounded-md px-3 py-2 border mt-1">
                        <span className="font-medium text-lg">{tierInfo.price_monthly} جنيه مصري</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(tierInfo.price_monthly.toString())}
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-4">
                      <p className="text-sm text-blue-900">
                        <span className="font-semibold">💡 مهم:</span> بعد إتمام التحويل، يرجى أخذ لقطة شاشة لتأكيد المعاملة.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* After Payment Instructions */}
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      بعد الدفع
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground mb-4">
                      أرسل لقطة شاشة الدفع أو مرجع المعاملة إلى:
                    </p>
                    <a
                      href={`mailto:billing@radly.app?subject=Payment for ${tierInfo.tier_display_name} Plan`}
                      className="inline-block"
                    >
                      <Button size="lg" className="w-full sm:w-auto" dir="ltr">
                        <Mail className="w-4 h-4 mr-2" />
                        billing@radly.app
                      </Button>
                    </a>
                    <p className="text-sm text-muted-foreground mt-4">
                      سيتم تفعيل اشتراكك خلال ٢٤ ساعة وسنرسل لك بريد تأكيد.
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
