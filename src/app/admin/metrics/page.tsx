'use client';

import React from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { MetricsDashboard } from '@/components/admin/metrics/MetricsDashboard';

export default function MetricsPage() {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-[var(--ds-bg-gradient)] text-white">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 neon-page-stack">
          <div className="neon-shell space-y-8 p-6 sm:p-8 md:p-10 backdrop-blur-xl">
            <MetricsDashboard />
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
