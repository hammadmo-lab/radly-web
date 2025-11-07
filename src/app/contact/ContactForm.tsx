"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Form submission would be handled here (integrate with your backend or email service)
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <div className="aurora-card border border-[rgba(255,255,255,0.1)] p-8 lg:p-12">
      {isSubmitted && (
        <div className="mb-6 p-4 rounded-lg bg-[rgba(63,191,140,0.15)] border border-[rgba(63,191,140,0.3)] text-[rgba(63,191,140,0.85)]">
          Thank you for reaching out! We'll get back to you soon.
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-semibold text-[rgba(207,207,207,0.9)]"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Your name"
              required
              className="w-full px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder:text-[rgba(207,207,207,0.5)] focus:outline-none focus:border-[rgba(143,130,255,0.5)] transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-semibold text-[rgba(207,207,207,0.9)]"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder:text-[rgba(207,207,207,0.5)] focus:outline-none focus:border-[rgba(143,130,255,0.5)] transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="inquiry-type"
            className="text-sm font-semibold text-[rgba(207,207,207,0.9)]"
          >
            Inquiry Type
          </label>
          <select
            id="inquiry-type"
            name="inquiry-type"
            required
            className="w-full px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white focus:outline-none focus:border-[rgba(143,130,255,0.5)] transition-colors appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238f82ff' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.75rem center",
              backgroundSize: "1.5em 1.5em",
              paddingRight: "2.5rem",
            }}
          >
            <option value="">Select inquiry type...</option>
            <option value="support">General Support</option>
            <option value="sales">Sales & Enterprise</option>
            <option value="partnership">Partnership Opportunities</option>
            <option value="careers">Careers</option>
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="message"
            className="text-sm font-semibold text-[rgba(207,207,207,0.9)]"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            placeholder="Tell us more about your inquiry..."
            rows={6}
            required
            className="w-full px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder:text-[rgba(207,207,207,0.5)] focus:outline-none focus:border-[rgba(143,130,255,0.5)] transition-colors resize-none"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            id="privacy"
            name="privacy"
            required
            className="w-4 h-4 rounded border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.05)] checked:bg-[rgba(143,130,255,0.5)] checked:border-[rgba(143,130,255,0.5)] cursor-pointer"
          />
          <label htmlFor="privacy" className="text-sm text-[rgba(207,207,207,0.75)]">
            I agree to our{" "}
            <a
              href="/privacy"
              className="text-[rgba(143,130,255,0.85)] hover:text-[rgba(143,130,255,1)] transition-colors"
            >
              Privacy Policy
            </a>
          </label>
        </div>

        <Button
          type="submit"
          size="lg"
          className="cta-primary h-12 sm:h-13 rounded-2xl px-6 sm:px-8 text-sm sm:text-base font-semibold shadow-[0_24px_64px_rgba(38,83,255,0.42)] w-full sm:w-auto min-h-[44px] touch-manipulation"
        >
          Send Message
        </Button>
      </form>
    </div>
  );
}
