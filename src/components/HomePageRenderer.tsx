'use client'

import { useEffect, useState } from 'react'
import { MobileHomePage } from '@/components/mobile/HomePage'
import { AnimatedHomePage } from '@/components/marketing/AnimatedHomePage'

type WorkflowStep = { title: string; description: string }
type IconName = 'Brain' | 'Layers' | 'ClipboardList'
type ValuePillar = { icon: IconName; title: string; description: string }
type ComparisonPoint = { radly: string; generic: string }
type Stat = { value: string; label: string }

type Props = {
  workflowSteps: WorkflowStep[]
  valuePillars: ValuePillar[]
  comparisonPoints: ComparisonPoint[]
  spotlightHighlights: string[]
  stats: Stat[]
}

type CapLike = {
  Capacitor?: {
    isNativePlatform?: () => boolean
    getPlatform?: () => string
  }
}

export default function HomePageRenderer(props: Props) {
  const [isNative, setIsNative] = useState(false)
  useEffect(() => {
    const w = (typeof window !== 'undefined' ? (window as unknown as CapLike) : undefined)
    const isCap = !!w?.Capacitor?.isNativePlatform?.()
    setIsNative(isCap)
  }, [])

  if (isNative) return <MobileHomePage />
  return <AnimatedHomePage {...props} />
}
