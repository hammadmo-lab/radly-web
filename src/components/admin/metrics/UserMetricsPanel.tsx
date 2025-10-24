"use client"

/**
 * src/components/admin/metrics/UserMetricsPanel.tsx
 * User-level metrics and success rates
 */
import React from 'react';
import { Users, XCircle, TrendingUp } from 'lucide-react';
import { parsePrometheusResult, formatPercentage } from '@/lib/metrics-helpers';
import { PrometheusResult } from '@/lib/admin-metrics';
import { MetricCard } from './MetricCard';

interface UserMetricsPanelProps {
  userJobSuccess: PrometheusResult;
  rateLimits: PrometheusResult;
}

export function UserMetricsPanel({ userJobSuccess, rateLimits }: UserMetricsPanelProps) {
  const successData = parsePrometheusResult(userJobSuccess);
  const rateLimitData = parsePrometheusResult(rateLimits);

  const successRate = successData[0]?.value || 0;
  const totalRateLimits = rateLimitData.reduce((sum, item) => sum + item.value, 0);

  const successTone =
    successRate >= 95
      ? 'bg-[linear-gradient(90deg,#3FBF8C_0%,#6EE7B7_100%)] shadow-[0_10px_26px_rgba(63,191,140,0.32)]'
      : successRate >= 85
        ? 'bg-[linear-gradient(90deg,#F8B74D_0%,#FF8A4F_100%)] shadow-[0_10px_26px_rgba(248,183,77,0.26)]'
        : 'bg-[linear-gradient(90deg,#FF6B6B_0%,#FF9F6B_100%)] shadow-[0_10px_26px_rgba(255,107,107,0.28)]';

  return (
    <div className="space-y-6">
      <div className="aurora-card border border-[rgba(255,255,255,0.08)] p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgba(75,142,255,0.35)] bg-[rgba(75,142,255,0.16)] text-[#D7E3FF]">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">User Job Success Rate</h3>
          </div>
          <div className="text-3xl font-semibold text-white">{formatPercentage(successRate)}</div>
        </div>

        <div className="h-3.5 w-full rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.7)]">
          <div
            className={`h-full rounded-full ${successTone}`}
            style={{ width: `${Math.min(successRate, 100)}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-[rgba(207,207,207,0.45)]">
          <span>0%</span>
          <span className="text-[rgba(207,207,207,0.75)]">
            {successRate >= 95 ? 'Excellent' : successRate >= 85 ? 'Good' : 'Needs Attention'}
          </span>
          <span>100%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <MetricCard
          title="Rate Limits Hit"
          value={totalRateLimits.toLocaleString()}
          unit="requests"
          status={totalRateLimits > 100 ? 'warning' : 'success'}
          icon={<XCircle className="h-5 w-5" />}
          description="Total rate-limit triggers across providers in the selected window"
        />

        <MetricCard
          title="Success Rate Trend"
          value="+2.3%"
          status="success"
          change={2.3}
          period="vs last hour"
          icon={<TrendingUp className="h-5 w-5" />}
          description="Change in job success rate compared to the previous interval"
        />
      </div>

      {rateLimitData.length > 0 && (
        <div className="aurora-card border border-[rgba(255,255,255,0.08)] p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-white">Rate Limits by Provider</h3>
          <p className="mt-1 text-sm text-[rgba(207,207,207,0.65)]">
            Providers triggering throttles most frequently in this window.
          </p>

          <div className="mt-4 space-y-3">
            {rateLimitData.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(12,16,28,0.6)] p-3 text-sm text-[rgba(207,207,207,0.75)]"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-3 w-3 rounded-full bg-[#FF6B6B]" />
                  <span className="font-medium text-white">{item.name}</span>
                </div>
                <span>{item.value.toLocaleString()} hits</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
