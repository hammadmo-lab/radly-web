'use client'

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

export default function HomePageRenderer(props: Props) {
  return <AnimatedHomePage {...props} />
}
