"use client"

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Brain, CheckCircle2, ClipboardList, Layers, Mic, FileText, Send, Sparkles, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { PrimaryCTA, SecondaryCTA } from "@/components/marketing/PrimaryCTA";

type WorkflowStep = {
  title: string;
  description: string;
};

type IconName = "Brain" | "Layers" | "ClipboardList";

type ValuePillar = {
  icon: IconName;
  title: string;
  description: string;
};

type ComparisonPoint = {
  radly: string;
  generic: string;
};

type Stat = {
  value: string;
  label: string;
};

type AnimatedHomePageProps = {
  workflowSteps: WorkflowStep[];
  valuePillars: ValuePillar[];
  comparisonPoints: ComparisonPoint[];
  spotlightHighlights: string[];
  stats: Stat[];
};

export function AnimatedHomePage({
  workflowSteps,
  valuePillars,
  comparisonPoints,
  spotlightHighlights,
  stats,
}: AnimatedHomePageProps) {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 sm:px-5 pb-24">
      {/* ===== HERO SECTION ===== */}
      <header className="relative pt-12 sm:pt-20 lg:pt-32 pb-16">
        <div className="relative z-20 flex flex-col items-center text-center max-w-4xl mx-auto px-4">
          <motion.span
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(245,215,145,0.35)] bg-[rgba(245,215,145,0.1)] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#F5D791] shadow-[0_0_24px_rgba(245,215,145,0.2)]"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
            </motion.div>
            Voice-supported reporting
          </motion.span>

          {/* IMPROVED HEADLINE - Clear value prop */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight"
          >
            <span className="text-[#F0E6D3]">Report drafts in half the time.</span>
            <br />
            <span className="bg-gradient-to-r from-[#F5D791] via-[#FFE8B0] to-[#F5D791] bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
              You dictate. We structure. You sign.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-6 text-lg sm:text-xl text-[#B8AFA1] max-w-2xl leading-relaxed"
          >
            Radly captures your findings by voice, structures them into professional reports, and puts sign-off in your hands, where it belongs.
          </motion.p>

          {/* Hero Image - Placed before CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="relative mt-8 mx-auto w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl overflow-hidden rounded-2xl"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 3%, black 90%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 3%, black 90%, transparent 100%)',
              boxShadow: '0 0 40px rgba(245, 215, 145, 0.4), 0 0 80px rgba(245, 215, 145, 0.3), 0 0 120px rgba(245, 215, 145, 0.2), 0 0 180px rgba(245, 215, 145, 0.1), inset 0 0 0 2px rgba(245, 215, 145, 0.35)'
            }}
          >
            {/* Glow border overlay */}
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none z-10"
              style={{
                boxShadow: 'inset 0 0 0 2px rgba(245, 215, 145, 0.4), inset 0 0 30px rgba(245, 215, 145, 0.15)',
                background: 'linear-gradient(to bottom, rgba(245, 215, 145, 0.15) 0%, transparent 25%, transparent 75%, rgba(245, 215, 145, 0.1) 100%)'
              }}
            />
            <Image
              src="/hero-background.jpg"
              alt="Radly workstation with CT scan and interface"
              width={1400}
              height={600}
              className="w-full h-auto object-cover rounded-2xl"
              style={{ filter: 'brightness(1.15)' }}
              priority
            />
            {/* Watermark overlay */}
            <span
              className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 text-[#F5D791] font-bold tracking-wider pointer-events-none select-none z-20"
              style={{
                fontSize: 'clamp(18px, 5vw, 28px)',
                opacity: 0.4,
                textShadow: '0 2px 8px rgba(0,0,0,0.6)'
              }}
              aria-hidden="true"
            >
              Radly
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <PrimaryCTA href="/auth/signin" ariaLabel="Get started for free">
              Get started free
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
            </PrimaryCTA>
            <SecondaryCTA href="/instructions" ariaLabel="See how Radly works">
              See how it works
            </SecondaryCTA>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            className="mt-8 flex items-center justify-center gap-6 text-xs sm:text-sm text-[#A89F91]"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#F5D791]" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#F5D791]" />
              5 free reports/month
            </span>
            <Link
              href="/pricing"
              className="flex items-center gap-2 hover:text-[#F5D791] transition-colors"
            >
              <Sparkles className="h-4 w-4 text-[#F5D791]" />
              See Pricing
            </Link>
          </motion.div>

          {/* App Store Links */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="mt-10 flex flex-col items-center justify-center gap-4"
          >
            <span className="text-sm font-medium text-[#F5D791] tracking-wide uppercase">📱 Get the Mobile App</span>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://apps.apple.com/app/radly-assistant/id6754604993"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-[#2A251F] to-[#1A1714] border-2 border-[#F5D791]/50 rounded-2xl hover:border-[#F5D791] hover:shadow-[0_0_20px_rgba(245,215,145,0.3)] transition-all duration-300 group"
              >
                <svg className="w-8 h-8 text-[#F5D791]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div className="flex flex-col">
                  <span className="text-xs text-[#A89F91] leading-tight">Download on the</span>
                  <span className="text-base font-bold text-[#F0E6D3] leading-tight group-hover:text-[#F5D791] transition-colors">App Store</span>
                </div>
              </a>
              <div className="flex items-center gap-3 px-6 py-3.5 bg-[#1A1714]/80 border border-[#3A332B] rounded-2xl">
                <svg className="w-8 h-8 text-[#6B6560]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.807 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 9.99l-2.302 2.302-8.634-8.634z" />
                </svg>
                <div className="flex flex-col">
                  <span className="text-xs text-[#6B6560] leading-tight">Android</span>
                  <span className="text-base font-bold text-[#8A857D] leading-tight">Coming Soon</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Ambient Background Glows - Enhanced */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-20%] left-1/4 w-[500px] h-[500px] rounded-full bg-[rgba(245,215,145,0.1)] blur-[120px]" />
          <div className="absolute top-[10%] right-1/4 w-[400px] h-[400px] rounded-full bg-[rgba(168,159,145,0.06)] blur-[100px]" />
        </div>

        {/* ===== PRODUCT PREVIEW - Replacing generic illustration ===== */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="relative mt-12 sm:mt-16 mx-auto max-w-4xl"
        >
          {/* Product Interface Mockup */}
          <div className="relative rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(26,21,16,0.9)] p-6 sm:p-8 shadow-2xl overflow-hidden">
            {/* Glow effect behind the mockup */}
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(245,215,145,0.05)] to-transparent pointer-events-none" />

            {/* Header bar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[rgba(255,255,255,0.08)]">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B6B]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFB347]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#4ECDC4]" />
              </div>
              <span className="text-xs text-[#A89F91] font-mono">Radly Assistant</span>
            </div>

            {/* Workflow visualization - Shows the 3-step process */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 relative z-10">
              {/* Step 1: Voice Capture */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.5 }}
                className="group"
              >
                <div className="rounded-xl border border-[rgba(245,215,145,0.3)] bg-[rgba(245,215,145,0.08)] p-5 text-center transition-all duration-300 group-hover:border-[rgba(245,215,145,0.5)] group-hover:bg-[rgba(245,215,145,0.12)]">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#F5D791] to-[#E5C478] flex items-center justify-center shadow-lg shadow-[rgba(245,215,145,0.3)]">
                    <Mic className="h-6 w-6 text-[#1A1510]" />
                  </div>
                  <p className="text-sm font-semibold text-[#F5D791] mb-1">1. Speak</p>
                  <p className="text-xs text-[#B8AFA1]">Dictate findings naturally</p>
                </div>
              </motion.div>

              {/* Step 2: AI Structuring */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.15, duration: 0.5 }}
                className="group"
              >
                <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] p-5 text-center transition-all duration-300 group-hover:border-[rgba(255,255,255,0.2)] group-hover:bg-[rgba(255,255,255,0.08)]">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#4ECDC4] to-[#3CBDB5] flex items-center justify-center shadow-lg shadow-[rgba(78,205,196,0.3)]">
                    <FileText className="h-6 w-6 text-[#1A1510]" />
                  </div>
                  <p className="text-sm font-semibold text-[#F0E6D3] mb-1">2. Structure</p>
                  <p className="text-xs text-[#B8AFA1]">AI formats report sections</p>
                </div>
              </motion.div>

              {/* Step 3: Export */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.5 }}
                className="group"
              >
                <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] p-5 text-center transition-all duration-300 group-hover:border-[rgba(255,255,255,0.2)] group-hover:bg-[rgba(255,255,255,0.08)]">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#B8AFA1] to-[#9C9488] flex items-center justify-center shadow-lg shadow-[rgba(184,175,161,0.3)]">
                    <Send className="h-6 w-6 text-[#1A1510]" />
                  </div>
                  <p className="text-sm font-semibold text-[#F0E6D3] mb-1">3. Export</p>
                  <p className="text-xs text-[#B8AFA1]">Copy, paste, done</p>
                </div>
              </motion.div>
            </div>

            {/* Sample report preview */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.6 }}
              className="mt-6 p-4 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.05)] font-mono text-xs"
            >
              <div className="text-[#F5D791] mb-2">IMPRESSION</div>
              <div className="text-[#B8AFA1] leading-relaxed">
                1. No acute intracranial abnormality.<br />
                2. Mild age-related involutional changes.<br />
                <span className="text-[#4ECDC4]">▌</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </header>

      {/* ===== STATS SECTION - Cleaned up, no repetitive links ===== */}
      <section className="mt-8 sm:mt-12 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3 px-4 sm:px-0">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: index * 0.15, duration: 0.5 }}
            className="aurora-card border border-[rgba(255,255,255,0.15)] p-6 text-center relative overflow-hidden bg-[rgba(26,21,16,0.6)]"
          >
            <div className="relative z-10">
              <motion.p
                initial={{ scale: 0.5 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 + 0.2, type: "spring", stiffness: 200 }}
                className="text-2xl sm:text-3xl font-semibold bg-gradient-to-r from-[#F5D791] to-[#E5C478] bg-clip-text text-transparent"
              >
                {stat.value}
              </motion.p>
              <p className="mt-2 text-xs uppercase tracking-[0.28em] text-[rgba(168,159,145,0.7)]">
                {stat.label}
              </p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* ===== VALUE PILLARS - Same great content, cleaner cards ===== */}
      <section className="mt-16 sm:mt-20 space-y-8 sm:space-y-10 px-4 sm:px-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#F0E6D3]"
            style={{
              textShadow: '0 0 30px rgba(245, 215, 145, 0.3), 0 0 60px rgba(168, 159, 145, 0.2)'
            }}
          >
            Built for radiology workflows
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#B8AFA1] max-w-3xl mx-auto">
            Purpose-built to keep language consistent, findings structured, and clinicians in control.
          </p>
        </motion.div>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {valuePillars.map((pillar, index) => {
            const Icon = pillar.icon === "Brain" ? Brain : pillar.icon === "Layers" ? Layers : ClipboardList;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="aurora-card border border-[rgba(255,255,255,0.15)] p-6 relative overflow-hidden bg-[rgba(26,21,16,0.6)]"
              >
                <div className="relative z-10">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(245,215,145,0.3)] bg-[rgba(26,21,16,0.8)] text-[#F5D791] shadow-[0_0_20px_rgba(245,215,145,0.2)]">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3
                    className="text-lg font-semibold text-white"
                    style={{
                      textShadow: '0 0 20px rgba(245, 215, 145, 0.3)'
                    }}
                  >
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#B8AFA1]">{pillar.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ===== WORKFLOW SECTION - TIMELINE LAYOUT (Breaking the grid monotony) ===== */}
      <section className="mt-16 sm:mt-24 space-y-6 sm:space-y-8 px-4 sm:px-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#F0E6D3]"
            style={{
              textShadow: '0 0 30px rgba(245, 215, 145, 0.3), 0 0 60px rgba(168, 159, 145, 0.2)'
            }}
          >
            How Radly fits your workflow
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#B8AFA1] max-w-3xl mx-auto">
            Three steps from findings to export - you stay in command at every stage.
          </p>
        </motion.div>

        {/* Timeline Layout */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-8 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[rgba(245,215,145,0.4)] via-[rgba(245,215,145,0.2)] to-transparent hidden sm:block" />

          <div className="space-y-6 sm:space-y-0">
            {workflowSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                className={`relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 ${index % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'
                  }`}
              >
                {/* Step Number - Centered on timeline */}
                <div className="sm:absolute sm:left-1/2 sm:-translate-x-1/2 flex-shrink-0 z-10">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F5D791] to-[#E5C478] flex items-center justify-center text-2xl font-bold text-[#1A1510] shadow-lg shadow-[rgba(245,215,145,0.3)]">
                    {index + 1}
                  </div>
                </div>

                {/* Content Card */}
                <div className={`flex-1 sm:w-[calc(50%-4rem)] ${index % 2 === 0 ? 'sm:pr-16' : 'sm:pl-16'}`}>
                  <div className="aurora-card border border-[rgba(255,255,255,0.15)] p-6 bg-[rgba(26,21,16,0.6)]">
                    <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-[#B8AFA1] leading-relaxed">{step.description}</p>
                  </div>
                </div>

                {/* Spacer for alternating layout */}
                <div className="hidden sm:block flex-1 sm:w-[calc(50%-4rem)]" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COMPARISON SECTION - Split screen layout ===== */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-16 sm:mt-24 rounded-[32px] sm:rounded-[44px] border border-[rgba(255,255,255,0.15)] bg-[rgba(26,21,16,0.7)] p-6 sm:p-8 lg:p-10 mx-4 sm:mx-0 relative overflow-hidden"
      >
        <motion.div
          className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[rgba(245,215,145,0.1)] to-transparent blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl lg:text-[2.4rem] font-semibold text-[#F0E6D3]">Radly vs generic AI tools</h2>
          <p className="mt-3 text-sm sm:text-base text-[#B8AFA1]">
            Purpose-built safeguards keep terminology precise and responsibility with the radiologist.
          </p>

          {/* Side by side comparison - larger cards */}
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {/* Radly Column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="rounded-2xl border border-[rgba(245,215,145,0.4)] bg-[rgba(245,215,145,0.1)] p-6 relative overflow-hidden"
            >
              <div className="relative z-10">
                <h3 className="text-xl font-semibold text-[#F5D791] flex items-center gap-2 mb-6">
                  <Sparkles className="h-5 w-5" />
                  Radly Assistant
                </h3>
                <ul className="space-y-4">
                  {comparisonPoints.map((point, idx) => (
                    <li key={`radly-${idx}`} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#4ECDC4] flex-shrink-0" aria-hidden />
                      <span className="text-[#F0E6D3] text-sm leading-relaxed">{point.radly}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Generic AI Column */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(26,21,16,0.55)] p-6"
            >
              <h3 className="text-xl font-semibold text-[#7A7571] mb-6">Generic AI</h3>
              <ul className="space-y-4">
                {comparisonPoints.map((point, idx) => (
                  <li key={`generic-${idx}`} className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[rgba(255,255,255,0.2)] flex-shrink-0" aria-hidden />
                    <span className="text-[#7A7571] text-sm leading-relaxed">{point.generic}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ===== CONSOLIDATED CLINICAL RIGOR SECTION ===== */}
      <section className="mt-16 sm:mt-24 px-4 sm:px-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-[rgba(245,215,145,0.25)] bg-[rgba(26,21,16,0.6)] p-6 sm:p-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-6">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[rgba(78,205,196,0.2)] to-[rgba(78,205,196,0.05)] border border-[rgba(78,205,196,0.3)]">
              <Shield className="h-7 w-7 text-[#4ECDC4]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-[#F0E6D3]">Clinical Rigor & Validation</h2>
              <p className="text-sm text-[#B8AFA1] mt-1">Transparent methods, measurable outcomes</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {spotlightHighlights.map((highlight, index) => (
              <motion.div
                key={highlight}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="p-4 rounded-lg bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.06)]"
              >
                <p className="text-sm text-[#B8AFA1]">{highlight}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-6 pt-6 border-t border-[rgba(255,255,255,0.08)]"
          >
            <Link
              href="/validation"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#4ECDC4] hover:text-[#6FD9D0] transition-colors"
            >
              View full methodology & validation details
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ===== FINAL CTA SECTION ===== */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-16 sm:mt-24 rounded-[32px] sm:rounded-[44px] border border-[rgba(255,255,255,0.15)] bg-[rgba(26,21,16,0.75)] p-8 sm:p-10 text-center mx-4 sm:mx-0 relative overflow-hidden"
      >
        <motion.div
          className="absolute top-0 left-1/4 w-48 h-48 rounded-full bg-[rgba(245,215,145,0.12)] blur-3xl"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-56 h-56 rounded-full bg-[rgba(168,159,145,0.08)] blur-3xl"
          animate={{
            y: [0, 20, 0],
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />

        <div className="relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-2xl sm:text-3xl lg:text-[2.4rem] font-semibold text-[#F0E6D3]"
            style={{
              textShadow: '0 0 40px rgba(245, 215, 145, 0.4), 0 0 80px rgba(168, 159, 145, 0.3)'
            }}
          >
            Ready to draft smarter?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-4 text-sm text-[#B8AFA1] sm:text-base max-w-2xl mx-auto"
          >
            Start with five complimentary reports. No credit card, no commitment.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto px-4 sm:px-0"
          >
            <PrimaryCTA href="/auth/signin" ariaLabel="Get started for free">
              Get started free
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
            </PrimaryCTA>
            <SecondaryCTA href="/instructions" ariaLabel="See how Radly works">
              See how it works
            </SecondaryCTA>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs"
          >
            <Link href="/security" className="inline-flex items-center gap-1 text-[#4ECDC4] underline-offset-4 hover:underline transition-colors">
              Security & compliance
              <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
            <span className="hidden sm:inline text-[rgba(207,207,207,0.3)]">•</span>
            <Link href="/validation" className="inline-flex items-center gap-1 text-[#F5D791] underline-offset-4 hover:underline transition-colors">
              View validation
              <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </main>
  );
}
