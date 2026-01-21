"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCallback } from "react";

type CommonProps = {
  href: string;
  children: React.ReactNode;
  eventName?: string;
  className?: string;
  ariaLabel?: string;
};

export function PrimaryCTA({ href, children, eventName = "primary-cta-click", className, ariaLabel }: CommonProps) {
  const handleClick = useCallback(() => {
    if (typeof window !== "undefined") {
      const w = window as typeof window & { gtag?: (...args: unknown[]) => void };
      if (typeof w.gtag === "function") {
        w.gtag("event", eventName, {
          event_category: "CTA",
          event_label: href,
        });
      }
    }
  }, [eventName, href]);

  return (
    <Button
      asChild
      size="lg"
      className={cn(
        "cta-primary h-12 sm:h-13 rounded-2xl px-6 sm:px-8 text-sm sm:text-base font-semibold shadow-[0_8px_32px_rgba(245,215,145,0.35)] focus-visible:ring-offset-0 w-full sm:w-auto min-h-[44px] touch-manipulation bg-gradient-to-r from-[#F5D791] to-[#E5C478] hover:from-[#FFE8B0] hover:to-[#F5D791] text-[#1A1510] border border-[rgba(255,255,255,0.15)]",
        className
      )}
    >
      <Link href={href} aria-label={ariaLabel ?? undefined} onClick={handleClick}>
        {children}
      </Link>
    </Button>
  );
}

export function SecondaryCTA({ href, children, className, ariaLabel }: Omit<CommonProps, "eventName">) {
  return (
    <Button
      asChild
      size="lg"
      variant="outline"
      className={cn(
        "cta-secondary h-12 sm:h-13 rounded-2xl border-[rgba(255,255,255,0.15)] bg-[rgba(26,21,16,0.6)] px-6 sm:px-8 text-sm sm:text-base font-semibold text-[rgba(232,220,200,0.9)] backdrop-blur focus-visible:ring-offset-0 hover:bg-[rgba(212,180,131,0.1)] hover:border-[rgba(212,180,131,0.3)] hover:text-white w-full sm:w-auto min-h-[44px] touch-manipulation",
        className
      )}
    >
      <Link href={href} aria-label={ariaLabel ?? undefined}>
        {children}
      </Link>
    </Button>
  );
}
