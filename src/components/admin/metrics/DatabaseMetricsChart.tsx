"use client"

/**
 * src/components/admin/metrics/DatabaseMetricsChart.tsx
 * Database connection pool usage visualization
 */
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { parsePrometheusResult } from '@/lib/metrics-helpers';
import { PrometheusResult } from '@/lib/admin-metrics';
import { cn } from '@/lib/utils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface DatabaseMetricsChartProps {
  data: PrometheusResult;
}

export function DatabaseMetricsChart({ data }: DatabaseMetricsChartProps) {
  const poolData = parsePrometheusResult(data);

  const totalConnections = 20;
  const inUseConnections = poolData[0]?.value || 0;
  const availableConnections = Math.max(totalConnections - inUseConnections, 0);
  const usagePercentage = (inUseConnections / totalConnections) * 100;

  const axisColor = 'rgba(215,227,255,0.78)';
  const gridColor = 'rgba(75,142,255,0.18)';

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: axisColor,
        },
      },
      title: {
        display: true,
        text: 'Database Connection Pool Usage',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        color: '#D7E3FF',
      },
      tooltip: {
        backgroundColor: 'rgba(12,16,28,0.92)',
        titleColor: '#FFFFFF',
        bodyColor: '#D7E3FF',
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (this: any, tooltipItem: any) {
            return `${tooltipItem.dataset.label}: ${tooltipItem.parsed.y} connections`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Connections',
          color: axisColor,
        },
        ticks: {
          color: axisColor,
        },
        grid: {
          color: gridColor,
          drawBorder: false,
        },
      },
      x: {
        ticks: {
          color: axisColor,
        },
        grid: {
          display: false,
        },
      },
    },
  };

  const chartConfig = {
    labels: ['Connection Pool'],
    datasets: [
      {
        label: 'Available',
        data: [availableConnections],
        backgroundColor: 'rgba(63,191,140,0.2)',
        borderColor: '#3FBF8C',
        borderWidth: 2,
        borderRadius: 12,
      },
      {
        label: 'In Use',
        data: [inUseConnections],
        backgroundColor: 'rgba(75,142,255,0.22)',
        borderColor: '#4B8EFF',
        borderWidth: 2,
        borderRadius: 12,
      },
    ],
  };

  const statusTone =
    usagePercentage >= 90
      ? { label: 'Critical', className: 'text-[#FFD1D1]', fill: 'bg-[linear-gradient(90deg,#FF6B6B_0%,#FF9F6B_100%)]' }
      : usagePercentage >= 70
        ? { label: 'Warning', className: 'text-[#FBE3B5]', fill: 'bg-[linear-gradient(90deg,#F8B74D_0%,#FF8A4F_100%)]' }
        : { label: 'Healthy', className: 'text-[#C8F3E2]', fill: 'bg-[linear-gradient(90deg,#3FBF8C_0%,#6EE7B7_100%)]' };

  return (
    <div className="aurora-card border border-[rgba(255,255,255,0.08)] p-5 sm:p-6">
      <div className="h-80 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(12,16,28,0.55)] p-3">
        <Bar data={chartConfig} options={chartOptions} />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 text-center text-sm text-[rgba(207,207,207,0.65)]">
        <div>
          <div className="text-2xl font-semibold text-white">{inUseConnections}</div>
          <div className="mt-1 uppercase tracking-[0.18em]">In Use</div>
        </div>
        <div>
          <div className="text-2xl font-semibold text-white">{availableConnections}</div>
          <div className="mt-1 uppercase tracking-[0.18em]">Available</div>
        </div>
        <div>
          <div className="text-2xl font-semibold text-white">{usagePercentage.toFixed(1)}%</div>
          <div className="mt-1 uppercase tracking-[0.18em]">Usage</div>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-[rgba(207,207,207,0.55)]">
          <span>Pool Health</span>
          <span className={statusTone.className}>{statusTone.label}</span>
        </div>
        <div className="h-2.5 w-full rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.7)]">
          <div
            className={cn('h-full rounded-full shadow-[0_8px_18px_rgba(75,142,255,0.25)]', statusTone.fill)}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
