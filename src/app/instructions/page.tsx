"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  FileText,
  User,
  Stethoscope,
  Download,
  CheckCircle,
  ArrowRight,
  Clock,
  Shield,
  Zap,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
  ArrowLeft,
  Settings,
  Mic,
  Brain,
  Radio
} from "lucide-react";
import { InteractiveDemo } from "@/components/features/InteractiveDemo";

export const dynamic = 'force-dynamic';

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900 text-left">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-gray-700 leading-relaxed">{answer}</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header Navigation */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-emerald-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold">Back to Home</span>
          </Link>
          <Button onClick={goToApp} className="bg-emerald-600 hover:bg-emerald-700">
            Go to Dashboard
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        <div className="absolute inset-0 bg-gradient-hero opacity-50"></div>
        <div className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-20 blur-3xl"></div>

        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-400 rounded-full text-sm font-semibold text-gray-700 mb-6 shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-emerald-600 mr-2" />
              Complete Guide: Voice + AI
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Generate Reports in{" "}
              <span className="text-gradient-brand">Under 90 Seconds</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              🎙️ Speak your findings using Deepgram's advanced voice AI, and watch Radly transform them into professional, clinically validated medical reports
            </motion.p>

            {/* Progress Steps Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center justify-center gap-2 mb-8 flex-wrap"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">Pick Template</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">🎙️</div>
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">Voice Input</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-400 rounded-full flex items-center justify-center text-white font-bold text-sm">✓</div>
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">AI Process</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">📥</div>
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">Export</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4-Step Workflow Section */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-8">

            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-2 border-emerald-200 hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                          <span className="text-emerald-700 font-bold text-sm">1</span>
                        </div>
                        <CardTitle className="text-2xl text-gray-900">Choose Your Template</CardTitle>
                      </div>
                      <CardDescription className="text-base text-gray-600">
                        Browse 100+ medical templates organized by imaging modality
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-r from-emerald-50 to-white border border-emerald-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Templates Available
                    </h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-1">•</span>
                        <span>CT scans (chest, abdomen, head, extremities)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-1">•</span>
                        <span>MRI studies (brain, spine, joints)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-1">•</span>
                        <span>X-rays and ultrasound</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-1">•</span>
                        <span>All include LI-RADS, BI-RADS, Lung-RADS standards</span>
                      </li>
                    </ul>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-emerald-50 p-3 rounded-lg">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold">⏱️ ~5 seconds</span>
                  </div>
                  <Button onClick={goToTemplates} variant="outline" className="w-full border-emerald-300 hover:bg-emerald-50 hover:border-emerald-400">
                    Browse Templates
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Step 2 - VOICE DICTATION HERO */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg animate-pulse">
                      <Mic className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-700 font-bold text-sm">🎙️</span>
                        </div>
                        <CardTitle className="text-2xl text-gray-900">Voice Dictation (NEW!)</CardTitle>
                        <div className="inline-flex items-center px-2 py-1 bg-red-500 text-white rounded text-xs font-bold">HOT</div>
                      </div>
                      <CardDescription className="text-base text-gray-700 font-semibold">
                        Press mic and speak naturally - Deepgram AI handles the transcription
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-3xl font-bold text-blue-600 mb-2">99%+</div>
                        <p className="text-xs text-gray-700">Accuracy</p>
                      </div>
                      <div className="text-center p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                        <div className="text-3xl font-bold text-cyan-600 mb-2">&lt;3s</div>
                        <p className="text-xs text-gray-700">Transcription</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-3xl font-bold text-green-600 mb-2">Natural</div>
                        <p className="text-xs text-gray-700">No typing needed</p>
                      </div>
                    </div>

                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      How It Works
                    </h4>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <span className="text-blue-600 font-bold mt-0.5">1.</span>
                        <span>Click the <strong>microphone icon</strong> in the Findings field</span>
                      </li>
                      <li className="flex items-start gap-3 bg-cyan-50 p-3 rounded-lg border border-cyan-100">
                        <span className="text-cyan-600 font-bold mt-0.5">2.</span>
                        <span>Start speaking. <strong>Deepgram</strong> listens and transcribes in real-time</span>
                      </li>
                      <li className="flex items-start gap-3 bg-green-50 p-3 rounded-lg border border-green-100">
                        <span className="text-green-600 font-bold mt-0.5">3.</span>
                        <span>Stop recording. Your speech is <strong>instantly converted to text</strong></span>
                      </li>
                      <li className="flex items-start gap-3 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                        <span className="text-emerald-600 font-bold mt-0.5">4.</span>
                        <span>Text is <strong>appended to findings</strong> - ready for processing</span>
                      </li>
                    </ul>
                  </div>

                  {/* Example */}
                  <div className="bg-gray-900 rounded-lg p-6 text-white space-y-4">
                    <div>
                      <div className="text-xs text-gray-400 mb-2 font-semibold uppercase flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        Your Voice (Live):
                      </div>
                      <div className="bg-gray-800 rounded p-3 text-sm text-gray-200 font-mono italic">
                        "Small nodule right upper lobe, about eight millimeters, spiculated edges, adjacent to the fissure..."
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <ArrowRight className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-xs text-emerald-400 mb-2 font-semibold uppercase">Radly Gets:
                      </div>
                      <div className="bg-gray-800 rounded p-3 text-sm text-emerald-100 font-mono">
                        "Small nodule right upper lobe, about eight millimeters, spiculated edges, adjacent to the fissure..."
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-blue-700">💡 Pro Tip:</span> Speak naturally and conversationally. Deepgram understands medical terminology and casual speech patterns
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold">⏱️ ~30-40 seconds (depends on what you dictate)</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-2 border-green-200 hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Brain className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-700 font-bold text-sm">✓</span>
                        </div>
                        <CardTitle className="text-2xl text-gray-900">AI Processing & Validation</CardTitle>
                      </div>
                      <CardDescription className="text-base text-gray-600">
                        Radly's AI processes your input with clinical accuracy checks
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-white border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      What Happens Behind the Scenes
                    </h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        <span>AI structures your findings into professional language</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        <span>Validators verify all medical terms are accurate</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        <span>Prevents hallucinations and clinical errors</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        <span>Ensures LI-RADS, BI-RADS compliance</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Radio className="w-5 h-5 text-green-600 animate-pulse" />
                      <span className="font-semibold text-gray-900">Progress Indicators</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      You'll see real-time status: "Processing...", "Validating...", "Ready to export" - so you know exactly where your report is
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="font-semibold">⏱️ ~20-30 seconds (automatic)</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Step 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border-2 border-orange-200 hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Download className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-orange-700 font-bold text-sm">📥</span>
                        </div>
                        <CardTitle className="text-2xl text-gray-900">Review & Export</CardTitle>
                      </div>
                      <CardDescription className="text-base text-gray-600">
                        Download your professional DOCX report, ready for PACS or EHR
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-r from-orange-50 to-white border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-orange-600" />
                      Your Report Includes
                    </h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>Complete formatted report from your voice input</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>Patient information and signature fields pre-filled</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>Professional DOCX (Microsoft Word format)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>Ready to paste into your PACS or EHR system</span>
                      </li>
                    </ul>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-orange-50 p-3 rounded-lg">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="font-semibold">⏱️ Instant download</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          </div>

          {/* Total Time Summary */}
          <div className="max-w-5xl mx-auto mt-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-2xl p-12 text-center shadow-2xl border-2 border-emerald-400"
            >
              <div className="flex justify-center mb-4">
                <Sparkles className="w-8 h-8 text-emerald-100" />
              </div>
              <div className="text-5xl font-bold mb-3">🚀 Under 90 Seconds Total</div>
              <p className="text-lg opacity-95">From voice input to professional DOCX ready for your PACS system</p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                  <span className="text-sm font-semibold">5 sec: Templates</span>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                  <span className="text-sm font-semibold">+ 40 sec: Voice</span>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                  <span className="text-sm font-semibold">+ 25 sec: Processing</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4"
            >
              What Makes Radly + Voice Special
            </motion.h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The only radiology reporting platform with integrated voice dictation
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
            >
              <Card className="text-center hover:shadow-xl transition-all border border-gray-200 bg-gradient-to-br from-emerald-50 to-white">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Mic className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900">Voice Input</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    Powered by Deepgram - speak naturally, get transcribed instantly
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
              <Card className="text-center hover:shadow-xl transition-all border border-gray-200 bg-gradient-to-br from-blue-50 to-white">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900">100% Accurate</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    Built-in validators prevent hallucinations and verify medical terms
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
              <Card className="text-center hover:shadow-xl transition-all border border-gray-200 bg-gradient-to-br from-purple-50 to-white">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900">Lightning Fast</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    From voice to professional report in under 90 seconds, every time
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
              <Card className="text-center hover:shadow-xl transition-all border border-gray-200 bg-gradient-to-br from-orange-50 to-white">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Download className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900">PACS Ready</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    Professional DOCX export ready for your EHR or PACS system
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-20 lg:py-28 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-300 rounded-full text-sm font-semibold text-gray-700 mb-4 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-emerald-600 mr-2" />
                Try It Yourself
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4"
              >
                Interactive Demo
              </motion.h2>
              <p className="text-xl text-gray-600">
                Experience the full Radly workflow with voice dictation - no sign-in required
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <Card className="border-2 border-emerald-300 shadow-2xl">
                <CardContent className="p-8">
                  <InteractiveDemo />
                </CardContent>
              </Card>
            </motion.div>

            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">Ready to create real reports with voice?</p>
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                onClick={goToApp}
              >
                Start Dictating Now
                <Mic className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Tips Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4"
              >
                Voice Dictation Tips & Tricks
              </motion.h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Voice Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card className="border border-emerald-200 hover:shadow-lg transition-shadow h-full">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <Mic className="w-5 h-5 text-emerald-600" />
                      </div>
                      Voice Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-1">•</span>
                        <span><strong>Speak naturally</strong> - no need for perfect diction</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-1">•</span>
                        <span><strong>Use full descriptions</strong> - include measurements and locations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-1">•</span>
                        <span><strong>Breathe normally</strong> - pause between thoughts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-1">•</span>
                        <span><strong>Use anatomical terms</strong> - Deepgram understands medical terminology</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 mt-1">•</span>
                        <span><strong>Add comparisons</strong> - "compared to prior exam" for better context</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Pro Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card className="border border-purple-200 hover:shadow-lg transition-shadow h-full">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Zap className="w-5 h-5 text-purple-600" />
                      </div>
                      Pro Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">•</span>
                        <span><strong>Save custom instructions</strong> on templates for consistent formatting</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">•</span>
                        <span><strong>Practice your workflow</strong> - get faster with repetition</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">•</span>
                        <span><strong>Use quiet environments</strong> for best transcription accuracy</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">•</span>
                        <span><strong>Review before finalizing</strong> - takes seconds, ensures quality</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">•</span>
                        <span><strong>Combine with text input</strong> - mix voice and typing as needed</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4"
              >
                Frequently Asked Questions
              </motion.h2>
              <p className="text-lg text-gray-600">
                Questions about voice dictation and reports
              </p>
            </div>

            <div className="space-y-4">
              <FAQItem
                question="How accurate is the voice transcription?"
                answer="Deepgram's AI achieves 99%+ accuracy on medical terminology. It understands anatomical terms, measurements, and radiological findings. If there's an error, you can always edit the text before final generation."
              />
              <FAQItem
                question="What if Deepgram transcribes something incorrectly?"
                answer="You can edit the transcribed text before Radly generates your report. The text appears in the Findings field where you can make corrections, add details, or clarify any misheard words."
              />
              <FAQItem
                question="Can I use voice on mobile devices?"
                answer="Yes! Voice dictation works on smartphones, tablets, and desktops. For best results, use a device with a good microphone. Desktop/laptop offers a larger screen for editing if needed."
              />
              <FAQItem
                question="Is my voice recording saved or stored?"
                answer="No. Your voice is processed in real-time by Deepgram and converted to text instantly. The audio is not stored - only the transcribed text is kept in your report."
              />
              <FAQItem
                question="Can I mix voice and typing?"
                answer="Absolutely! You can voice dictate some findings and type others. The text field accepts both, so use whichever method works best for each finding."
              />
              <FAQItem
                question="What if I have a strong accent?"
                answer="Deepgram is trained on diverse accents and speech patterns. It's also trained on medical terminology specifically, so it handles radiological terms well. Try speaking naturally and let the AI adapt."
              />
              <FAQItem
                question="How long can I record at once?"
                answer="You can dictate continuously - there's no time limit per recording session. For very long findings, you might break them into 2-3 sections, but most findings are done in one dictation."
              />
              <FAQItem
                question="What happens if I cough or have background noise?"
                answer="Deepgram's AI filters out most background noise and interruptions. It's designed for real-world environments. If there's significant noise, try finding a quieter location or re-recording that section."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
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
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            Ready to Speak Your Reports?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg sm:text-xl mb-10 opacity-90 max-w-2xl mx-auto"
          >
            Join radiologists transforming their workflow with voice-powered report generation
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
              className="bg-white text-emerald-600 hover:bg-gray-100 px-10 py-6 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all"
              onClick={goToGenerate}
            >
              Generate Your First Report
              <Mic className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-emerald-600 px-10 py-6 text-lg font-bold rounded-xl transition-all"
              onClick={goToTemplates}
            >
              Browse Templates
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap justify-center items-center gap-6 text-sm opacity-90"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>No credit card</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>5 free reports</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>24/7 access</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-4">
            <Image
              src="/brand/Radly.png"
              alt="Radly Logo"
              width={60}
              height={60}
              className="w-15 h-15"
            />
            <div className="flex space-x-6 text-sm">
              <Link href="/legal/terms" className="text-gray-600 hover:text-emerald-600 transition-colors">
                Terms of Service
              </Link>
              <Link href="/legal/privacy" className="text-gray-600 hover:text-emerald-600 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/" className="text-gray-600 hover:text-emerald-600 transition-colors">
                Home
              </Link>
            </div>
            <p className="text-gray-500 text-sm">&copy; 2025 Radly. Powered by voice. Built for radiologists.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
