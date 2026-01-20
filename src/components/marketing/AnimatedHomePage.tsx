"use client"

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Brain, CheckCircle2, ClipboardList, Layers, Sparkles, Zap } from "lucide-react";
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
      <header className="relative pt-12 sm:pt-20 lg:pt-32 pb-20">
        <div className="relative z-20 flex flex-col items-center text-center max-w-4xl mx-auto px-4">
          <motion.span
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(212,180,131,0.3)] bg-[rgba(212,180,131,0.08)] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#D4B483] shadow-[0_0_20px_rgba(212,180,131,0.15)]"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
            </motion.div>
            Voice-supported reporting
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight"
          >
            <span className="text-[#E8DCC8]">Draft reports faster</span>
            <br />
            <span className="bg-gradient-to-r from-[#D4B483] via-[#E8DCC8] to-[#D4B483] bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
              without losing control
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-6 text-lg sm:text-xl text-[#A89F91] max-w-2xl leading-relaxed"
          >
            Radly combines voice capture and structured templates so you can move from findings to sign-off efficiently. The assistant supports your clinical judgement—it never replaces it.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <PrimaryCTA href="/auth/signin" ariaLabel="Get started for free">
              Get started free
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
            </PrimaryCTA>
            <SecondaryCTA href="/app/templates" ariaLabel="See available templates">
              See templates
            </SecondaryCTA>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            className="mt-8 flex items-center justify-center gap-6 text-xs sm:text-sm text-[#A89F91]"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#D4B483]" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#D4B483]" />
              5 free reports/day
            </span>
          </motion.div>
        </div>

        {/* Ambient Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-20%] left-1/4 w-[500px] h-[500px] rounded-full bg-[rgba(212,180,131,0.08)] blur-[120px]" />
          <div className="absolute top-[10%] right-1/4 w-[400px] h-[400px] rounded-full bg-[rgba(168,159,145,0.05)] blur-[100px]" />
        </div>

        {/* Hero Image - Placed below text with gradient fade */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="relative mt-12 sm:mt-16 mx-auto max-w-4xl overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 75%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 75%, transparent 100%)'
          }}
        >
          <Image
            src="/hero-background.jpg"
            alt="Radiology professional"
            width={1200}
            height={800}
            className="w-full h-auto object-cover border-t border-[rgba(255,255,255,0.05)]"
            priority
          />
        </motion.div>
      </header>

      <section className="mt-12 sm:mt-16 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3 px-4 sm:px-0">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: index * 0.15, duration: 0.5 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="aurora-card border border-[rgba(255,255,255,0.15)] p-6 text-center relative overflow-hidden group bg-[rgba(26,21,16,0.6)]"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-[rgba(212,180,131,0.1)] to-[rgba(168,159,145,0.1)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
            <div className="relative z-10">
              <motion.p
                initial={{ scale: 0.5 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 + 0.2, type: "spring", stiffness: 200 }}
                className="text-2xl sm:text-3xl font-semibold bg-gradient-to-r from-[#D4B483] to-[#B89666] bg-clip-text text-transparent"
              >
                {stat.value}
              </motion.p>
              <p className="mt-2 text-xs uppercase tracking-[0.28em] text-[rgba(168,159,145,0.7)]">
                {stat.label}
              </p>
              <Link
                href="/validation"
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[rgba(212,180,131,0.9)] underline-offset-4 hover:underline transition-all hover:gap-2"
              >
                Methods
                <ArrowRight className="h-3 w-3" aria-hidden />
              </Link>
            </div>
          </motion.div>
        ))}
      </section>

      <section className="mt-16 sm:mt-20 space-y-8 sm:space-y-10 px-4 sm:px-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-semibold"
            style={{
              textShadow: '0 0 30px rgba(212, 180, 131, 0.3), 0 0 60px rgba(168, 159, 145, 0.2)'
            }}
          >
            Assistant-first advantages
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[rgba(232,220,200,0.8)] max-w-3xl mx-auto">
            Built with radiology teams to keep language consistent, findings structured, and clinicians in control.
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
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="aurora-card border border-[rgba(255,255,255,0.15)] p-6 relative overflow-hidden group bg-[rgba(26,21,16,0.6)]"
              >
                <motion.div
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-[rgba(212,180,131,0.15)] to-[rgba(168,159,145,0.1)] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
                <div className="relative z-10">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(212,180,131,0.3)] bg-[rgba(26,21,16,0.8)] text-[#D4B483] shadow-[0_0_20px_rgba(212,180,131,0.2)]"
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </motion.div>
                  <h3
                    className="text-lg font-semibold text-white"
                    style={{
                      textShadow: '0 0 20px rgba(212, 180, 131, 0.3)'
                    }}
                  >
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-sm text-[rgba(232,220,200,0.8)]">{pillar.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mt-16 sm:mt-24 space-y-6 sm:space-y-8 px-4 sm:px-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-semibold"
            style={{
              textShadow: '0 0 30px rgba(212, 180, 131, 0.3), 0 0 60px rgba(168, 159, 145, 0.2)'
            }}
          >
            How Radly fits your workflow
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[rgba(207,207,207,0.72)] max-w-3xl mx-auto">
            Three steps from capturing findings to exporting—in each case, the radiologist keeps final sign-off.
          </p>
        </motion.div>
        <ol className="space-y-4">
          {workflowSteps.map((step, index) => (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              whileHover={{ x: 8, transition: { duration: 0.2 } }}
              className="aurora-card flex gap-4 border border-[rgba(255,255,255,0.15)] p-6 relative overflow-hidden group bg-[rgba(26,21,16,0.6)]"
            >
              <motion.div
                className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#D4B483] to-[#A89F91] scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top"
              />
              <div className="relative z-10 flex gap-4 w-full">
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="mt-1 flex h-10 w-10 min-w-[40px] items-center justify-center rounded-full border border-[rgba(212,180,131,0.3)] bg-[rgba(26,21,16,0.8)] text-sm font-semibold text-[#D4B483] shadow-[0_0_15px_rgba(212,180,131,0.2)]"
                >
                  {index + 1}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm text-[rgba(207,207,207,0.72)]">{step.description}</p>
                </div>
              </div>
            </motion.li>
          ))}
        </ol>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(26,21,16,0.6)] p-6 text-sm text-[rgba(207,207,207,0.72)] backdrop-blur-sm"
        >
          <Zap className="inline-block h-4 w-4 mr-2 text-[#D4B483]" />
          Prefer keyboard only? Use the tab order to move through template fields, press Enter to trigger actions, and opt for manual text entry whenever a microphone is unavailable.
        </motion.div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-16 sm:mt-24 rounded-[32px] sm:rounded-[44px] border border-[rgba(255,255,255,0.15)] bg-[rgba(26,21,16,0.7)] p-6 sm:p-8 lg:p-10 mx-4 sm:mx-0 relative overflow-hidden"
      >
        <motion.div
          className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[rgba(212,180,131,0.08)] to-transparent blur-3xl"
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
          <h2 className="text-2xl sm:text-3xl lg:text-[2.4rem] font-semibold">Radly vs generic AI tools</h2>
          <p className="mt-3 text-sm sm:text-base text-[rgba(207,207,207,0.72)]">
            Purpose-built safeguards keep terminology precise and responsibility with the radiologist.
          </p>
          <div className="mt-6 sm:mt-8 grid gap-4 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className="rounded-2xl border border-[rgba(212,180,131,0.4)] bg-[rgba(212,180,131,0.1)] p-6 relative overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-[rgba(212,180,131,0.15)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              <div className="relative z-10">
                <h3 className="text-lg font-semibold text-[#E8DCC8] flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#D4B483]" />
                  Radly Assistant
                </h3>
                <ul className="mt-4 space-y-3 text-sm text-[rgba(232,220,200,0.9)]">
                  {comparisonPoints.map((point, idx) => (
                    <motion.li
                      key={`radly-${idx}`}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + idx * 0.1, duration: 0.4 }}
                      className="flex items-start gap-2"
                    >
                      <CheckCircle2 className="mt-1 h-4 w-4 text-[#D4B483] flex-shrink-0" aria-hidden />
                      <span>{point.radly}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(26,21,16,0.55)] p-6"
            >
              <h3 className="text-lg font-semibold text-[rgba(207,207,207,0.78)]">Generic AI</h3>
              <ul className="mt-4 space-y-3 text-sm text-[rgba(207,207,207,0.7)]">
                {comparisonPoints.map((point, idx) => (
                  <motion.li
                    key={`generic-${idx}`}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + idx * 0.1, duration: 0.4 }}
                    className="flex items-start gap-2"
                  >
                    <span className="mt-2 h-2 w-2 rounded-full bg-[rgba(207,207,207,0.3)] flex-shrink-0" aria-hidden />
                    <span>{point.generic}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <section className="mt-16 sm:mt-24 space-y-6 sm:space-y-8 px-4 sm:px-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-semibold"
            style={{
              textShadow: '0 0 30px rgba(212, 180, 131, 0.4), 0 0 60px rgba(168, 159, 145, 0.2)'
            }}
          >
            What teams notice first
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[rgba(207,207,207,0.72)] max-w-3xl mx-auto">
            Highlights from internal pilots across academic and private practices.
          </p>
        </motion.div>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
          {spotlightHighlights.map((highlight, index) => (
            <motion.div
              key={highlight}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="aurora-card border border-[rgba(255,255,255,0.15)] p-6 text-sm text-[rgba(232,220,200,0.8)] relative overflow-hidden group bg-[rgba(26,21,16,0.6)]"
            >
              <motion.div
                className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-[rgba(212,180,131,0.1)] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
              <div className="relative z-10">
                {highlight} <Link href="/validation" className="ml-2 text-[#D4B483] underline-offset-4 hover:underline transition-all hover:text-[#E8DCC8]">Validation</Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-16 sm:mt-24 rounded-[32px] sm:rounded-[44px] border border-[rgba(255,255,255,0.15)] bg-[rgba(26,21,16,0.75)] p-8 sm:p-10 text-center mx-4 sm:mx-0 relative overflow-hidden"
      >
        <motion.div
          className="absolute top-0 left-1/4 w-48 h-48 rounded-full bg-[rgba(212,180,131,0.1)] blur-3xl"
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
            className="text-2xl sm:text-3xl lg:text-[2.4rem] font-semibold"
            style={{
              textShadow: '0 0 40px rgba(212, 180, 131, 0.5), 0 0 80px rgba(168, 159, 145, 0.3)'
            }}
          >
            Bring Radly into your next reporting session
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-4 text-sm text-[rgba(232,220,200,0.8)] sm:text-base max-w-2xl mx-auto"
          >
            Start with five complimentary reports. Radly assists, radiologists review and finalise every case.
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
              See instructions
            </SecondaryCTA>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-4 text-xs uppercase tracking-[0.24em] text-[rgba(168,159,145,0.6)]"
          >
            Includes keyboard-only path • No commitment
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs"
          >
            <Link href="/security" className="inline-flex items-center gap-1 text-[rgba(111,231,183,0.85)] underline-offset-4 hover:underline transition-colors">
              Security & compliance
              <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
            <span className="hidden sm:inline text-[rgba(207,207,207,0.3)]">•</span>
            <Link href="/validation" className="inline-flex items-center gap-1 text-[rgba(212,180,131,0.85)] underline-offset-4 hover:underline transition-colors">
              View validation
              <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </main>
  );
}
