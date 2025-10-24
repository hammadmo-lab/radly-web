"use client"

/**
 * src/components/admin/metrics/ReliabilityPanel.tsx
 * Error categories, cache hit rate, and retry success rate
 */
import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LinearScale,
  CategoryScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { parsePrometheusResult, getErrorCategoryColor, formatPercentage } from '@/lib/metrics-helpers';
import { PrometheusResult } from '@/lib/admin-metrics';

ChartJS.register(ArcElement, Tooltip, Legend, LinearScale, CategoryScale, BarElement, Title);

interface ReliabilityPanelProps {
  errorCategories: PrometheusResult;
  cacheHitRate: PrometheusResult;
  retrySuccessRate: PrometheusResult;
}

export function ReliabilityPanel({
  errorCategories,
  cacheHitRate,
  retrySuccessRate,
}: ReliabilityPanelProps) {
  const errorData = parsePrometheusResult(errorCategories);
  const cacheRate = parsePrometheusResult(cacheHitRate)[0]?.value || 0;
  const retryRate = parsePrometheusResult(retrySuccessRate)[0]?.value || 0;

  const axisColor = 'rgba(215,227,255,0.78)';
  const gridColor = 'rgba(75,142,255,0.18)';

  const errorChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: axisColor,
          padding: 18,
        },
      },
      title: {
        display: true,
        text: 'Error Categories',
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
            const total = tooltipItem.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((tooltipItem.parsed / total) * 100).toFixed(1);
            return `${tooltipItem.label}: ${tooltipItem.parsed} errors (${percentage}%)`;
          },
        },
      },
    },
  };

  const errorChartConfig = {
    labels: errorData.map((item) => item.name),
    datasets: [
      {
        data: errorData.map((item) => item.value),
        backgroundColor: errorData.map((item) => getErrorCategoryColor(item.name)),
        borderColor: errorData.map((item) => getErrorCategoryColor(item.name)),
        borderWidth: 2,
      },
    ],
  };

  const gaugeOptions = (title: string) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        color: '#D7E3FF',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          callback: function (value: any) {
            return `${value}%`;
          },
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
  });

  const gaugeConfig = (label: string, value: number, goodThresh: number, warnThresh: number) => ({
    labels: [label],
    datasets: [
      {
        data: [value],
        backgroundColor: value >= goodThresh ? '#3FBF8C' : value >= warnThresh ? '#F8B74D' : '#FF6B6B',
        borderColor: value >= goodThresh ? 'rgba(63,191,140,0.9)' : value >= warnThresh ? 'rgba(248,183,77,0.85)' : 'rgba(255,107,107,0.85)',
        borderWidth: 2,
        borderRadius: 10,
      },
    ],
  });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="aurora-card border border-[rgba(255,255,255,0.08)] p-5 sm:p-6">
        <div className="h-80 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(12,16,28,0.55)] p-3">
          <Doughnut data={errorChartConfig} options={errorChartOptions} />
        </div>
      </div>

      <div className="aurora-card border border-[rgba(255,255,255,0.08)] p-5 sm:p-6">
        <div className="h-80 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(12,16,28,0.55)] p-3">
          <Bar data={gaugeConfig('Cache Hit Rate', cacheRate, 80, 60)} options={gaugeOptions('Cache Hit Rate')} />
        </div>
        <div className="mt-4 text-center text-sm text-[rgba(207,207,207,0.65)]">
          <div className="text-3xl font-semibold text-white">{formatPercentage(cacheRate)}</div>
          <div className="mt-1 uppercase tracking-[0.18em] text-[rgba(207,207,207,0.45)]">Current Hit Rate</div>
        </div>
      </div>

      <div className="aurora-card border border-[rgba(255,255,255,0.08)] p-5 sm:p-6">
        <div className="h-80 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(12,16,28,0.55)] p-3">
          <Bar data={gaugeConfig('Retry Success Rate', retryRate, 70, 50)} options={gaugeOptions('Retry Success Rate')} />
        </div>
        <div className="mt-4 text-center text-sm text-[rgba(207,207,207,0.65)]">
          <div className="text-3xl font-semibold text-white">{formatPercentage(retryRate)}</div>
          <div className="mt-1 uppercase tracking-[0.18em] text-[rgba(207,207,207,0.45)]">Success Rate</div>
        </div>
      </div>
    </div>
  );
}
