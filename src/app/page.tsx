"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Shield, CheckCircle, ArrowRight, Clock, Target, FileText, Download, AlertTriangle, X, ArrowDown, Sparkles, Lightbulb, PartyPopper, AlertCircle } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";

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
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-20">
        {/* Background Visual Elements */}
        <div className="absolute inset-0 bg-gradient-hero opacity-50"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-green-teal rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-teal-purple rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-green-purple rounded-full opacity-10 blur-3xl"></div>
        
        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="max-w-5xl mx-auto">
            {/* Logo */}
            <div className="mb-8">
              <Image
                src="/brand/Radly.png"
                alt="Radly Logo"
                width={468}
                height={500}
                className="w-[468px] h-[500px] mx-auto"
              />
            </div>
            
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-50 to-white border border-green-500 rounded-full text-sm font-semibold text-gray-700 mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-green-600 mr-2" />
              100+ Medical Templates Ready
            </div>
            
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Transform Your{" "}
              <span className="text-gradient-brand">Radiology Workflow</span>
            </h1>
            
            {/* Sub-headline */}
            <p className="text-lg sm:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed my-4">
              Generate professional, accurate medical reports in under 90 seconds. 
              Purpose-built for radiologists, not generic AI.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button
                size="lg"
                className="bg-secondary hover:bg-secondary-dark text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                onClick={goToApp}
                disabled={busy || !authChecked}
              >
                {busy ? "Loading…" : !authChecked ? "Checking..." : "Start Generating Reports"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-gray-300 hover:border-secondary hover:text-secondary px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
                onClick={goToInstructions}
              >
                See Instructions
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <Target className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-semibold">Purpose-Built</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-semibold">Medically Accurate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm font-semibold">Lightning Fast</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Callout Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Tired of the Generic AI Struggle?
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
            {/* Left Column - Pain Points */}
            <div className="space-y-3">
              <div className="flex items-start gap-4 bg-white border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
                <div className="flex-shrink-0 w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mt-1">
                  <X className="w-3 h-3 text-red-600" />
                </div>
                <p className="text-lg text-gray-700">Writing detailed prompts 20+ times per day</p>
              </div>
              <div className="flex items-start gap-4 bg-white border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
                <div className="flex-shrink-0 w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mt-1">
                  <X className="w-3 h-3 text-red-600" />
                </div>
                <p className="text-lg text-gray-700">Spending 5-10 minutes per report formatting</p>
              </div>
              <div className="flex items-start gap-4 bg-white border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
                <div className="flex-shrink-0 w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mt-1">
                  <X className="w-3 h-3 text-red-600" />
                </div>
                <p className="text-lg text-gray-700">Generic AI hallucinating medical terms</p>
              </div>
              <div className="flex items-start gap-4 bg-white border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
                <div className="flex-shrink-0 w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mt-1">
                  <X className="w-3 h-3 text-red-600" />
                </div>
                <p className="text-lg text-gray-700">Inconsistent report structure every time</p>
              </div>
              <div className="flex items-start gap-4 bg-white border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
                <div className="flex-shrink-0 w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mt-1">
                  <X className="w-3 h-3 text-red-600" />
                </div>
                <p className="text-lg text-gray-700">Copy-paste-format-repeat nightmare</p>
              </div>
            </div>

            {/* Right Column - Solution Teaser */}
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-green-600 mb-4">
                There&apos;s a better way for radiologists...
              </h3>
              <div className="flex justify-center">
                <ArrowDown className="w-8 h-8 text-green-600 animate-bounce" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Radly vs Generic AI Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Why Radly vs Generic AI?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              ChatGPT and Claude are powerful, but they weren&apos;t built for radiology. Radly was.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <Card className="text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 rounded-2xl p-8 shadow-md">
              <CardHeader className="pb-4">
                <div className="w-18 h-18 bg-gradient-to-br from-purple-500 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <FileText className="w-9 h-9 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 mb-3 relative">
                  100+ Medical Templates
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-purple-500 rounded-full"></div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-sm leading-relaxed max-w-64 mx-auto">
                  CT, MRI, X-ray, ultrasound templates pre-loaded. No lengthy prompts needed like ChatGPT.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 rounded-2xl p-8 shadow-md">
              <CardHeader className="pb-4">
                <div className="w-18 h-18 bg-gradient-to-br from-green-500 to-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Download className="w-9 h-9 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 mb-3 relative">
                  One-Click DOCX Export
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-green-500 rounded-full"></div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-sm leading-relaxed max-w-64 mx-auto">
                  Download formatted, professional reports instantly. No Word formatting required.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 rounded-2xl p-8 shadow-md">
              <CardHeader className="pb-4">
                <div className="w-18 h-18 bg-gradient-to-br from-blue-500 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Shield className="w-9 h-9 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 mb-3 relative">
                  Built-In Validators
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-blue-500 rounded-full"></div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-sm leading-relaxed max-w-64 mx-auto">
                  Prevent hallucinations with clinical accuracy checks. Generic AI can invent medical terms—Radly validates them.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 rounded-2xl p-8 shadow-md">
              <CardHeader className="pb-4">
                <div className="w-18 h-18 bg-gradient-to-br from-purple-500 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <CheckCircle className="w-9 h-9 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 mb-3 relative">
                  Reporting Standards Built-In
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-purple-500 rounded-full"></div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-sm leading-relaxed max-w-64 mx-auto">
                  LI-RADS, BI-RADS, Lung-RADS compliance. Ensures your reports meet professional standards.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Visual Workflow Comparison Section */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              The Real Difference: 10 Minutes vs 90 Seconds
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See exactly how Radly saves you 10+ hours every week
            </p>
          </div>

          {/* Desktop Comparison */}
          <div className="hidden lg:flex lg:gap-8 max-w-7xl mx-auto relative">
            {/* VS Badge */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-16 h-16 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-lg font-bold text-gray-700">VS</span>
            </div>
            
            {/* ChatGPT Workflow */}
            <div className="flex-1 bg-red-50 border-2 border-red-200 rounded-2xl p-6 relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-2xl"></div>
              <div className="text-center mb-8">
                <div className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold mb-4">
                  The Old Way ❌
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Using ChatGPT</h3>
                <div className="text-lg text-red-600 font-semibold">Total Time: ~10 minutes</div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white border border-red-300 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-900 text-base">Step 1: Write Detailed Prompt</h4>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-red-600" />
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-600">
                    &ldquo;Generate a comprehensive CT chest report for a 45-year-old male patient with...&rdquo;
                  </div>
                  <div className="mt-2 text-xs text-red-600 font-medium">2-3 minutes</div>
                </div>

                <div className="bg-white border border-red-300 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-900 text-base">Step 2: Review Plain Text Output</h4>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-600">
                    Unformatted text with potential hallucinated terms...
                  </div>
                  <div className="mt-2 text-xs text-red-600 font-medium">⚠️ Risk: Hallucinations</div>
                </div>

                <div className="bg-white border border-red-300 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-900 text-base">Step 3: Copy to Microsoft Word</h4>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-red-600" />
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-600">
                    Manual copy-paste process...
                  </div>
                  <div className="mt-2 text-xs text-red-600 font-medium">1 minute</div>
                </div>

                <div className="bg-white border border-red-300 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-900 text-base">Step 4: Manual Formatting</h4>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-red-600" />
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-600">
                    Formatting toolbars, manual styling...
                  </div>
                  <div className="mt-2 text-xs text-red-600 font-medium">4-5 minutes</div>
                </div>
              </div>

              <div className="bg-red-200 border-2 border-red-400 rounded-xl p-6 text-center mt-6">
                <div className="flex justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <div className="text-3xl font-bold text-red-800 mb-2">16+ Hours</div>
                <div className="text-sm text-red-700 mb-2">Per 100 reports</div>
                <div className="text-xs text-red-600">Risk: Medical inaccuracies ⚠️</div>
              </div>
            </div>

            {/* Radly Workflow */}
            <div className="flex-1 bg-green-50 border-2 border-green-200 rounded-2xl p-6 relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-l-2xl"></div>
              <div className="text-center mb-8">
                <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold mb-4">
                  The Radly Way ✅
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Using Radly</h3>
                <div className="text-lg text-green-600 font-semibold">Total Time: &lt;90 seconds</div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white border border-green-300 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-900 text-base">Step 1: Select Template</h4>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-600">
                    Dropdown: &ldquo;Chest CT&rdquo; template selected
                  </div>
                  <div className="mt-2 text-xs text-green-600 font-medium">5 seconds</div>
                </div>

                <div className="bg-white border border-green-300 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-900 text-base">Step 2: Enter Findings</h4>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-600">
                    Clean structured form with guided fields
                  </div>
                  <div className="mt-2 text-xs text-green-600 font-medium">30-40 seconds</div>
                </div>

                <div className="bg-white border border-green-300 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-900 text-base">Step 3: AI + Validators Generate</h4>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-600">
                    Progress: &ldquo;Clinical accuracy validated&rdquo; ✅
                  </div>
                  <div className="mt-2 text-xs text-green-600 font-medium">✅ Clinically Validated</div>
                </div>

                <div className="bg-white border border-green-300 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-900 text-base">Step 4: Download Professional DOCX</h4>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Download className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-600">
                    Professional DOCX preview ready to download
                  </div>
                  <div className="mt-2 text-xs text-green-600 font-medium">Instant download</div>
                </div>
              </div>

              <div className="bg-green-200 border-2 border-green-400 rounded-xl p-6 text-center mt-6">
                <div className="flex justify-center mb-4">
                  <PartyPopper className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-green-800 mb-2">2.5 Hours</div>
                <div className="text-sm text-green-700 mb-2">Per 100 reports</div>
                <div className="text-xs text-green-600">Accuracy: Clinically validated ✅</div>
              </div>
            </div>
          </div>

          {/* Mobile Comparison */}
          <div className="lg:hidden space-y-8">
            {/* ChatGPT Workflow */}
            <div className="space-y-4 bg-red-50 border-2 border-red-200 rounded-2xl p-4">
              <div className="text-center mb-6">
                <div className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold mb-4">
                  The Old Way ❌
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Using ChatGPT</h3>
                <div className="text-lg text-red-600 font-semibold">Total Time: ~10 minutes</div>
              </div>
              
              <div className="space-y-3">
                <div className="bg-white border border-red-300 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-900 text-sm">Step 1: Write Detailed Prompt</h4>
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-red-600" />
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600">
                    &ldquo;Generate a comprehensive CT chest report...&rdquo;
                  </div>
                  <div className="mt-2 text-xs text-red-600 font-medium">2-3 minutes</div>
                </div>

                <div className="bg-white border border-red-300 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-900 text-sm">Step 2: Review Plain Text Output</h4>
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600">
                    Unformatted text with potential hallucinated terms...
                  </div>
                  <div className="mt-2 text-xs text-red-600 font-medium">⚠️ Risk: Hallucinations</div>
                </div>

                <div className="bg-white border border-red-300 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-900 text-sm">Step 3: Copy to Microsoft Word</h4>
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-red-600" />
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600">
                    Manual copy-paste process...
                  </div>
                  <div className="mt-2 text-xs text-red-600 font-medium">1 minute</div>
                </div>

                <div className="bg-white border border-red-300 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-900 text-sm">Step 4: Manual Formatting</h4>
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-red-600" />
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600">
                    Formatting toolbars, manual styling...
                  </div>
                  <div className="mt-2 text-xs text-red-600 font-medium">4-5 minutes</div>
                </div>
              </div>

              <div className="bg-red-200 border-2 border-red-400 rounded-xl p-4 text-center mt-4">
                <div className="flex justify-center mb-2">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="text-xl font-bold text-red-800 mb-1">16+ Hours</div>
                <div className="text-xs text-red-700 mb-1">Per 100 reports</div>
                <div className="text-xs text-red-600">Risk: Medical inaccuracies ⚠️</div>
              </div>
            </div>

            {/* Radly Workflow */}
            <div className="space-y-4 bg-green-50 border-2 border-green-200 rounded-2xl p-4">
              <div className="text-center mb-6">
                <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold mb-4">
                  The Radly Way ✅
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Using Radly</h3>
                <div className="text-lg text-green-600 font-semibold">Total Time: &lt;90 seconds</div>
              </div>
              
              <div className="space-y-3">
                <div className="bg-white border border-green-300 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-900 text-sm">Step 1: Select Template</h4>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600">
                    Dropdown: &ldquo;Chest CT&rdquo; template selected
                  </div>
                  <div className="mt-2 text-xs text-green-600 font-medium">5 seconds</div>
                </div>

                <div className="bg-white border border-green-300 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-900 text-sm">Step 2: Enter Findings</h4>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600">
                    Clean structured form with guided fields
                  </div>
                  <div className="mt-2 text-xs text-green-600 font-medium">30-40 seconds</div>
                </div>

                <div className="bg-white border border-green-300 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-900 text-sm">Step 3: AI + Validators Generate</h4>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600">
                    Progress: &ldquo;Clinical accuracy validated&rdquo; ✅
                  </div>
                  <div className="mt-2 text-xs text-green-600 font-medium">✅ Clinically Validated</div>
                </div>

                <div className="bg-white border border-green-300 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-900 text-sm">Step 4: Download Professional DOCX</h4>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Download className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600">
                    Professional DOCX preview ready to download
                  </div>
                  <div className="mt-2 text-xs text-green-600 font-medium">Instant download</div>
                </div>
              </div>

              <div className="bg-green-200 border-2 border-green-400 rounded-xl p-4 text-center mt-4">
                <div className="flex justify-center mb-2">
                  <PartyPopper className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-xl font-bold text-green-800 mb-1">2.5 Hours</div>
                <div className="text-xs text-green-700 mb-1">Per 100 reports</div>
                <div className="text-xs text-green-600">Accuracy: Clinically validated ✅</div>
              </div>
            </div>
          </div>

          {/* Summary Box */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-purple-100 to-green-100 border-2 border-purple-300 rounded-2xl p-8 text-center shadow-lg">
              <div className="flex justify-center mb-6">
                <Lightbulb className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-6">Bottom Line</div>
              <div className="text-lg text-gray-800 mb-6 leading-relaxed">
                ChatGPT helps you write.<br />
                Radly does your radiology reports—<br />
                <span className="font-semibold text-green-700">with built-in validators to prevent</span><br />
                <span className="font-semibold text-green-700">hallucinations and ensure clinical</span><br />
                accuracy.
              </div>
              <div className="text-xl font-bold text-gray-900 mb-8">
                Save 14 hours per month with Radly.
              </div>
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                onClick={goToApp}
                disabled={busy || !authChecked}
              >
                {busy ? "Loading…" : !authChecked ? "Checking..." : "Start Free Trial"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-brand text-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight drop-shadow-lg">
            Ready to Save 10+ Hours Every Week?
          </h2>
          <p className="text-lg sm:text-xl mb-10 opacity-90 max-w-2xl mx-auto leading-relaxed">
            Join radiologists who&apos;ve switched from generic AI to purpose-built 
            radiology reporting. Start with 5 free reports, no credit card required.
          </p>
          <Button
            size="lg"
            className="bg-white text-green-600 hover:bg-gray-100 px-10 py-5 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            onClick={goToApp}
            disabled={busy || !authChecked}
          >
            {busy ? "Loading…" : !authChecked ? "Checking..." : "Get Started Free"}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <div className="mt-6 text-base opacity-85 flex flex-wrap justify-center items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>5 free reports</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Available 24 hours</span>
            </div>
          </div>
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
              <Link href="/legal/terms" className="text-gray-600 hover:text-secondary transition-colors">
                Terms of Service
              </Link>
              <Link href="/legal/privacy" className="text-gray-600 hover:text-secondary transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
          <div className="text-center text-gray-500 mt-6">
            <p>&copy; 2025 Radly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}