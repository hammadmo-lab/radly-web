"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Zap, Shield, Users, Upload, Brain, CheckCircle, Star, ArrowRight, Clock, Target, Layout } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export default function Home() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data } = await supabase.auth.getSession();
        setAuthed(!!data.session);
      } catch (error) {
        console.warn('Auth check failed:', error);
        setAuthed(false);
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
      <section className="relative overflow-hidden">
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
            
            {/* Tagline */}
            <div className="inline-flex items-center px-4 py-2 bg-gradient-subtle-brand rounded-full text-sm font-medium text-gray-700 mb-6">
              <span className="w-2 h-2 bg-secondary rounded-full mr-2"></span>
              AI Radiology Reports, Simplified
            </div>
            
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Transform Your{" "}
              <span className="text-gradient-brand">Radiology Workflow</span>
            </h1>
            
            {/* Sub-headline */}
            <p className="text-xl sm:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Automate professional, accurate medical reports in seconds. 
              Focus on patient care while AI handles the documentation.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button
                size="lg"
                className="bg-secondary hover:bg-secondary-dark text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                onClick={goToApp}
                disabled={busy}
              >
                {busy ? "Loading…" : "Start Generating Reports"}
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
            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-secondary" />
                <span className="text-sm font-medium">HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-secondary" />
                <span className="text-sm font-medium">Medically Accurate</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-secondary" />
                <span className="text-sm font-medium">Lightning Fast</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Radly Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Why Choose Radly?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built for healthcare professionals who demand accuracy, efficiency, and compliance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Lightning Fast</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Generate comprehensive medical reports in seconds, not hours. 
                  Focus on patient care, not paperwork.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Medically Accurate</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Enterprise-grade AI trained on medical standards. 
                  Your reports meet professional accuracy requirements.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Layout className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Smart Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Pre-built templates for every specialty. 
                  Customize and save your own for consistent reporting.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Team Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Share templates, collaborate on reports, and maintain 
                  consistency across your entire medical team.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-subtle-brand">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple, intuitive workflow designed for busy healthcare professionals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Upload className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Upload Scan</h3>
              <p className="text-gray-600 leading-relaxed">
                Upload your medical images or input clinical findings. 
                Our secure platform handles all file types.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Brain className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. AI Generates Report</h3>
              <p className="text-gray-600 leading-relaxed">
                Advanced AI analyzes your data and generates a comprehensive, 
                professional medical report in seconds.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircle className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Review & Finalize</h3>
              <p className="text-gray-600 leading-relaxed">
                Review the generated report, make any necessary edits, 
                and finalize for your patient records.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Trusted by Healthcare Professionals
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what medical professionals are saying about Radly.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  "Radly has revolutionized our reporting process. What used to take hours 
                  now takes minutes, and the accuracy is outstanding."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-brand rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-semibold">DR</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Dr. Sarah Johnson</p>
                    <p className="text-gray-500 text-sm">Radiologist, City Hospital</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  "The team collaboration features are fantastic. We can now maintain 
                  consistency across all our reports and templates."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-teal-purple rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-semibold">MR</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Dr. Michael Rodriguez</p>
                    <p className="text-gray-500 text-sm">Chief Medical Officer</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  "The HIPAA compliance gives us peace of mind. We can focus on patient care 
                  knowing our data is secure."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-green-teal rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-semibold">AL</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Dr. Amanda Lee</p>
                    <p className="text-gray-500 text-sm">Medical Director</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-brand text-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Transform Your Medical Reporting?
          </h2>
          <p className="text-xl mb-10 opacity-90 max-w-3xl mx-auto">
            Join thousands of healthcare professionals who trust Radly for their reporting needs. 
            Start generating professional reports today.
          </p>
          <Button
            size="lg"
            className="bg-white text-secondary hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            onClick={goToApp}
            disabled={busy}
          >
            {busy ? "Loading…" : "Get Started Today"}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
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