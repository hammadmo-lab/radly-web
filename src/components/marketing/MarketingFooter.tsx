import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/siteConfig";

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[rgba(255,255,255,0.08)] bg-[rgba(26,21,16,0.85)] px-6 py-12 text-sm text-[#E8DCC8] backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
        <div className="flex flex-col items-center gap-4 sm:items-start">
          <Image src="/brand/radly-icon-new.png" width={56} height={56} alt="Radly logo" className="h-14 w-14" />
          <p className="max-w-sm text-xs uppercase tracking-[0.28em] text-[rgba(232,220,200,0.8)]">
            {siteConfig.shortName} assists radiologists. Clinicians review and finalize every report.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs uppercase tracking-[0.28em] text-[rgba(232,220,200,0.8)] sm:justify-end">
          <Link className="transition-colors hover:text-[#D4B483]" href="/about">
            About
          </Link>
          <Link className="transition-colors hover:text-[#D4B483]" href="/faq">
            FAQ
          </Link>
          <Link className="transition-colors hover:text-[#D4B483]" href="/contact">
            Contact
          </Link>
          <Link className="transition-colors hover:text-[#D4B483]" href="/privacy">
            Privacy
          </Link>
          <Link className="transition-colors hover:text-[#D4B483]" href="/terms">
            Terms
          </Link>
          <Link className="transition-colors hover:text-[#D4B483]" href="/security">
            Security
          </Link>
          <Link className="transition-colors hover:text-[#D4B483]" href="/validation">
            Validation
          </Link>
          <Link className="transition-colors hover:text-[#D4B483]" href="/instructions">
            Instructions
          </Link>
          <Link className="transition-colors hover:text-[#D4B483]" href="/accessibility">
            Accessibility
          </Link>
        </div>
      </div>
      <div className="mx-auto mt-6 w-full max-w-6xl text-center text-xs uppercase tracking-[0.24em] text-[rgba(168,159,145,0.7)]">
        © {year} {siteConfig.shortName}. Voice-supported reporting built to support clinical judgment.
      </div>
    </footer>
  );
}
