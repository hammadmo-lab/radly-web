'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PricingRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect mobile users to dashboard
    router.replace('/app/dashboard')
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center flex-col gap-4 p-4 text-center">
      <h1 className="text-2xl font-bold">Subscription Management</h1>
      <p className="text-muted-foreground max-w-md">
        Please manage your subscription through the App Store or Play Store.
      </p>
      <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
    </div>
  )
}
