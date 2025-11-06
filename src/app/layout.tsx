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
  // Always enable GA when a measurement ID is present (dev + prod).
  const gaEnabled = !!gaMeasurementId;
  const isDev = process.env.NODE_ENV === 'development';

  // Organization Schema for SEO
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Radly",
    "alternateName": "Radly Assistant",
    "url": "https://radly.app",
    "description": "Voice-supported AI assistant for structured radiology reporting",
    "logo": "https://radly.app/icon-512.png",
    "sameAs": [
      "https://www.facebook.com/radlyapp"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+201005556212",
      "contactType": "Customer Support",
      "email": "support@radly.app"
    },
    "areaServed": {
      "@type": "Country",
      "name": ["Worldwide", "Egypt"]
    },
    "knowsAbout": [
      "Radiology",
      "Medical AI",
      "Clinical Documentation",
      "Voice Recognition",
      "Healthcare Technology"
    ]
  };

  const fbAppId = process.env.NEXT_PUBLIC_FB_APP_ID;

  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className="overflow-x-hidden">
      <head>
        {/* Facebook App ID for social sharing - required for proper Open Graph rendering */}
        {fbAppId && <meta property="fb:app_id" content={fbAppId} />}

        <script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className={`${inter.variable} font-sans min-h-screen bg-background text-foreground antialiased overflow-x-hidden`}>
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
        {/* No disabled warning: GA is injected whenever a measurement ID is present. */}
        {!gaMeasurementId && isDev ? (
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
