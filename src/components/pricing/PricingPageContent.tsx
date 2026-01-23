"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, ArrowRight } from "lucide-react";
import { PrimaryCTA, SecondaryCTA } from "@/components/marketing/PrimaryCTA";

export type Tier = {
    tier_id: number;
    tier_name: string;
    tier_display_name: string;
    monthly_report_limit: number;
    price_monthly: number;
    currency: string;
    features: string;
};

type PricingPageContentProps = {
    tiers: Tier[];
    region: string | null;
};

function formatPrice(tier: Tier) {
    if (tier.price_monthly === 0) return "Free";
    return `${tier.price_monthly.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${tier.currency}`;
}

const faqs = [
    {
        question: "How does the free trial work?",
        answer: "Every new account comes with 5 complimentary reports. You can try all features immediately. No credit card is required to sign up."
    },
    {
        question: "Can I upgrade or downgrade later?",
        answer: "Yes. You can switch plans at any time from your account settings. Upgrades take effect immediately."
    },
    {
        question: "Do reports expire?",
        answer: "Your report quota resets at the beginning of each billing cycle (monthly). Unused reports do not roll over."
    },
    {
        question: "Is there a long-term contract?",
        answer: "No. Radly is a monthly subscription service. You can cancel at any time."
    }
];

export function PricingPageContent({ tiers, region }: PricingPageContentProps) {
    return (
        <div className="space-y-20">
            {/* 1. Header is now simpler as per layout */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                    Choose the plan that fits<br />your reporting volume
                </h1>
            </div>

            {/* 2. Grid Layout - 4 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
                {tiers.map((tier) => {
                    const isPopular = tier.tier_name === "professional";
                    const isFree = tier.tier_name === "free";

                    return (
                        <div
                            key={tier.tier_id}
                            className={`relative flex flex-col rounded-2xl border bg-[rgba(12,16,28,0.6)] p-6 transition-all duration-200 
                ${isPopular
                                    ? "border-[#F5D791] shadow-[0_0_30px_rgba(245,215,145,0.1)] scale-105 z-10"
                                    : "border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)]"
                                }`}
                        >
                            {isPopular && (
                                <div className="absolute -top-3 left-0 right-0 flex justify-center">
                                    <span className="bg-[#F5D791] text-[#0B1220] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                                        ★ Popular
                                    </span>
                                </div>
                            )}

                            <div className="text-center space-y-1 mb-6">
                                <h3 className="text-xl font-semibold text-white">{tier.tier_display_name}</h3>
                                <div className="text-2xl font-bold text-white">
                                    {tier.price_monthly === 0 ? "0" : tier.price_monthly.toLocaleString()}
                                    <span className="text-base font-normal text-[rgba(207,207,207,0.6)] ml-1">{tier.currency}</span>
                                </div>
                                <div className="text-sm text-[rgba(207,207,207,0.6)]">
                                    {tier.monthly_report_limit} / month
                                </div>
                            </div>

                            <div className="mt-auto">
                                <PrimaryCTA
                                    href={isFree ? "/auth/signin" : `/pricing/checkout?tier=${tier.tier_name}&region=${region}`}
                                    className={`w-full justify-center ${!isPopular && !isFree ? "!bg-[rgba(255,255,255,0.1)] !text-white hover:!bg-[rgba(255,255,255,0.15)]" : ""}`}
                                    ariaLabel={`Select ${tier.tier_display_name} plan`}
                                >
                                    {isFree ? "Start Free" : "Subscribe"}
                                </PrimaryCTA>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 3. All Plans Include */}
            <div className="text-center space-y-6 border-t border-[rgba(255,255,255,0.1)] pt-12">
                <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-[rgba(207,207,207,0.55)]">
                    All plans include
                </h3>
                <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                    <div className="flex items-center gap-2 text-[rgba(207,207,207,0.9)]">
                        <Check className="w-5 h-5 text-[#F5D791]" />
                        <span>Full template library</span>
                    </div>
                    <div className="flex items-center gap-2 text-[rgba(207,207,207,0.9)]">
                        <Check className="w-5 h-5 text-[#F5D791]" />
                        <span>DOCX export</span>
                    </div>
                    <div className="flex items-center gap-2 text-[rgba(207,207,207,0.9)]">
                        <Check className="w-5 h-5 text-[#F5D791]" />
                        <span>Email support</span>
                    </div>
                </div>
            </div>


            {/* 4. App Store Links */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 pb-12 border-t border-[rgba(255,255,255,0.1)] pt-12">
                <span className="text-sm font-medium text-[#F5D791] tracking-wide uppercase">📱 Get the Mobile App</span>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a
                        href="https://apps.apple.com/app/radly-assistant/id6754604993"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-[#2A251F] to-[#1A1714] border-2 border-[#F5D791]/50 rounded-2xl hover:border-[#F5D791] hover:shadow-[0_0_20px_rgba(245,215,145,0.3)] transition-all duration-300 group"
                    >
                        <svg className="w-8 h-8 text-[#F5D791]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                        </svg>
                        <div className="flex flex-col">
                            <span className="text-xs text-[#A89F91] leading-tight">Download on the</span>
                            <span className="text-base font-bold text-[#F0E6D3] leading-tight group-hover:text-[#F5D791] transition-colors">App Store</span>
                        </div>
                    </a>
                    <div className="flex items-center gap-3 px-6 py-3.5 bg-[#1A1714]/80 border border-[#3A332B] rounded-2xl">
                        <svg className="w-8 h-8 text-[#6B6560]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.807 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 9.99l-2.302 2.302-8.634-8.634z" />
                        </svg>
                        <div className="flex flex-col">
                            <span className="text-xs text-[#6B6560] leading-tight">Android</span>
                            <span className="text-base font-bold text-[#8A857D] leading-tight">Coming Soon</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. Pricing FAQ - Accordion */}
            <div className="max-w-2xl mx-auto space-y-8 border-t border-[rgba(255,255,255,0.1)] pt-12">
                <h3 className="text-center text-xl font-semibold">Pricing FAQ</h3>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <FAQItem key={index} question={faq.question} answer={faq.answer} />
                    ))}
                </div>
            </div>

            {/* 5. Enterprise CTA */}
            <div className="text-center pt-8 pb-8">
                <p className="text-[rgba(207,207,207,0.75)]">
                    Need enterprise pricing?{" "}
                    <Link href="mailto:sales@radly.app" className="text-[#F5D791] hover:underline underline-offset-4">
                        Talk to sales
                    </Link>
                </p>
            </div>

        </div>
    );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-[rgba(255,255,255,0.1)] pb-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between text-left group"
            >
                <span className="text-base text-[rgba(207,207,207,0.9)] group-hover:text-white transition-colors">
                    {question}
                </span>
                <ChevronDown className={`w-5 h-5 text-[rgba(207,207,207,0.5)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <div
                className={`grid transition-all duration-200 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"}`}
            >
                <div className="overflow-hidden">
                    <p className="text-sm text-[rgba(207,207,207,0.6)] leading-relaxed">
                        {answer}
                    </p>
                </div>
            </div>
        </div>
    );
}
