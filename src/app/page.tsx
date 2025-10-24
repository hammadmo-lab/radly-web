"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Brain,
  CheckCircle,
  GraduationCap,
  Layers,
  Sparkles,
  Stars,
} from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";
import { motion } from "framer-motion";

export const dynamic = "force-dynamic";

const VALUE_PILLARS = [
  {
    icon: Brain,
    title: "Understands Clinical Nuance",
    description:
      "Radly recognises modality, laterality, and comparison details so reports stay clinically precise and on-voice.",
  },
  {
    icon: Layers,
    title: "Structured From The Start",
    description:
      "Generates fully structured findings, impressions, and follow-ups that plug straight into your workflow.",
  },
  {
    icon: GraduationCap,
    title: "Supports Every Radiologist",
    description:
      "Gives residents a smart assistant for learning structured reporting while letting senior staff move faster.",
  },
];

const WORKFLOW_STEPS = [
  {
    title: "Share your notes or dictation cues",
    description:
      "Drop bullet points, key measurements, or voice snippets. Radly aligns to your preferred template instantly.",
  },
  {
    title: "Radly assembles the report",
    description:
      "Our smart assistant produces an organised, clinically accurate report with findings, impressions, and recommendations.",
  },
  {
    title: "You review, refine, and sign off",
    description:
      "Radiologists remain in command—edit anything in seconds, export, and move on to the next case.",
  },
];

const COMPARISON_POINTS = [
  {
    radly: "Purpose-built for radiology with structured sections and clinical guardrails.",
    generic: "Generic text completion that needs heavy prompting and rewrites.",
  },
  {
    radly: "Understands modality context, measurements, and comparison language.",
    generic: "Limited awareness of modality nuance; inconsistent terminology.",
  },
  {
    radly: "Assistant experience that accelerates drafting while you stay in control.",
    generic: "Chat-style output not tailored to reading room workflows.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Radly elevates our department. We move faster while every radiologist retains full control over final wording.",
    author: "Dr. Layla Hassan",
    role: "Chief of Radiology, Cairo Medical",
  },
  {
    quote:
      "As a resident, Radly helps me produce structured reports that match our attendings’ expectations—it’s like having a mentor next to me.",
    author: "Dr. Omar Kamel",
    role: "Radiology Resident, Northbridge Teaching Hospital",
  },
];

