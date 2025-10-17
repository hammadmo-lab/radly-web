'use client';

import React from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { MetricsDashboard } from '@/components/admin/metrics/MetricsDashboard';

export default function MetricsPage() {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MetricsDashboard />
        </div>
      </div>
    </AdminGuard>
  );
}