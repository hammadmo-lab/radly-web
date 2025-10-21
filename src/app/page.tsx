"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, CheckCircle, ArrowRight, Clock, Shield, FileText, Download, Sparkles, Lightbulb, Settings, Mic, Brain, BarChart3, Lock, Cpu } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/brand/Radly.png"
              alt="Radly"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="font-bold text-xl text-gray-900 hidden sm:inline">Radly</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/instructions" className="text-gray-600 hover:text-gray-900 font-medium transition-colors hidden sm:inline">
              How It Works
            </Link>
            <Button
              variant="outline"
              className="border-gray-300 hover:border-emerald-500 hover:text-emerald-600"
              onClick={goToPricing}
            >
              Pricing
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={goToApp}
              disabled={busy || !authChecked}
            >
              {busy ? "Loading…" : !authChecked ? "Checking..." : "Get Started"}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-blue-50 opacity-40"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-gradient-to-tl from-blue-200 to-emerald-200 rounded-full opacity-10 blur-3xl"></div>

        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center px-4 py-2 bg-emerald-50 border border-emerald-300 rounded-full text-sm font-semibold text-emerald-700 mb-6"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Medical Reporting Assistant
            </motion.div>

            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <Image
                src="/brand/Radly.png"
                alt="Radly Logo"
                width={400}
                height={400}
                className="w-40 h-40 mx-auto drop-shadow-lg"
              />
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Professional Medical Reports in{" "}
              <span className="text-gradient-brand">Under 2 Minutes</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Your AI assistant generates clinically accurate, professionally formatted radiology reports.
              <span className="block mt-2 text-emerald-600 font-semibold">Save 60% time on report writing while maintaining clinical accuracy.</span>
            </motion.p>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto"
            >
              <div className="bg-white/70 backdrop-blur border border-emerald-100 rounded-lg p-4 shadow-sm">
                <div className="text-3xl font-bold text-emerald-600 mb-1">60%</div>
                <p className="text-xs text-gray-600 font-semibold">Time Saved</p>
              </div>
              <div className="bg-white/70 backdrop-blur border border-blue-100 rounded-lg p-4 shadow-sm">
                <div className="text-3xl font-bold text-blue-600 mb-1">100%</div>
                <p className="text-xs text-gray-600 font-semibold">Medically Accurate</p>
              </div>
              <div className="bg-white/70 backdrop-blur border border-purple-100 rounded-lg p-4 shadow-sm">
                <div className="text-3xl font-bold text-purple-600 mb-1">&lt;2 min</div>
                <p className="text-xs text-gray-600 font-semibold">Per Report</p>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-6 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                onClick={goToApp}
                disabled={busy || !authChecked}
              >
                Start Free (5 Reports)
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-gray-400 hover:border-emerald-600 hover:text-emerald-600 px-8 py-6 text-lg font-bold rounded-xl transition-all"
                onClick={goToPricing}
              >
                View Pricing
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 text-gray-600 mt-12 text-sm"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">No Credit Card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">AI-Validated</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">PACS Ready</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works - 3 Step Flow */}
      <section className="py-20 lg:py-28 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4"
            >
              Simple 3-Step Workflow
            </motion.h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From template selection to professional report export
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0 }}
              >
                <div className="bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-200 rounded-2xl p-8 text-center hover:shadow-lg transition-all">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Select Template</h3>
                  <p className="text-gray-600 mb-4">
                    Choose from 100+ specialized medical templates organized by modality
                  </p>
                  <div className="inline-block px-3 py-1 bg-emerald-100 border border-emerald-300 rounded-full text-xs font-semibold text-emerald-700">
                    ~5 seconds
                  </div>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-2xl p-8 text-center hover:shadow-lg transition-all">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Add Your Findings</h3>
                  <p className="text-gray-600 mb-4">
                    Type or dictate your findings. Text input, voice, or both - your choice
                  </p>
                  <div className="inline-block px-3 py-1 bg-blue-100 border border-blue-300 rounded-full text-xs font-semibold text-blue-700">
                    ~30-60 seconds
                  </div>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-2xl p-8 text-center hover:shadow-lg transition-all">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Download className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Export Report</h3>
                  <p className="text-gray-600 mb-4">
                    Get a professional DOCX ready for your PACS or EHR system
                  </p>
                  <div className="inline-block px-3 py-1 bg-purple-100 border border-purple-300 rounded-full text-xs font-semibold text-purple-700">
                    Instant
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features - What Makes Radly Special */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4"
            >
              Why Radiologists Choose Radly
            </motion.h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Purpose-built for efficiency, accuracy, and compliance
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
            >
              <Card className="border border-gray-200 hover:shadow-xl transition-all h-full bg-white">
                <CardHeader>
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-emerald-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">AI-Powered</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    Your AI assistant structures findings into professional language automatically
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
              <Card className="border border-gray-200 hover:shadow-xl transition-all h-full bg-white">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">Clinically Validated</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    Built-in validators verify medical terminology and prevent hallucinations
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
              <Card className="border border-gray-200 hover:shadow-xl transition-all h-full bg-white">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">Standards Compliant</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    Reports automatically follow LI-RADS, BI-RADS, and Lung-RADS standards
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
              <Card className="border border-gray-200 hover:shadow-xl transition-all h-full bg-white">
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <Mic className="w-6 h-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">Voice Dictation</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    Optional AI voice input powered by Deepgram with 99%+ accuracy
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border border-gray-200 hover:shadow-xl transition-all h-full bg-white">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Lock className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">Secure & Private</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    HIPAA-compliant with end-to-end encryption and secure data handling
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border border-gray-200 hover:shadow-xl transition-all h-full bg-white">
                <CardHeader>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <Cpu className="w-6 h-6 text-red-600" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">Multiple Input Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    Type, dictate, or combine both - your AI assistant adapts to your workflow
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Time Comparison */}
      <section className="py-20 lg:py-28 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4"
            >
              Your Time Matters
            </motion.h2>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
                  <Clock className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Traditional Method</h3>
                  <div className="text-4xl font-bold text-red-600 mb-4">~10 min</div>
                  <ul className="space-y-2 text-gray-600 text-sm mb-4">
                    <li>• Manual typing from notes</li>
                    <li>• Formatting in Word</li>
                    <li>• Proofreading</li>
                    <li>• Risk of errors</li>
                  </ul>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-2xl p-8 text-center shadow-xl">
                  <Sparkles className="w-12 h-12 text-emerald-100 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Radly with Your AI Assistant</h3>
                  <div className="text-5xl font-bold mb-4">⚡ &lt;2 min</div>
                  <ul className="space-y-2 text-emerald-50 text-sm mb-6">
                    <li>✓ Select template</li>
                    <li>✓ Add findings (typing or voice)</li>
                    <li>✓ AI structures & validates</li>
                    <li>✓ Export PACS-ready DOCX</li>
                  </ul>
                  <div className="bg-emerald-700 rounded-lg p-3 text-sm font-bold">
                    Save 14+ hours per month per radiologist
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4"
            >
              Simple, Transparent Pricing
            </motion.h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Start free with 5 reports. Upgrade when you're ready.
            </p>
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 px-8 py-3 text-lg font-bold rounded-lg"
              onClick={goToPricing}
            >
              See All Plans
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-brand text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl sm:text-6xl font-bold mb-6 leading-tight"
          >
            Meet Your AI Assistant
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg sm:text-xl mb-10 opacity-90 max-w-2xl mx-auto"
          >
            Experience the future of medical reporting. Start with 5 free reports, no credit card required.
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
              className="bg-white text-emerald-600 hover:bg-gray-100 px-10 py-6 text-lg font-bold rounded-xl shadow-xl"
              onClick={goToApp}
              disabled={busy || !authChecked}
            >
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
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
              width={60}
              height={60}
              className="w-15 h-15"
            />
            <div className="flex space-x-8 text-sm">
              <Link href="/legal/terms" className="text-gray-600 hover:text-emerald-600 transition-colors">
                Terms of Service
              </Link>
              <Link href="/legal/privacy" className="text-gray-600 hover:text-emerald-600 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/instructions" className="text-gray-600 hover:text-emerald-600 transition-colors">
                How It Works
              </Link>
            </div>
          </div>
          <div className="text-center text-gray-500 text-sm mt-8">
            <p>&copy; 2025 Radly. Your AI Assistant for Radiology Reports.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
