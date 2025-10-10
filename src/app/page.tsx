"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Zap, Shield, Users } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export default function Home() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
  }, []);

  function goToApp() {
    if (busy) return;
    setBusy(true);
    try {
      const href = authed ? "/app/templates" : "/login";
      router.push(href);
    } finally {
      setBusy(false);
    }
  }

  function goToDemo() {
    router.push("/demo");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted to-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">Radly</span>
          </div>
          <Button variant="default" onClick={goToApp} disabled={busy}>
            {busy ? "Loading…" : "Get Started"}
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-semibold text-foreground mb-6">
            AI-Powered Medical Report Generation
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transform your clinical findings into professional, accurate medical reports in
            seconds. Streamline your workflow with intelligent templates and automated
            generation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="default"
              className="w-full sm:w-auto"
              onClick={goToApp}
              disabled={busy}
            >
              {busy ? "Loading…" : "Start Generating Reports"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={goToDemo}
            >
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose Radly?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for healthcare professionals who demand accuracy, efficiency, and
            compliance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center hover:bg-muted/60 transition border-border">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="text-lg">Lightning Fast</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Generate comprehensive medical reports in seconds, not hours. Focus on
                patient care, not paperwork.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:bg-muted/60 transition border-border">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="text-lg">HIPAA Compliant</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Enterprise-grade security and compliance. Your patient data is protected
                with bank-level encryption.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:bg-muted/60 transition border-border">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="text-lg">Smart Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Pre-built templates for every specialty. Customize and save your own
                templates for consistent reporting.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:bg-muted/60 transition border-border">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="text-lg">Team Collaboration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Share templates, collaborate on reports, and maintain consistency across
                your entire medical team.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Medical Reporting?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of healthcare professionals who trust Radly for their reporting
            needs.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="bg-background text-primary hover:bg-muted"
            onClick={goToApp}
            disabled={busy}
          >
            {busy ? "Loading…" : "Get Started Today"}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-primary">Radly</span>
            </div>
            <div className="flex space-x-6">
              <Link href="/legal/terms" className="text-muted-foreground hover:text-primary">
                Terms of Service
              </Link>
              <Link href="/legal/privacy" className="text-muted-foreground hover:text-primary">
                Privacy Policy
              </Link>
            </div>
          </div>
          <div className="text-center text-muted-foreground mt-4">
            <p>&copy; 2024 Radly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
