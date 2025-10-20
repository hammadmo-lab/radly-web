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
  Settings
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
          <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-secondary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold">Back to Home</span>
          </Link>
          <Button onClick={goToApp} className="bg-secondary hover:bg-secondary-dark">
            Go to Dashboard
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 lg:py-16">
        <div className="absolute inset-0 bg-gradient-hero opacity-50"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-green-teal rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-teal-purple rounded-full opacity-20 blur-3xl"></div>

        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-50 to-white border border-green-500 rounded-full text-sm font-semibold text-gray-700 mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-green-600 mr-2" />
              Quick Start Guide
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Generate Your First Report in{" "}
              <span className="text-gradient-brand">Under 90 Seconds</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              A simple 4-step guide to creating professional, accurate radiology reports with Radly
            </p>

            {/* Progress Steps Preview */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">Template</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">Patient Info</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-400 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">Findings</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">Export</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Workflow Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-8">

            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-2 border-purple-200 hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-700 font-bold text-sm">1</span>
                        </div>
                        <CardTitle className="text-2xl text-gray-900">Choose Your Template</CardTitle>
                      </div>
                      <CardDescription className="text-base text-gray-600">
                        Browse 100+ medical templates including CT, MRI, X-ray, and ultrasound scans
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-white border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      Key Features
                    </h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">•</span>
                        <span>Templates organized by modality and body region</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">•</span>
                        <span>Each template follows medical reporting standards (LI-RADS, BI-RADS, Lung-RADS)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">•</span>
                        <span>Use search to quickly find your template</span>
                      </li>
                    </ul>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-purple-50 p-3 rounded-lg">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span className="font-semibold">Time: ~5 seconds</span>
                  </div>
                  <Button onClick={goToTemplates} variant="outline" className="w-full border-purple-300 hover:bg-purple-50 hover:border-purple-400">
                    Browse Templates
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border-2 border-blue-200 hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <User className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-700 font-bold text-sm">2</span>
                        </div>
                        <CardTitle className="text-2xl text-gray-900">Fill in Patient & Clinical Information</CardTitle>
                      </div>
                      <CardDescription className="text-base text-gray-600">
                        Enter patient demographics and clinical history in structured forms
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      Required Fields
                    </h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>Patient name, age, gender</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>Clinical indication and reason for exam</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>Relevant medical history</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>All fields are validated for accuracy</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-blue-700">Tip:</span> Your profile settings are automatically filled for radiologist information
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold">Time: ~20 seconds</span>
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
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Stethoscope className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-700 font-bold text-sm">3</span>
                        </div>
                        <CardTitle className="text-2xl text-gray-900">Enter Your Findings</CardTitle>
                      </div>
                      <CardDescription className="text-base text-gray-600">
                        Describe what you see - Radly's AI will structure it professionally
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-white border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      How It Works
                    </h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        <span>Use natural language - no need for perfect formatting</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        <span>AI validates medical terminology to prevent hallucinations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        <span>Built-in clinical accuracy checks</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        <span>Real-time processing with progress indicators</span>
                      </li>
                    </ul>
                  </div>

                  {/* Example Box */}
                  <div className="bg-gray-900 rounded-lg p-4 space-y-3">
                    <div>
                      <div className="text-xs text-gray-400 mb-2 font-semibold uppercase">Your Input:</div>
                      <div className="bg-gray-800 rounded p-3 text-sm text-gray-200 font-mono">
                        Small nodule in right upper lobe, 8mm, spiculated margins
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <ArrowRight className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-xs text-green-400 mb-2 font-semibold uppercase">Radly Output:</div>
                      <div className="bg-gray-800 rounded p-3 text-sm text-gray-200 font-mono leading-relaxed">
                        A small spiculated nodule measuring 8 mm is identified in the right upper lobe at the level of segment 1b. The nodule demonstrates irregular margins with peripheral spiculation...
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="font-semibold">Time: ~30-40 seconds (AI processing)</span>
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
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Download className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-orange-700 font-bold text-sm">4</span>
                        </div>
                        <CardTitle className="text-2xl text-gray-900">Review & Export</CardTitle>
                      </div>
                      <CardDescription className="text-base text-gray-600">
                        Review your professionally formatted report and export as DOCX
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-r from-orange-50 to-white border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-orange-600" />
                      What You Get
                    </h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>Preview the complete formatted report</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>One-click DOCX download</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>Report saved to your dashboard for future access</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>Professional formatting ready for your PACS system</span>
                      </li>
                    </ul>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-orange-50 p-3 rounded-lg">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="font-semibold">Time: Instant download</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          </div>

          {/* Total Time Summary */}
          <div className="max-w-5xl mx-auto mt-12">
            <div className="bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-300 rounded-2xl p-8 text-center shadow-lg">
              <div className="text-3xl font-bold text-gray-900 mb-2">Total Time: Under 90 Seconds</div>
              <p className="text-lg text-gray-700">From template selection to professional DOCX in your hands</p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Makes Radly Different
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Purpose-built features for radiologists, not generic AI
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="text-center hover:shadow-xl transition-all duration-300 border border-gray-200">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-900">AI-Powered Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Built-in validators prevent hallucinations and verify medical terminology against clinical databases
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 border border-gray-200">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-900">Time-Saving Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Pre-built structures for common procedures with consistent formatting - no manual Word editing needed
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 border border-gray-200">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-900">Standards Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Reports follow LI-RADS, BI-RADS, and Lung-RADS standards automatically
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 border border-gray-200">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-900">Professional Output</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Ready-to-use DOCX files with proper medical formatting, customizable with your practice details
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Power User Features Section */}
      <section className="py-16 lg:py-20 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-50 to-orange-50 border border-purple-300 rounded-full text-sm font-semibold text-gray-700 mb-4 shadow-sm">
                <Settings className="w-4 h-4 text-purple-600 mr-2" />
                Power User Feature
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Save Time with Custom Instructions
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Set your preferences once, and Radly remembers them forever
              </p>
            </div>

            <Card className="border-2 border-purple-200 shadow-xl">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Settings className="w-6 h-6 text-purple-600" />
                      How It Works
                    </h3>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      Click the ⚙️ Settings icon on any template card to add custom instructions that apply automatically to all future reports with that template.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="w-4 h-4 text-purple-600" />
                        </div>
                        <p className="text-gray-700">
                          <span className="font-semibold">Example:</span> &quot;Always include comparison with prior studies&quot;
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="w-4 h-4 text-purple-600" />
                        </div>
                        <p className="text-gray-700">
                          <span className="font-semibold">Example:</span> &quot;Use metric measurements only&quot;
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="w-4 h-4 text-purple-600" />
                        </div>
                        <p className="text-gray-700">
                          <span className="font-semibold">Example:</span> &quot;Always mention presence or absence of lymphadenopathy&quot;
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="w-4 h-4 text-purple-600" />
                        </div>
                        <p className="text-gray-700">
                          <span className="font-semibold">Example:</span> &quot;Include Fleischner Society guidelines for nodules&quot;
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-orange-50 rounded-xl p-6 border-2 border-purple-200">
                    <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">Chest CT Template</h4>
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Settings className="w-4 h-4 text-purple-600" />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 italic">
                        &quot;Always include Fleischner recommendations and compare with prior studies&quot;
                      </p>
                    </div>
                    <div className="flex items-center justify-center">
                      <ArrowRight className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mt-4">
                      <div className="flex items-start gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-semibold text-green-900">Applied Automatically</p>
                      </div>
                      <p className="text-sm text-gray-700">
                        Every future report with this template will include your custom instructions - no need to repeat yourself!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-purple-700">Pro Tip:</span> Find the ⚙️ Settings icon on the top-right corner of each template card in the Templates page. Your instructions are saved per template and apply to all future generations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-300 rounded-full text-sm font-semibold text-gray-700 mb-4 shadow-sm">
                <Sparkles className="w-4 h-4 text-purple-600 mr-2" />
                Try It Yourself
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Interactive Demo
              </h2>
              <p className="text-xl text-gray-600">
                Experience the full Radly workflow - no sign-in required
              </p>
            </div>

            <Card className="border-2 border-purple-300 shadow-2xl">
              <CardContent className="p-8">
                <InteractiveDemo />
              </CardContent>
            </Card>

            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">Ready to create real reports?</p>
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-bold rounded-xl shadow-lg"
                onClick={goToApp}
              >
                Sign Up & Start Generating
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Tips Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Quick Tips for Success
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Beginner Tips */}
              <Card className="border border-green-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    Beginner Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Set up your profile in Settings to auto-fill radiologist information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Use the search bar in templates to quickly find what you need</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Check your usage dashboard to track subscription limits</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Pro Tips */}
              <Card className="border border-purple-200 hover:shadow-lg transition-shadow">
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
                      <span><strong>Click the ⚙️ Settings icon</strong> on templates to save custom instructions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Bookmark frequently used templates for faster access</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Review the &quot;Recent Reports&quot; section to reuse similar cases</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Use specific anatomical landmarks for more accurate reports</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-gray-600">
                Common questions from new users
              </p>
            </div>

            <div className="space-y-4">
              <FAQItem
                question="What if I can't find my template?"
                answer="Use the search bar or browse by modality (CT, MRI, X-ray, Ultrasound). If you need a custom template, contact our support team and we'll work with you to create one."
              />
              <FAQItem
                question="How long does report generation take?"
                answer="Typically 30-60 seconds, depending on queue length and complexity. You'll see real-time progress indicators showing exactly where your report is in the process."
              />
              <FAQItem
                question="What happens if I run out of reports?"
                answer="Check the Pricing page for subscription upgrades. We offer flexible plans based on your volume needs, from individual radiologists to large practices."
              />
              <FAQItem
                question="Can I use Radly on mobile devices?"
                answer="Yes! Radly is fully responsive and works on tablets and smartphones. However, for the best experience, we recommend using a desktop or laptop."
              />
              <FAQItem
                question="What file format are the reports?"
                answer="Reports are exported as DOCX (Microsoft Word) files with professional formatting. You can open and edit them in Word, Google Docs, or any compatible word processor."
              />
              <FAQItem
                question="How do I update my radiologist information?"
                answer="Go to Settings in your dashboard to update your name, credentials, and practice information. These details will automatically populate in all future reports."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-brand text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            Ready to Get Started?
          </h2>
          <p className="text-lg sm:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join radiologists who are saving 10+ hours every week with Radly
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-100 px-10 py-6 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
              onClick={goToGenerate}
            >
              Generate Your First Report
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-10 py-6 text-lg font-bold rounded-xl transition-all duration-300"
              onClick={goToTemplates}
            >
              Browse Templates
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-sm opacity-90">
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
              <span>Available 24/7</span>
            </div>
          </div>
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
              <Link href="/legal/terms" className="text-gray-600 hover:text-secondary transition-colors">
                Terms of Service
              </Link>
              <Link href="/legal/privacy" className="text-gray-600 hover:text-secondary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/" className="text-gray-600 hover:text-secondary transition-colors">
                Home
              </Link>
            </div>
            <p className="text-gray-500 text-sm">&copy; 2025 Radly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
