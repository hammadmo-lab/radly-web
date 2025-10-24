"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  CheckCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowLeft,
  Mic,
  Brain,
  Radio
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { InteractiveDemo } from "@/components/features/InteractiveDemo";

export const dynamic = 'force-dynamic';

interface JourneyStep {
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  duration: string;
  ctaLabel?: string;
  ctaAction?: () => void;
}

interface VoiceStat {
  label: string;
  value: string;
  caption: string;
  accent: string;
}

interface ProTip {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
}

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.14)] bg-[rgba(10,14,28,0.72)] backdrop-blur-xl transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-6 py-5 text-left text-[rgba(207,207,207,0.9)] transition-colors hover:bg-[rgba(75,142,255,0.08)]"
      >
        <span className="pr-6 text-base font-semibold leading-snug text-white">{question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 flex-shrink-0 text-[rgba(143,130,255,0.8)]" />
        ) : (
          <ChevronDown className="h-5 w-5 flex-shrink-0 text-[rgba(143,130,255,0.5)]" />
        )}
      </button>
      {isOpen && (
        <div className="border-t border-[rgba(255,255,255,0.08)] px-6 py-5 text-sm text-[rgba(207,207,207,0.75)]">
          <p className="leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function InstructionsPage() {
  const router = useRouter();

  const goToApp = () => {
    router.push("/app/dashboard");
  };

  const goToTemplates = () => {
    router.push("/app/templates");
  };

  const goToGenerate = () => {
    router.push("/app/generate");
  };

  const journeySteps: JourneyStep[] = [
    {
      title: "Select your template",
      subtitle: "Modality-aware baseline",
      description: "Launch from 100+ neon-calibrated templates across CT, MR, ultrasound, and scoring systems.",
      icon: FileText,
      accent: "from-[#4B8EFF] to-[#2653FF]",
      duration: "~5 sec setup",
      ctaLabel: "Browse templates",
      ctaAction: goToTemplates,
    },
    {
      title: "Capture findings with voice",
      subtitle: "Deepgram dictation",
      description: "Tap the glowing mic and speak naturally. Our Deepgram channel streams structured text in real time.",
      icon: Mic,
      accent: "from-[#6EE7B7] to-[#3FBF8C]",
      duration: "≈40 sec narration",
    },
    {
      title: "Let Radly assemble the report",
      subtitle: "Neon AI synthesis",
      description: "Radly fuses voice notes, template guidance, and scoring rubrics into a polished draft.",
      icon: Brain,
      accent: "from-[#8F82FF] to-[#C084FC]",
      duration: "≈25 sec processing",
    },
    {
      title: "Review & export instantly",
      subtitle: "PACS-ready output",
      description: "Approve, annotate, then download a DOCX or push to downstream systems without leaving the shell.",
      icon: Download,
      accent: "from-[#FBBF24] to-[#F97316]",
      duration: "Instant",
      ctaLabel: "Generate now",
      ctaAction: goToGenerate,
    },
  ];

  const voiceStats: VoiceStat[] = [
    {
      label: "Dictation accuracy",
      value: "99.2%",
      caption: "Deepgram tuned for medical jargon",
      accent: "from-[#6EE7B7] to-[#3FBF8C]",
    },
    {
      label: "Latency",
      value: "2.7s",
      caption: "Avg. time from voice to text",
      accent: "from-[#4B8EFF] to-[#8F82FF]",
    },
    {
      label: "Completion speed",
      value: "<90s",
      caption: "Template → export across cohorts",
      accent: "from-[#FBBF24] to-[#F97316]",
    },
  ];

  const proTips: ProTip[] = [
    {
      title: "Anchor with structured cues",
      description: "Lead with modality, anatomy, and acuity so Radly tags the right template context instantly.",
      icon: Radio,
      accent: "from-[#4B8EFF] to-[#8F82FF]",
    },
    {
      title: "Blend voice + typing",
      description: "Use voice for findings and append nuance with the keyboard—Radly merges both seamlessly.",
      icon: Mic,
      accent: "from-[#6EE7B7] to-[#3FBF8C]",
    },
    {
      title: "Review with intent",
      description: "Spend 20 seconds validating key impressions; the neon review shell highlights any deltas for you.",
      icon: Brain,
      accent: "from-[#FBBF24] to-[#F97316]",
    },
  ];

  const faqs: FAQItemProps[] = [
    {
      question: "How accurate is the voice transcription?",
      answer: "Deepgram's AI achieves 99%+ accuracy on medical terminology. It understands anatomical terms, measurements, and radiological findings. If there's an error, you can always edit the text before final generation.",
    },
    {
      question: "What if Deepgram transcribes something incorrectly?",
      answer: "You can edit the transcribed text before Radly generates your report. The text appears in the Findings field where you can make corrections, add details, or clarify any misheard words.",
    },
    {
      question: "Can I use voice on mobile devices?",
      answer: "Yes! Voice dictation works on smartphones, tablets, and desktops. For best results, use a device with a good microphone. Desktop/laptop offers a larger screen for editing if needed.",
    },
    {
      question: "Is my voice recording saved or stored?",
      answer: "No. Your voice is processed in real-time by Deepgram and converted to text instantly. The audio is not stored - only the transcribed text is kept in your report.",
    },
    {
      question: "Can I mix voice and typing?",
      answer: "Absolutely! You can voice dictate some findings and type others. The text field accepts both, so use whichever method works best for each finding.",
    },
    {
      question: "What if I have a strong accent?",
      answer: "Deepgram is trained on diverse accents and speech patterns. It's also trained on medical terminology specifically, so it handles radiological terms well. Try speaking naturally and let the AI adapt.",
    },
    {
      question: "How long can I record at once?",
      answer: "You can dictate continuously - there's no time limit per recording session. For very long findings, you might break them into 2-3 sections, but most findings are done in one dictation.",
    },
    {
      question: "What happens if I cough or have background noise?",
      answer: "Deepgram's AI filters out most background noise and interruptions. It's designed for real-world environments. If there's significant noise, try finding a quieter location or re-recording that section.",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--ds-bg-gradient)] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-65 bg-[radial-gradient(circle_at_15%_12%,rgba(75,142,255,0.25),transparent_60%),radial-gradient(circle_at_80%_10%,rgba(143,130,255,0.22),transparent_65%),radial-gradient(circle_at_50%_90%,rgba(63,191,140,0.18),transparent_70%)]" />
        <div className="absolute inset-y-0 -left-48 w-96 bg-[radial-gradient(circle,rgba(63,191,140,0.25),transparent_68%)] blur-[120px] opacity-70" />
        <div className="absolute inset-y-0 -right-64 w-[28rem] bg-[radial-gradient(circle,rgba(248,183,77,0.22),transparent_70%)] blur-[140px] opacity-70" />
        <div className="absolute bottom-[-180px] left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(75,142,255,0.28),transparent_70%)] blur-[180px] opacity-60" />
      </div>

      <header className="sticky top-0 z-40 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(6,10,22,0.72)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2 text-[rgba(207,207,207,0.82)] transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-semibold uppercase tracking-[0.32em]">Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-[rgba(207,207,207,0.78)] hover:text-white"
              onClick={goToTemplates}
            >
              Templates
            </Button>
            <Button
              className="rounded-xl px-5 py-2 font-semibold shadow-[0_18px_42px_rgba(38,83,255,0.45)]"
              onClick={goToApp}
            >
              Enter Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-6xl px-5 pb-24">
        <section className="py-16 sm:py-20 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hero-starfield relative overflow-hidden rounded-[48px] px-8 py-12 sm:px-12 sm:py-14 lg:px-16 lg:py-16"
          >
            <div className="hero-aurora" />
            <div className="relative grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div className="space-y-8">
                <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(143,130,255,0.35)] bg-[rgba(12,16,28,0.65)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-[rgba(207,207,207,0.68)]">
                  <Sparkles className="h-4 w-4 text-[rgba(143,130,255,0.85)]" />
                  Voice + AI Guide
                </span>
                <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-[3.6rem]">
                  Orchestrate neon-grade reports in under <span className="text-[rgba(111,231,183,0.95)]">90 seconds</span>
                </h1>
                <p className="max-w-2xl text-base text-[rgba(207,207,207,0.72)] sm:text-lg">
                  Speak freely, synthesize with Radly, and deliver PACS-ready documents without leaving our aurora shell. This page maps every glow-drenched step so your workflow feels cinematic, not clinical.
                </p>
                <div className="flex flex-wrap gap-3">
                  {["Template → export without context loss", "Deepgram live dictation", "Celebratory neon review"].map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-[rgba(255,255,255,0.18)] bg-[rgba(12,16,28,0.6)] px-4 py-2 text-xs uppercase tracking-[0.32em] text-[rgba(207,207,207,0.55)]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    className="rounded-2xl px-6 py-3 text-base font-semibold shadow-[0_20px_60px_rgba(38,83,255,0.55)]"
                    onClick={goToGenerate}
                  >
                    Launch Generate Flow
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-2xl border-[rgba(255,255,255,0.18)] bg-[rgba(12,16,28,0.55)] px-6 py-3 text-base font-semibold text-[rgba(207,207,207,0.9)] hover:bg-[rgba(12,16,28,0.75)]"
                    onClick={goToTemplates}
                  >
                    Explore Templates
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[32px] border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.68)] p-6 shadow-[0_24px_80px_rgba(31,64,175,0.35)] backdrop-blur-lg">
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[rgba(207,207,207,0.52)]">
                    Workflow Snapshot
                  </p>
                  <div className="mt-4 space-y-4">
                    {journeySteps.map((step, index) => (
                      <div key={step.title} className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.75)] text-sm font-semibold text-white">
                          0{index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">{step.title}</p>
                          <p className="text-xs uppercase tracking-[0.32em] text-[rgba(207,207,207,0.48)]">{step.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {voiceStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.68)] p-4 text-center shadow-[0_16px_48px_rgba(31,64,175,0.4)]"
                    >
                      <div className={`mx-auto mb-2 h-1 w-14 rounded-full bg-gradient-to-r ${stat.accent}`} />
                      <p className="text-2xl font-semibold text-white">{stat.value}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.32em] text-[rgba(207,207,207,0.48)]">{stat.label}</p>
                      <p className="mt-2 text-[0.7rem] text-[rgba(207,207,207,0.6)]">{stat.caption}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="py-16">
          <div className="space-y-10">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-semibold sm:text-4xl">Follow the aurora journey</h2>
              <p className="mt-3 text-[rgba(207,207,207,0.72)]">
                Each stage is tuned for clarity, with neon cues guiding you from selection to export. Explore the flow at your own tempo.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {journeySteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="aurora-card relative overflow-hidden border border-[rgba(255,255,255,0.1)] p-6 sm:p-7"
                >
                  <div className="absolute right-8 top-8 hidden h-12 w-12 items-center justify-center rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.65)] text-center text-sm font-semibold uppercase tracking-[0.32em] text-[rgba(207,207,207,0.6)] sm:flex">
                    0{index + 1}
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.18)] bg-[rgba(12,16,28,0.78)]">
                      <step.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[rgba(207,207,207,0.5)]">{step.subtitle}</p>
                        <h3 className="mt-2 text-xl font-semibold text-white">{step.title}</h3>
                      </div>
                      <p className="text-sm text-[rgba(207,207,207,0.72)]">{step.description}</p>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`rounded-full bg-gradient-to-r ${step.accent} px-3 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-black`}>
                          {step.duration}
                        </span>
                        {step.ctaLabel && step.ctaAction && (
                          <Button
                            variant="ghost"
                            className="text-[rgba(207,207,207,0.85)] hover:text-white"
                            onClick={step.ctaAction}
                          >
                            {step.ctaLabel}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="hero-starfield relative overflow-hidden rounded-[44px] px-8 py-10 sm:px-12 sm:py-12">
            <div className="hero-aurora" />
            <div className="relative grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
              <div className="space-y-6">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[rgba(207,207,207,0.52)]">Deepgram Spotlight</p>
                <h2 className="text-3xl font-semibold sm:text-[2.4rem]">Voice dictation engineered for radiology nuance</h2>
                <p className="text-sm text-[rgba(207,207,207,0.72)] sm:text-base">
                  The glowing microphone pipes through a HIPAA-aligned Deepgram channel, tuned on our own corpus of structured radiology language. Dictate impressions, comparisons, and measurements without worrying about the jargon being lost in translation.
                </p>
                <div className="space-y-3">
                  {[
                    { icon: Mic, text: "Live waveform monitoring ensures background noise is filtered before transcription." },
                    { icon: Brain, text: "Radly's synthesis engine cross-references template expectations to auto-fill structured fields." },
                    { icon: Radio, text: "Fallback text input stays in sync, so manual edits shimmer alongside your dictation." },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-start gap-3 rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.68)] px-4 py-3">
                      <Icon className="mt-0.5 h-5 w-5 text-[rgba(143,130,255,0.9)]" />
                      <p className="text-sm text-[rgba(207,207,207,0.78)]">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="rounded-3xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.75)] p-6 text-center shadow-[0_24px_80px_rgba(31,64,175,0.4)]">
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-[rgba(143,130,255,0.35)] bg-[rgba(12,16,28,0.78)] shadow-[0_20px_50px_rgba(38,83,255,0.45)]">
                    <Mic className="h-10 w-10 text-white" />
                  </div>
                  <p className="text-xs uppercase tracking-[0.32em] text-[rgba(207,207,207,0.5)]">Live dictation preview</p>
                  <p className="mt-3 text-lg font-semibold">“CTA chest demonstrates eccentric mural thrombus...”</p>
                  <p className="mt-3 text-sm text-[rgba(207,207,207,0.62)]">
                    Every phrase appears in the findings panel with millisecond timing metadata, so you always know what landed.
                  </p>
                </div>
                <div className="rounded-3xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.75)] p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[rgba(207,207,207,0.48)]">Timing overview</p>
                  <div className="mt-4 space-y-3">
                    {voiceStats.map((stat) => (
                      <div key={stat.label} className="flex items-center justify-between rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(12,16,28,0.65)] px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{stat.label}</p>
                          <p className="text-xs text-[rgba(207,207,207,0.55)]">{stat.caption}</p>
                        </div>
                        <span className={`rounded-full bg-gradient-to-r ${stat.accent} px-3 py-1 text-xs font-semibold text-black`}>
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="space-y-10">
            <div className="text-center">
              <h2 className="text-3xl font-semibold sm:text-4xl">Practice inside the neon sandbox</h2>
              <p className="mt-3 text-sm text-[rgba(207,207,207,0.72)] sm:text-base">
                Rehearse the full voice-to-report journey with our interactive playground. Every action mirrors production.
              </p>
            </div>
            <div className="aurora-card border border-[rgba(255,255,255,0.08)] p-6 sm:p-8">
              <InteractiveDemo />
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="grid gap-6 lg:grid-cols-3">
            {proTips.map((tip) => (
              <div key={tip.title} className="aurora-card border border-[rgba(255,255,255,0.08)] p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.18)] bg-[rgba(12,16,28,0.75)]">
                    <tip.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className={`rounded-full bg-gradient-to-r ${tip.accent} px-3 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-black`}>
                    Pro tip
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">{tip.title}</h3>
                <p className="mt-3 text-sm text-[rgba(207,207,207,0.7)]">{tip.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16">
          <div className="text-center">
            <h2 className="text-3xl font-semibold sm:text-4xl">Frequently asked glow-ups</h2>
            <p className="mt-3 text-sm text-[rgba(207,207,207,0.72)] sm:text-base">
              Everything radiologists ask before adopting voice-first reporting.
            </p>
          </div>
          <div className="mt-10 space-y-4">
            {faqs.map((faq) => (
              <FAQItem key={faq.question} {...faq} />
            ))}
          </div>
        </section>

        <section className="py-20">
          <div className="hero-starfield relative overflow-hidden rounded-[44px] px-8 py-12 text-center sm:px-12 sm:py-14">
            <div className="hero-aurora" />
            <div className="relative space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[rgba(207,207,207,0.5)]">Ready when you are</p>
              <h2 className="text-3xl font-semibold sm:text-[2.6rem]">Bring neon-authored reports to your next shift</h2>
              <p className="mx-auto max-w-2xl text-sm text-[rgba(207,207,207,0.72)] sm:text-base">
                Your first five reports are on us. Keep the glow by returning whenever you are on call—Radly remembers your preferences and active queues.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
                <Button
                  size="lg"
                  className="rounded-2xl px-8 py-3 text-base font-semibold shadow-[0_24px_70px_rgba(38,83,255,0.5)]"
                  onClick={goToGenerate}
                >
                  Generate a report
                  <Mic className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-2xl border-[rgba(255,255,255,0.18)] bg-[rgba(12,16,28,0.6)] px-8 py-3 text-base font-semibold text-[rgba(207,207,207,0.9)] hover:bg-[rgba(12,16,28,0.75)]"
                  onClick={goToApp}
                >
                  Open dashboard
                </Button>
              </div>
              <div className="flex flex-wrap justify-center gap-5 text-xs uppercase tracking-[0.32em] text-[rgba(207,207,207,0.52)]">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  No credit card
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  5 free reports
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Neon support 24/7
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[rgba(255,255,255,0.08)] bg-[rgba(6,10,22,0.85)] py-10 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-5 text-[rgba(207,207,207,0.6)]">
          <Image
            src="/brand/Radly.png"
            alt="Radly Logo"
            width={60}
            height={60}
            className="h-15 w-15"
          />
          <div className="flex flex-wrap justify-center gap-6 text-xs uppercase tracking-[0.32em]">
            <Link href="/legal/terms" className="transition-colors hover:text-white">
              Terms
            </Link>
            <Link href="/legal/privacy" className="transition-colors hover:text-white">
              Privacy
            </Link>
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
          </div>
          <p className="text-xs uppercase tracking-[0.32em] text-[rgba(207,207,207,0.42)]">
            © {new Date().getFullYear()} Radly — Powered by voice, glowing for radiologists.
          </p>
        </div>
      </footer>
    </div>
  );
}
