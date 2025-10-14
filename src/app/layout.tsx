import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { PerformanceMonitor } from "@/components/performance-monitor";
import { ClientPerformanceSetup } from "@/components/client-performance-setup";
import { TestModeIndicator } from "@/components/test-mode-indicator";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans min-h-screen bg-background text-foreground antialiased`}>
        <Providers>
          {children}
        </Providers>
        <ClientPerformanceSetup />
        <PerformanceMonitor />
        <TestModeIndicator />
      </body>
    </html>
  );
}
