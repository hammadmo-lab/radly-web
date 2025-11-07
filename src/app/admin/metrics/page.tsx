'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { AdminGuard } from '@/components/admin/AdminGuard';

// Dynamically import MetricsDashboard to reduce initial bundle size
// Chart.js and related dependencies are only loaded when admin accesses metrics page
const MetricsDashboard = dynamic(
  () => import('@/components/admin/metrics/MetricsDashboard').then(mod => ({ default: mod.MetricsDashboard })),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-8">
        <div className="h-12 bg-[rgba(255,255,255,0.05)] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-[rgba(255,255,255,0.05)] rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-[rgba(255,255,255,0.05)] rounded-lg animate-pulse" />
      </div>
    )
  }
);

export default function MetricsPage() {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-[var(--ds-bg-gradient)] text-white">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 neon-page-stack">
          <div className="neon-shell space-y-8 p-6 sm:p-8 md:p-10 backdrop-blur-xl">
            <Suspense fallback={<div className="h-96 bg-[rgba(255,255,255,0.05)] rounded-lg animate-pulse" />}>
              <MetricsDashboard />
            </Suspense>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
