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
        "cta-primary h-13 rounded-2xl px-8 text-base font-semibold shadow-[0_24px_64px_rgba(38,83,255,0.42)] focus-visible:ring-offset-0",
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
        "cta-secondary h-13 rounded-2xl border-[rgba(255,255,255,0.18)] bg-[rgba(12,16,28,0.72)] px-8 text-base font-semibold text-[rgba(207,207,207,0.88)] backdrop-blur focus-visible:ring-offset-0 hover:bg-[rgba(12,16,28,0.85)] hover:text-white",
        className
      )}
    >
      <Link href={href} aria-label={ariaLabel ?? undefined}>
        {children}
      </Link>
    </Button>
  );
}
