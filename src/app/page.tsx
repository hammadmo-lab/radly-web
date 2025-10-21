"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, CheckCircle, ArrowRight, Clock, Shield, FileText, Download, Sparkles, Lock, Cpu, TrendingUp, AlertCircle, Brain, BarChart3, Stethoscope } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";
import { motion } from "framer-motion";

export const dynamic = 'force-dynamic';

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
        console.warn('Auth check failed:', error);
        setAuthed(false);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  function goToApp() {
    if (busy) return;
    setBusy(true);
    try {
      const href = authed ? "/app/dashboard" : "/auth/signin";
      router.push(href);
    } finally {
      setBusy(false);
    }
  }

  function goToPricing() {
    router.push("/pricing");
  }

  function goToInstructions() {
    router.push("/instructions");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
      {/* Hero Section - Premium & Eye-Catching */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/3 left-0 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl opacity-20"></div>
        </div>

        {/* Glowing grid background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent"></div>
        </div>

        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-5xl mx-auto">
            {/* Animated Badge */}
            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/50 backdrop-blur-sm rounded-full text-sm font-bold text-emerald-300 mb-8"
            >
              <Sparkles className="w-5 h-5 animate-spin" />
              YOUR AI ASSISTANT FOR RADIOLOGY
              <TrendingUp className="w-5 h-5" />
            </motion.div>

            {/* MASSIVE LOGO */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="mb-12 relative"
            >
              <div className="relative inline-block">
                <div className="absolute -inset-8 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                <Image
                  src="/brand/Radly.png"
                  alt="Radly Logo"
                  width={600}
                  height={600}
                  className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 mx-auto drop-shadow-2xl relative z-10 filter brightness-110"
                />
              </div>
            </motion.div>

            {/* Powerful Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight"
            >
              Your AI Assistant Generates Reports{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-blue-400 to-emerald-400 animate-pulse">
                Radiologists Love
              </span>
            </motion.h1>

            {/* Compelling Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-lg sm:text-xl lg:text-2xl text-emerald-100 mb-4 max-w-4xl mx-auto leading-relaxed"
            >
              Not another generic AI tool. Radly is <span className="font-bold text-emerald-300">purpose-built for radiology</span> — understanding
              clinical nuances, maintaining accuracy, and delivering reports that radiologists trust.
            </motion.p>

            {/* Key Metric */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="flex items-center justify-center gap-3 mb-12"
            >
              <div className="flex items-center gap-2 px-6 py-3 bg-emerald-500/20 border border-emerald-400/50 rounded-full">
                <Zap className="w-5 h-5 text-emerald-300 animate-pulse" />
                <span className="text-emerald-100 font-semibold">Reports 60% faster than manual writing</span>
              </div>
            </motion.div>

            {/* Premium CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-10 py-7 text-lg font-bold rounded-xl shadow-2xl hover:shadow-emerald-500/50 transition-all transform hover:scale-105"
                onClick={goToApp}
                disabled={busy || !authChecked}
              >
                {busy ? "Loading…" : !authChecked ? "Checking..." : "Start Free Trial"}
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-emerald-400/50 text-emerald-100 hover:bg-emerald-500/10 hover:border-emerald-300 px-10 py-7 text-lg font-bold rounded-xl transition-all"
                onClick={goToInstructions}
              >
                See How It Works
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="mt-12 flex flex-wrap justify-center gap-6 text-sm"
            >
              <div className="flex items-center gap-2 text-emerald-200">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold">5 Free Reports</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-200">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold">AI Assistant Powered</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-200">
                <Brain className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold">Medically Trained AI</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Radly vs ChatGPT/Claude Comparison */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-b from-slate-800 to-slate-900 border-t border-emerald-500/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4"
            >
              Why Radly ≠ ChatGPT, Claude, or Generic AI
            </motion.h2>
            <p className="text-lg text-emerald-200 max-w-3xl mx-auto">
              Radiologists need specialized tools, not general-purpose chatbots
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* ChatGPT/Claude Problems */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="bg-gradient-to-br from-red-900/40 to-red-800/20 border-2 border-red-500/30 rounded-2xl p-8 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                    <h3 className="text-2xl font-bold text-red-200">Generic AI Tools</h3>
                  </div>
                  <ul className="space-y-4 text-red-100">
                    <li className="flex items-start gap-3">
                      <span className="text-red-400 font-bold mt-1">✗</span>
                      <span><strong>Hallucinations:</strong> Can generate plausible-sounding but false medical findings</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-400 font-bold mt-1">✗</span>
                      <span><strong>No Clinical Training:</strong> Don't understand radiological standards (LI-RADS, BI-RADS)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-400 font-bold mt-1">✗</span>
                      <span><strong>Liability Risk:</strong> No validation framework for medical accuracy</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-400 font-bold mt-1">✗</span>
                      <span><strong>Generic Templates:</strong> Not optimized for radiology workflows</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-400 font-bold mt-1">✗</span>
                      <span><strong>Slow:</strong> Requires multiple rounds of prompt engineering</span>
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* Radly Advantages */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="bg-gradient-to-br from-emerald-900/40 to-blue-800/20 border-2 border-emerald-500/50 rounded-2xl p-8 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <CheckCircle className="w-8 h-8 text-emerald-400 animate-pulse" />
                    <h3 className="text-2xl font-bold text-emerald-200">Radly (Purpose-Built)</h3>
                  </div>
                  <ul className="space-y-4 text-emerald-100">
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-400 font-bold mt-1">✓</span>
                      <span><strong>Validated Accuracy:</strong> Built-in validators prevent hallucinations and verify medical terms</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-400 font-bold mt-1">✓</span>
                      <span><strong>Radiology Trained:</strong> Understands clinical standards, terminology, and best practices</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-400 font-bold mt-1">✓</span>
                      <span><strong>Zero Risk:</strong> Medical AI framework with compliance and audit trails</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-400 font-bold mt-1">✓</span>
                      <span><strong>Specialized Templates:</strong> 100+ templates following clinical guidelines</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-400 font-bold mt-1">✓</span>
                      <span><strong>Instant Reports:</strong> One-click generation with voice input option</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Radiologist Benefits Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-b from-slate-900 to-emerald-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4"
            >
              What Radiologists Actually Gain
            </motion.h2>
            <p className="text-lg text-emerald-200">
              Real benefits that matter for your practice
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Benefit 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-2xl p-8 backdrop-blur-sm hover:border-emerald-400/60 hover:shadow-xl hover:shadow-emerald-500/10 transition-all"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Save 14+ Hours/Month</h3>
              <p className="text-emerald-100">
                Stop spending 10 minutes per report. Radly generates clinically accurate reports in under 2 minutes.
              </p>
              <div className="mt-4 text-3xl font-bold text-emerald-400">60% faster</div>
            </motion.div>

            {/* Benefit 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-8 backdrop-blur-sm hover:border-blue-400/60 hover:shadow-xl hover:shadow-blue-500/10 transition-all"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">100% Clinically Validated</h3>
              <p className="text-blue-100">
                No more worrying about AI hallucinations. Every report is verified against medical standards.
              </p>
              <div className="mt-4 text-emerald-400 font-bold">Zero liability risk</div>
            </motion.div>

            {/* Benefit 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-8 backdrop-blur-sm hover:border-purple-400/60 hover:shadow-xl hover:shadow-purple-500/10 transition-all"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Radiology-Specific AI</h3>
              <p className="text-purple-100">
                Understands LI-RADS, BI-RADS, Lung-RADS. Trained specifically for radiological reporting.
              </p>
              <div className="mt-4 text-emerald-400 font-bold">+100 templates</div>
            </motion.div>

            {/* Benefit 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-2xl p-8 backdrop-blur-sm hover:border-emerald-400/60 hover:shadow-xl hover:shadow-emerald-500/10 transition-all"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Professional Reports</h3>
              <p className="text-emerald-100">
                PACS-ready DOCX exports. Perfectly formatted, signature-ready, immediately usable.
              </p>
              <div className="mt-4 text-emerald-400 font-bold">One-click export</div>
            </motion.div>

            {/* Benefit 5 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-8 backdrop-blur-sm hover:border-blue-400/60 hover:shadow-xl hover:shadow-blue-500/10 transition-all"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Cpu className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Multiple Input Methods</h3>
              <p className="text-blue-100">
                Type, voice dictate, or combine both. Your workflow, your choice.
              </p>
              <div className="mt-4 text-emerald-400 font-bold">Flexible & adaptable</div>
            </motion.div>

            {/* Benefit 6 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/30 rounded-2xl p-8 backdrop-blur-sm hover:border-orange-400/60 hover:shadow-xl hover:shadow-orange-500/10 transition-all"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">AI Assistant Powered</h3>
              <p className="text-orange-100">
                Intelligent tool designed to assist radiologists. Not a medical device—your assistant in report generation.
              </p>
              <div className="mt-4 text-emerald-400 font-bold">Your digital teammate</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 lg:py-24 bg-slate-800 border-t border-emerald-500/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl sm:text-5xl font-bold text-emerald-400 mb-2">100+</div>
              <p className="text-sm sm:text-base text-emerald-200">Medical Templates</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="text-4xl sm:text-5xl font-bold text-blue-400 mb-2">&lt;2 min</div>
              <p className="text-sm sm:text-base text-blue-200">Per Report</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="text-4xl sm:text-5xl font-bold text-purple-400 mb-2">99%+</div>
              <p className="text-sm sm:text-base text-purple-200">Accuracy</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="text-4xl sm:text-5xl font-bold text-pink-400 mb-2">14+ hrs</div>
              <p className="text-sm sm:text-base text-pink-200">Saved Monthly</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-emerald-600 via-emerald-700 to-blue-800 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
          >
            Ready to Transform Your Practice?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-emerald-50 mb-10 max-w-2xl mx-auto"
          >
            Join radiologists who are reclaiming their time and focusing on what matters: patient care.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              size="lg"
              className="bg-white text-emerald-700 hover:bg-emerald-50 px-10 py-7 text-lg font-bold rounded-xl shadow-2xl"
              onClick={goToApp}
              disabled={busy || !authChecked}
            >
              Get Started Free
              <ArrowRight className="ml-3 w-6 h-6" />
            </Button>
            <Button
              size="lg"
              className="bg-white text-emerald-700 hover:bg-emerald-50 px-10 py-7 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              onClick={goToPricing}
            >
              See Pricing
            </Button>
          </motion.div>
          <p className="text-emerald-100 text-sm mt-8">
            No credit card required • 5 free reports • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-emerald-500/20 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-6">
            <Image
              src="/brand/Radly.png"
              alt="Radly Logo"
              width={60}
              height={60}
              className="w-15 h-15"
            />
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/instructions" className="text-emerald-300 hover:text-emerald-200 transition-colors font-medium">
                How It Works
              </Link>
              <Link href="/pricing" className="text-emerald-300 hover:text-emerald-200 transition-colors font-medium">
                Pricing
              </Link>
              <Link href="/legal/terms" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                Terms of Service
              </Link>
              <Link href="/legal/privacy" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
          <div className="text-center text-emerald-600 text-sm mt-8">
            <p>&copy; 2025 Radly. Radiology's AI Revolution.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
