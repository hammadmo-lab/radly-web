"use client"

import React from 'react';
import { RefreshCw } from 'lucide-react';

export function MetricsLoading() {
  return (
    <div className="aurora-card flex h-96 items-center justify-center border border-[rgba(255,255,255,0.08)] p-10 text-center">
      <div className="space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(75,142,255,0.35)] bg-[rgba(75,142,255,0.16)] text-[#D7E3FF]">
          <RefreshCw className="h-5 w-5 animate-spin" />
        </div>
        <p className="text-lg font-semibold text-white">Loading metrics…</p>
        <p className="text-sm text-[rgba(207,207,207,0.65)]">
          Fetching real-time telemetry from Prometheus and Supabase logs.
        </p>
      </div>
    </div>
  );
}