export default function Home() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data } = await supabase.auth.getSession();
        setAuthed(!!data.session);
      } catch (error) {
        console.warn("Auth check failed:", error);
        setAuthed(false);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  const goToApp = () => {
    if (busy) return;
    setBusy(true);
    try {
      const href = authed ? "/app/dashboard" : "/auth/signin";
      router.push(href);
    } finally {
      setBusy(false);
    }
  };

  const goToInstructions = () => router.push("/instructions");

  return (
    <div className="min-h-screen bg-[var(--ds-bg-gradient)] text-white">
      <main className="relative overflow-hidden pb-24">
        <div className="pointer-events-none absolute inset-0 opacity-80">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(75,142,255,0.18),transparent_55%),radial-gradient(circle_at_85%_0,rgba(143,130,255,0.18),transparent_60%)]" />
        </div>

        <section className="relative px-4 pt-16 sm:pt-20 lg:pt-28">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="hero-starfield px-10 py-20 sm:px-16 sm:py-24 lg:px-20 lg:py-28"
            >
              <div className="hero-aurora" />
              <div className="relative flex flex-col items-center text-center">
                <motion.div
                  initial={{ opacity: 0.6, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="flex h-[18rem] w-[18rem] items-center justify-center rounded-full border border-[rgba(75,142,255,0.45)] bg-[rgba(12,16,28,0.65)] shadow-[0_40px_120px_rgba(31,64,175,0.5)] sm:h-[19rem] sm:w-[19rem] lg:h-[21rem] lg:w-[21rem]"
                >
                  <Image
                    src="/brand/Radly.png"
                    width={320}
                    height={320}
                    alt="Radly Logo"
                    priority
                    className="w-[14.5rem] drop-shadow-[0_32px_70px_rgba(20,28,45,0.68)] sm:w-[15.5rem] lg:w-[16.5rem]"
                  />
                </motion.div>

                <div className="mt-12 inline-flex items-center gap-2 rounded-full border border-[rgba(75,142,255,0.28)] bg-[rgba(75,142,255,0.14)] px-7 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#D7E3FF]">
                  <Sparkles className="h-4 w-4" />
                  Intelligent Radiology Assistant
                  <Stars className="h-4 w-4" />
                </div>

                <h1 className="mt-6 max-w-4xl text-[2.8rem] font-semibold leading-tight tracking-tight sm:text-5xl lg:text-[3.75rem] lg:leading-[1.1]">
                  The smart radiology assistant that generates reports radiologists love—and elevates their work.
                </h1>

                <p className="mt-5 max-w-2xl text-base text-[rgba(225,231,255,0.78)] sm:text-lg">
                  Purpose-built for radiology, Radly understands modality nuance, keeps language consistent, and lets every clinician spend more time on interpretation—not clerical work.
                </p>

                <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={goToApp}
                    disabled={busy || !authChecked}
                    className="h-13 w-full rounded-xl border border-[rgba(75,142,255,0.45)] bg-[linear-gradient(90deg,#2653FF_0%,#4B8EFF_45%,#8F82FF_100%)] px-8 text-lg font-semibold shadow-[0_24px_58px_rgba(31,64,175,0.45)] transition-transform hover:-translate-y-0.5 sm:w-auto"
                  >
                    {busy ? "Loading…" : !authChecked ? "Checking…" : "Start Free Trial"}
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={goToInstructions}
                    className="h-13 w-full rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.75)] px-8 text-lg font-semibold text-[rgba(207,207,207,0.85)] transition-transform hover:-translate-y-0.5 hover:text-white sm:w-auto"
                  >
                    See how it works
                  </Button>
                </div>

                <div className="mt-8 grid w-full max-w-3xl grid-cols-1 gap-4 text-sm sm:grid-cols-3 sm:text-base">
                  <MetricHighlight value="14+ hours" label="Saved every month per radiologist" />
                  <MetricHighlight value="< 2 minutes" label="To generate a clinically accurate report" />
                  <MetricHighlight value="60% faster" label="Compared to manual documentation" />
                </div>

                <p className="mt-6 text-xs uppercase tracking-[0.18em] text-[rgba(207,207,207,0.45)]">
                  Radly assists. Radiologists review and finalise every report.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <SectionWrapper title="Why radiologists rely on Radly" eyebrow="Assistant-first advantages">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {VALUE_PILLARS.map((pillar) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="aurora-card border border-[rgba(255,255,255,0.08)] p-6 transition-transform hover:-translate-y-1"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(75,142,255,0.35)] bg-[rgba(75,142,255,0.16)] text-[#D7E3FF]">
                  <pillar.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">{pillar.title}</h3>
                <p className="mt-2 text-sm text-[rgba(207,207,207,0.68)]">{pillar.description}</p>
              </motion.div>
            ))}
          </div>
        </SectionWrapper>

        <SectionWrapper title="How the Radly assistant elevates your workflow" eyebrow="Three steps, all under your direction">
          <div className="grid gap-6 lg:grid-cols-3">
            {WORKFLOW_STEPS.map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="aurora-card border border-[rgba(255,255,255,0.08)] p-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(75,142,255,0.35)] bg-[rgba(75,142,255,0.16)] text-[#D7E3FF]">
                      <span className="text-sm font-semibold">{idx + 1}</span>
                    </div>
                    <h3 className="text-base font-semibold text-white">{step.title}</h3>
                  </div>
                  <p className="mt-3 text-sm text-[rgba(207,207,207,0.68)]">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </SectionWrapper>

        <section className="relative px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="neon-shell p-8 sm:p-10 backdrop-blur-xl"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgba(207,207,207,0.55)]">
                    Radly vs generic AI tools
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold">
                    Built as a radiology assistant—not a generic chatbot
                  </h2>
                  <p className="mt-3 max-w-xl text-sm text-[rgba(207,207,207,0.65)]">
                    Radly focuses on the reading room. Compare our dedicated assistant to broad language models relied
                    on for casual drafting and you’ll see the difference in accuracy, consistency, and trust.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={goToInstructions}
                  className="h-11 rounded-xl border border-[rgba(255,255,255,0.12)] px-6 text-[rgba(207,207,207,0.85)] hover:text-white"
                >
                  See Radly in action
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[rgba(75,142,255,0.35)] bg-[rgba(75,142,255,0.12)] p-6">
                  <h3 className="text-lg font-semibold text-[#D7E3FF]">Radly Assistant</h3>
                  <ul className="mt-4 space-y-3 text-sm text-[rgba(207,207,207,0.8)]">
                    {COMPARISON_POINTS.map((point, idx) => (
                      <li key={`radly-${idx}`} className="flex items-start gap-2">
                        <CheckCircle className="mt-1 h-4 w-4 text-[#7AE7B4]" />
                        <span>{point.radly}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(12,16,28,0.6)] p-6 text-sm text-[rgba(207,207,207,0.65)]">
                  <h3 className="text-lg font-semibold text-white">Generic AI Models</h3>
                  <ul className="mt-4 space-y-3">
                    {COMPARISON_POINTS.map((point, idx) => (
                      <li key={`generic-${idx}`} className="flex items-start gap-2">
                        <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-[#FF6B6B]" />
                        <span>{point.generic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <SectionWrapper title="What radiologists say" eyebrow="Trusted assistant in real clinics">
          <div className="grid gap-6 lg:grid-cols-2">
            {TESTIMONIALS.map((testimonial, idx) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="aurora-card border border-[rgba(255,255,255,0.08)] p-6 sm:p-7"
              >
                <p className="text-lg leading-relaxed text-[rgba(207,207,207,0.8)]">“{testimonial.quote}”</p>
                <div className="mt-6 text-xs uppercase tracking-[0.18em] text-[rgba(207,207,207,0.55)]">
                  {testimonial.author}
                  <span className="block text-[rgba(207,207,207,0.45)]">{testimonial.role}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </SectionWrapper>

        <section className="relative px-4 pt-4">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="neon-shell p-8 sm:p-10 text-center backdrop-blur-xl"
            >
              <h2 className="text-3xl font-semibold sm:text-4xl">Bring the Radly assistant into your reading room</h2>
              <p className="mt-4 text-sm text-[rgba(207,207,207,0.7)] sm:text-base">
                Launch with five complimentary reports. No new infrastructure—Radly works alongside your workflow and elevates radiologists’ work from day one.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={goToApp}
                  disabled={busy || !authChecked}
                  className="h-12 w-full rounded-xl border border-[rgba(75,142,255,0.45)] bg-[linear-gradient(90deg,#2653FF_0%,#4B8EFF_45%,#8F82FF_100%)] px-8 text-lg font-semibold shadow-[0_20px_54px_rgba(31,64,175,0.42)] transition-transform hover:-translate-y-0.5 sm:w-auto"
                >
                  {busy ? "Loading…" : "Start Free Trial"}
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
                <Link href="/instructions" className="w-full sm:w-auto">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="h-12 w-full rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.78)] px-8 text-lg font-semibold text-[rgba(207,207,207,0.85)] transition-transform hover:-translate-y-0.5 hover:text-white"
                  >
                    View assistant walkthrough
                  </Button>
                </Link>
              </div>

              <p className="mt-6 text-xs uppercase tracking-[0.18em] text-[rgba(207,207,207,0.45)]">
                Radly is an intelligent assistant. Radiologists make the final call on every report.
              </p>
            </motion.div>
          </div>
        </section>
        <footer className="relative mt-12 border-t border-[rgba(255,255,255,0.08)] px-4 py-8 text-sm">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-[rgba(207,207,207,0.6)] sm:flex-row">
            <div className="text-xs uppercase tracking-[0.2em] text-[rgba(207,207,207,0.45)]">
              © Radly {new Date().getFullYear()} — Intelligent assistant for radiologists
            </div>
            <div className="flex items-center gap-4 text-xs uppercase tracking-[0.18em]">
              <Link href="/privacy" className="text-[rgba(207,207,207,0.65)] hover:text-white">
                Privacy Policy
              </Link>
              <span className="text-[rgba(207,207,207,0.3)]">•</span>
              <Link href="/terms" className="text-[rgba(207,207,207,0.65)] hover:text-white">
                Terms of Service
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function SectionWrapper({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="text-center space-y-3"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgba(207,207,207,0.55)]">
            {eyebrow}
          </p>
          <h2 className="text-3xl font-semibold sm:text-[2.5rem] sm:leading-[1.15]">{title}</h2>
        </motion.div>
        {children}
      </div>
    </section>
  );
}

function MetricHighlight({ value, label }: { value: string; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className="aurora-card border border-[rgba(255,255,255,0.08)] px-6 py-5 text-left sm:text-center"
    >
      <p className="text-2xl font-semibold text-white sm:text-3xl">{value}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[rgba(207,207,207,0.55)]">{label}</p>
    </motion.div>
  );
}
