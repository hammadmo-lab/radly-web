"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Shield, CheckCircle, ArrowRight, Clock, Target, FileText, Download, AlertTriangle, X, ArrowDown, Sparkles, Lightbulb, PartyPopper, AlertCircle, Settings, Mic, Brain, Zap as ZapIcon, Radio } from "lucide-react";
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

  function goToInstructions() {
    router.push("/instructions");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Hero Section - REIMAGINED WITH VOICE DICTATION */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        {/* Background Visual Elements */}
        <div className="absolute inset-0 bg-gradient-hero opacity-50"></div>
        <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full opacity-25 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-25 blur-3xl"></div>
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-gradient-to-br from-pink-300 to-rose-300 rounded-full opacity-15 blur-3xl"></div>

        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="max-w-6xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-400 rounded-full text-sm font-semibold text-gray-700 mb-6 shadow-lg"
            >
              <Mic className="w-4 h-4 text-emerald-600 mr-2 animate-pulse" />
              NOW WITH AI-POWERED VOICE DICTATION 🎙️
            </motion.div>

            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <Image
                src="/brand/Radly.png"
                alt="Radly Logo"
                width={468}
                height={500}
                className="w-[468px] h-[500px] mx-auto drop-shadow-2xl"
              />
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Speak Your Findings,{" "}
              <span className="text-gradient-brand">Get Professional Reports</span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              🎙️ <span className="font-semibold text-emerald-600">Voice dictate your findings</span> using cutting-edge Deepgram AI,
              and Radly transforms them into polished, clinically validated medical reports
              <span className="font-semibold text-emerald-600"> in under 90 seconds</span>.
            </motion.p>

            {/* Feature Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid sm:grid-cols-3 gap-4 mb-12 max-w-4xl mx-auto"
            >
              <div className="bg-white/80 backdrop-blur border border-emerald-200 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Mic className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-gray-900">Voice Input</span>
                </div>
                <p className="text-sm text-gray-600">Deepgram-powered transcription</p>
              </div>
              <div className="bg-white/80 backdrop-blur border border-blue-200 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-gray-900">AI Processing</span>
                </div>
                <p className="text-sm text-gray-600">Clinically validated output</p>
              </div>
              <div className="bg-white/80 backdrop-blur border border-purple-200 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Download className="w-5 h-5 text-purple-600" />
                  <span className="font-bold text-gray-900">Instant Export</span>
                </div>
                <p className="text-sm text-gray-600">Professional DOCX format</p>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-5 text-lg font-bold rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1"
                onClick={goToApp}
                disabled={busy || !authChecked}
              >
                {busy ? "Loading…" : !authChecked ? "Checking..." : "Start Dictating Now"}
                <Mic className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-gray-300 hover:border-emerald-500 hover:text-emerald-600 px-8 py-5 text-lg font-bold rounded-xl transition-all duration-300"
                onClick={goToInstructions}
              >
                See How It Works
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 text-gray-600"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-sm font-semibold">AI Voice Recognition</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-semibold">Medically Accurate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm font-semibold">Under 90 Seconds</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Voice Dictation Showcase Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-white to-emerald-50 border-t border-emerald-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6"
            >
              🎙️ Transform Speech to Reports
            </motion.h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Just speak naturally about your findings. Deepgram's advanced AI transcribes your voice with 99%+ accuracy,
              then Radly's validators ensure everything is clinically correct.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Left: Process Flow */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {/* Step 1 */}
              <div className="bg-white border-2 border-emerald-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Mic className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">Click Mic Button</h3>
                    <p className="text-gray-600">Press the voice input button and start speaking your findings naturally</p>
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-300 rounded-full text-xs font-semibold text-emerald-700">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      Real-time Transcription
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white border-2 border-blue-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">AI Processing</h3>
                    <p className="text-gray-600">Deepgram transcribes speech to text, then Radly validates and structures it clinically</p>
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-300 rounded-full text-xs font-semibold text-blue-700">
                      <Sparkles className="w-3 h-3" />
                      Clinical Validation
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white border-2 border-purple-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">Download Report</h3>
                    <p className="text-gray-600">Get your professionally formatted DOCX report, ready for PACS or EHR</p>
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-300 rounded-full text-xs font-semibold text-purple-700">
                      ✓ PACS Ready
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Visual Example */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              {/* Input Example */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-gray-400 uppercase">Your Voice Input (Live)</span>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <p className="text-sm text-gray-200 leading-relaxed font-mono">
                      "Small spiculated nodule right upper lobe, about eight millimeters, with irregular margins.
                      No prior for comparison. Adjacent to the lung apex..."
                    </p>
                  </div>
                </div>

                <div className="flex justify-center my-6">
                  <motion.div
                    animate={{ rotate: 180 }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-emerald-400"
                  >
                    <ArrowDown className="w-6 h-6" />
                  </motion.div>
                </div>

                {/* Output Example */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-xs font-semibold text-emerald-400 uppercase">Radly Output (Professional)</span>
                  </div>
                  <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-400/30">
                    <p className="text-sm text-emerald-100 leading-relaxed font-mono">
                      "A small spiculated nodule measuring approximately 8 mm is identified in
                      the right upper lobe at the level of segment 1b. The nodule demonstrates
                      irregular margins with peripheral spiculation..."
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-emerald-600 mb-1">99%+</div>
                  <p className="text-xs text-gray-700">Speech-to-text accuracy</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600 mb-1">&lt;3s</div>
                  <p className="text-xs text-gray-700">Average transcription time</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Radly Section - Still Relevant */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6"
            >
              Why Radly + Voice Dictation?
            </motion.h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The perfect combination for modern radiologists
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
            >
              <Card className="text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 rounded-2xl p-8 shadow-md bg-gradient-to-br from-emerald-50 to-white">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Mic className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 mb-3">Natural Voice Input</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-sm leading-relaxed">
                    Just speak like you normally would. No typing, no prompts, no formatting hassles
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 rounded-2xl p-8 shadow-md bg-gradient-to-br from-blue-50 to-white">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 mb-3">Medically Accurate</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-sm leading-relaxed">
                    AI validators prevent hallucinations and verify every medical term
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 rounded-2xl p-8 shadow-md bg-gradient-to-br from-purple-50 to-white">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 mb-3">Lightning Fast</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-sm leading-relaxed">
                    From voice input to professional report in under 90 seconds
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Card className="text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 rounded-2xl p-8 shadow-md bg-gradient-to-br from-orange-50 to-white">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Download className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 mb-3">Ready to Export</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-sm leading-relaxed">
                    Professional DOCX ready for PACS or your EHR system
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Time Savings Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-emerald-50 to-blue-50 border-t border-emerald-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6"
            >
              Your Time Matters
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200 hover:shadow-xl transition-all"
            >
              <div className="text-center">
                <div className="text-5xl font-bold text-emerald-600 mb-2">~10 min</div>
                <p className="text-gray-600 mb-4 font-semibold">Traditional Method</p>
                <ul className="text-sm text-gray-600 space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <X className="w-4 h-4 text-red-500" /> Manual typing
                  </li>
                  <li className="flex items-center gap-2">
                    <X className="w-4 h-4 text-red-500" /> Formatting in Word
                  </li>
                  <li className="flex items-center gap-2">
                    <X className="w-4 h-4 text-red-500" /> Proofreading
                  </li>
                  <li className="flex items-center gap-2">
                    <X className="w-4 h-4 text-red-500" /> Accuracy risk
                  </li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-8 shadow-2xl border-2 border-emerald-400 transform scale-105 hover:scale-110 transition-all"
            >
              <div className="text-center text-white">
                <div className="text-6xl font-bold mb-2">⚡ &lt;90 sec</div>
                <p className="mb-4 font-bold text-lg text-emerald-50">Radly with Voice</p>
                <ul className="text-sm text-emerald-50 space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Voice input
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> AI processing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Instant export
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Validated ✓
                  </li>
                </ul>
                <div className="mt-6 bg-emerald-600 rounded-lg p-3">
                  <div className="text-lg font-bold">Save 14+ Hours/Month</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200 hover:shadow-xl transition-all"
            >
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-600 mb-2">60%</div>
                <p className="text-gray-600 mb-4 font-semibold">Time Saved Per Report</p>
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-blue-900">Equals:</p>
                  <p className="text-lg font-bold text-blue-600 mt-2">4+ extra reports daily</p>
                </div>
                <p className="text-xs text-gray-500">Without losing quality or accuracy</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-brand text-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight drop-shadow-lg"
          >
            Ready to Transform Your Workflow?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg sm:text-xl mb-10 opacity-90 max-w-2xl mx-auto leading-relaxed"
          >
            Join radiologists who are using voice dictation to generate professional reports in seconds.
            Start with 5 free reports, no credit card required.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Button
              size="lg"
              className="bg-white text-emerald-600 hover:bg-gray-100 px-10 py-6 text-lg font-bold rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
              onClick={goToApp}
              disabled={busy || !authChecked}
            >
              {busy ? "Loading…" : !authChecked ? "Checking..." : "Start Dictating Now"}
              <Mic className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap justify-center items-center gap-6 text-base opacity-90"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>No credit card</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>5 free reports</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Available 24/7</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-6">
            <Image
              src="/brand/Radly.png"
              alt="Radly Logo"
              width={80}
              height={80}
              className="w-20 h-20"
            />
            <div className="flex space-x-8">
              <Link href="/legal/terms" className="text-gray-600 hover:text-emerald-600 transition-colors">
                Terms of Service
              </Link>
              <Link href="/legal/privacy" className="text-gray-600 hover:text-emerald-600 transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
          <div className="text-center text-gray-500 mt-6">
            <p>&copy; 2025 Radly. Powered by voice. Validated by science.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
