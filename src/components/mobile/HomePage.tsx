'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Zap, Brain, Layers } from 'lucide-react'
import { motion } from 'framer-motion'

/**
 * Mobile Homepage Component
 *
 * Compact mobile-optimized homepage with:
 * - Hero section (1 screen max)
 * - Key features (3 cards, scrollable)
 * - Quick action buttons
 * - NO marketing copy, comparisons, or testimonials
 * - Touch-friendly design
 * - Maximum 2-3 screens of content
 *
 * This is what mobile app users see on first launch.
 * Web users see the full AnimatedHomePage instead.
 */
export function MobileHomePage() {
  const features = [
    {
      icon: Zap,
      title: 'Fast drafting',
      description: 'Get structured reports in under 2 minutes',
    },
    {
      icon: Brain,
      title: 'Clinical nuance',
      description: 'Built for radiology terminology',
    },
    {
      icon: Layers,
      title: 'Structured output',
      description: 'Ready for PACS and templates',
    },
  ]

  return (
    <div className="bg-[var(--ds-bg-gradient)] text-white min-h-screen">
      {/* Hero Section - 1 screen max */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center justify-center px-6 py-16 text-center min-h-screen"
      >
        {/* Brand Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <Image
            src="/brand/Radly.png"
            alt="Radly"
            width={280}
            height={93}
            priority
            className="h-auto w-auto max-w-[280px]"
          />
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-4xl sm:text-5xl font-bold mb-4 leading-tight bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent"
        >
          Draft Reports
          <br />
          in Seconds
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-lg sm:text-xl text-white/80 mb-12 max-w-sm leading-relaxed"
        >
          AI assistant for radiology reports, designed for clinicians
        </motion.p>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="w-full max-w-xs space-y-4"
        >
          <Link
            href="/app/dashboard"
            className="relative flex items-center justify-center w-full px-8 py-4 bg-gradient-to-r from-[#2653FF] to-[#4B8EFF] hover:from-[#4B8EFF] hover:to-[#2653FF] text-white font-semibold rounded-2xl transition-all duration-300 touch-manipulation min-h-[52px] shadow-[0_8px_24px_rgba(38,83,255,0.35)] hover:shadow-[0_12px_32px_rgba(38,83,255,0.5)] hover:scale-105 active:scale-95"
          >
            <span className="text-center">Get Started</span>
            <ArrowRight className="w-5 h-5 absolute right-6" />
          </Link>

          {/* Secondary CTA */}
          <p className="text-sm text-white/60 text-center">
            5 free reports • No credit card needed
          </p>
        </motion.div>
      </motion.div>

      {/* Features Section - Scrollable cards */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        className="px-6 py-12"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Why Radly</h2>

        <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 1.1 + index * 0.1 }}
                className="bg-[rgba(255,255,255,0.04)] backdrop-blur-sm border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 hover:bg-[rgba(255,255,255,0.06)] hover:border-[rgba(75,142,255,0.3)] transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2653FF]/20 to-[#8F82FF]/20 flex items-center justify-center border border-[rgba(75,142,255,0.2)]">
                      <Icon className="w-6 h-6 text-[#4B8EFF]" strokeWidth={2} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-2 text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-white/70 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.4 }}
        className="px-6 py-8 pb-32 max-w-md mx-auto"
      >
        <h3 className="text-lg font-semibold mb-4 text-center text-white/80">Quick Actions</h3>

        <div className="space-y-3">
          <Link
            href="/app/generate"
            className="block w-full px-6 py-4 bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)] active:bg-[rgba(255,255,255,0.08)] text-white font-semibold rounded-2xl transition-all duration-200 text-center touch-manipulation min-h-[52px] flex items-center justify-center border border-[rgba(255,255,255,0.12)] hover:border-[rgba(75,142,255,0.4)] hover:shadow-[0_4px_16px_rgba(75,142,255,0.2)]"
          >
            Create New Report
          </Link>

          <Link
            href="/app/reports"
            className="block w-full px-6 py-4 bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)] active:bg-[rgba(255,255,255,0.08)] text-white font-semibold rounded-2xl transition-all duration-200 text-center touch-manipulation min-h-[52px] flex items-center justify-center border border-[rgba(255,255,255,0.12)] hover:border-[rgba(75,142,255,0.4)] hover:shadow-[0_4px_16px_rgba(75,142,255,0.2)]"
          >
            View My Reports
          </Link>

          <Link
            href="/app/settings"
            className="block w-full px-6 py-4 bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)] active:bg-[rgba(255,255,255,0.08)] text-white font-semibold rounded-2xl transition-all duration-200 text-center touch-manipulation min-h-[52px] flex items-center justify-center border border-[rgba(255,255,255,0.12)] hover:border-[rgba(75,142,255,0.4)] hover:shadow-[0_4px_16px_rgba(75,142,255,0.2)]"
          >
            Settings
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
