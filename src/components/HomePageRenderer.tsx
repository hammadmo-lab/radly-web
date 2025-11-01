'use client'

import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { AnimatedHomePage } from "@/components/marketing/AnimatedHomePage";
import { MobileHomePage } from "@/components/mobile/HomePage";
import { usePlatform } from "@/hooks/usePlatform";

interface HomePageRendererProps {
  workflowSteps: Array<{ title: string; description: string }>;
  valuePillars: Array<{ icon: "Brain" | "Layers" | "ClipboardList"; title: string; description: string }>;
  comparisonPoints: Array<{ radly: string; generic: string }>;
  spotlightHighlights: string[];
  stats: Array<{ value: string; label: string }>;
}

/**
 * HomePageRenderer
 *
 * Client-side component that conditionally renders:
 * - Mobile homepage (compact, 2-3 screens)
 * - Web homepage (full marketing experience)
 */
export function HomePageRenderer({
  workflowSteps,
  valuePillars,
  comparisonPoints,
  spotlightHighlights,
  stats,
}: HomePageRendererProps) {
  const { isNative, isReady } = usePlatform()

  // Prevent hydration mismatch by waiting for client-side platform detection
  if (!isReady) {
    return null
  }

  return (
    <>
      {/* Mobile: Compact 2-3 screen experience */}
      {isNative ? (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'scroll',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <MobileHomePage />
        </div>
      ) : (
        /* Web: Full marketing experience */
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'scroll',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <AnimatedHomePage
            workflowSteps={workflowSteps}
            valuePillars={valuePillars}
            comparisonPoints={comparisonPoints}
            spotlightHighlights={spotlightHighlights}
            stats={stats}
          />
          <MarketingFooter />
        </div>
      )}
    </>
  )
}
