import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { PerformanceMonitor } from "@/components/performance-monitor";
import { ClientPerformanceSetup } from "@/components/client-performance-setup";
import { TestModeIndicator } from "@/components/test-mode-indicator";
import { OfflineIndicator } from "@/components/shared/OfflineIndicator";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap', // Prevent FOIT (Flash of Invisible Text)
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Radly - Medical Report Generation",
  description: "AI-powered medical report generation platform",
  manifest: "/manifest.json",
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
      </body>
    </html>
  );
}
