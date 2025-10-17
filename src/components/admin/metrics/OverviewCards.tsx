/**
 * src/components/admin/metrics/OverviewCards.tsx
 * Overview KPI cards for the top of the dashboard
 */
import React from 'react';
import { MetricCard } from './MetricCard';
import { ResponsiveGrid } from './ResponsiveGrid';
import { Shield, Database, DollarSign, AlertTriangle } from 'lucide-react';
import { formatCost, formatPercentage, getStatusColor, parsePrometheusResult } from '@/lib/metrics-helpers';
import { PrometheusResult } from '@/lib/admin-metrics';

interface OverviewCardsProps {
  data: {
    sla_compliance?: PrometheusResult;
    queue_saturation?: PrometheusResult;
    llm_cost_hourly?: PrometheusResult;
    error_rate?: PrometheusResult;
  };
}

export function OverviewCards({ data }: OverviewCardsProps) {
  const slaCompliance = parsePrometheusResult(data.sla_compliance || { data: { result: [] } })[0]?.value || 0;
  const queueSaturation = parsePrometheusResult(data.queue_saturation || { data: { result: [] } })[0]?.value || 0;
  const hourlyCost = parsePrometheusResult(data.llm_cost_hourly || { data: { result: [] } })[0]?.value || 0;
  const errorRate = parsePrometheusResult(data.error_rate || { data: { result: [] } })[0]?.value || 0;

  return (
    <ResponsiveGrid 
      cols={{ default: 1, sm: 2, lg: 4 }}
      className="mb-8"
    >
      <MetricCard
        title="SLA Compliance"
        value={formatPercentage(slaCompliance)}
        status={getStatusColor(slaCompliance, { success: 95, warning: 90 })}
        icon={<Shield className="h-5 w-5" />}
      />
      
      <MetricCard
        title="Queue Saturation"
        value={formatPercentage(queueSaturation)}
        status={getStatusColor(queueSaturation, { success: 60, warning: 80 })}
        icon={<Database className="h-5 w-5" />}
      />
      
      <MetricCard
        title="Hourly LLM Cost"
        value={formatCost(hourlyCost)}
        status="success"
        icon={<DollarSign className="h-5 w-5" />}
      />
      
      <MetricCard
        title="Error Rate"
        value={formatPercentage(errorRate)}
        status={getStatusColor(errorRate, { success: 1, warning: 2 })}
        icon={<AlertTriangle className="h-5 w-5" />}
      />
    </ResponsiveGrid>
  );
}
