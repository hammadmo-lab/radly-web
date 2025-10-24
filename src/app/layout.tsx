import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { PerformanceMonitor } from "@/components/performance-monitor";
import { ClientPerformanceSetup } from "@/components/client-performance-setup";
import { TestModeIndicator } from "@/components/test-mode-indicator";
import { OfflineIndicator } from "@/components/shared/OfflineIndicator";
import { siteConfig } from "@/lib/siteConfig";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap', // Prevent FOIT (Flash of Invisible Text)
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  manifest: "/manifest.json",
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} preview`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.twitterHandle,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Radly",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0B1220',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const gaEnabled = gaMeasurementId && process.env.NEXT_PUBLIC_GA_ENABLED === "1";

  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${inter.variable} font-sans min-h-screen bg-background text-foreground antialiased`}>
        <Providers>
          {children}
        </Providers>
        <ClientPerformanceSetup />
        <PerformanceMonitor />
        <TestModeIndicator />
        <OfflineIndicator />
        {gaEnabled ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-setup" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}', { anonymize_ip: true });
              `}
            </Script>
          </>
        ) : null}
        {!gaEnabled && gaMeasurementId ? (
          <Script id="ga-disabled" strategy="afterInteractive">
            {`console.warn('Google Analytics detected but not injected. Set NEXT_PUBLIC_GA_ENABLED=1 and ensure your Content Security Policy allows https://www.googletagmanager.com and https://www.google-analytics.com.');`}
          </Script>
        ) : null}
        {!gaMeasurementId ? (
          <Script
            id="ga-placeholder"
            strategy="afterInteractive"
          >
            {`console.warn('NEXT_PUBLIC_GA_MEASUREMENT_ID is not set. Analytics events are not being recorded.');`}
          </Script>
        ) : null}
      </body>
    </html>
  );
}
