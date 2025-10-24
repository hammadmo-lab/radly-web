"use client"

/**
 * src/components/admin/metrics/LLMMetricsPanel.tsx
 * LLM tokens and cost visualization panel
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
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { parsePrometheusResult, getProviderColor, formatCost } from '@/lib/metrics-helpers';
import { PrometheusResult } from '@/lib/admin-metrics';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface LLMMetricsPanelProps {
  tokensData: PrometheusResult;
  costData: PrometheusResult;
}

export function LLMMetricsPanel({ tokensData, costData }: LLMMetricsPanelProps) {
  const tokensChartData = parsePrometheusResult(tokensData);
  const costChartData = parsePrometheusResult(costData);

  const axisColor = 'rgba(215,227,255,0.78)';
  const gridColor = 'rgba(75,142,255,0.18)';

  const tokensChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
        labels: {
          color: axisColor,
        },
      },
      title: {
        display: true,
        text: 'Token Usage by Provider',
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
            return `${tooltipItem.label}: ${tooltipItem.parsed.y.toLocaleString()} tokens`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Tokens',
          color: axisColor,
        },
        ticks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          callback: function (value: any) {
            return value.toLocaleString();
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
  };

  const tokensChartConfig = {
    labels: tokensChartData.map((item) => item.name),
    datasets: [
      {
        data: tokensChartData.map((item) => item.value),
        backgroundColor: tokensChartData.map((item) => getProviderColor(item.name)),
        borderColor: tokensChartData.map((item) => getProviderColor(item.name)),
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const costChartOptions = {
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
        text: 'Cost Breakdown by Provider',
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
            return `${tooltipItem.label}: ${formatCost(tooltipItem.parsed)} (${percentage}%)`;
          },
        },
      },
    },
  };

  const costChartConfig = {
    labels: costChartData.map((item) => item.name),
    datasets: [
      {
        data: costChartData.map((item) => item.value),
        backgroundColor: costChartData.map((item) => getProviderColor(item.name)),
        borderColor: costChartData.map((item) => getProviderColor(item.name)),
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="aurora-card border border-[rgba(255,255,255,0.08)] p-5 sm:p-6">
        <div className="h-80 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(12,16,28,0.55)] p-3">
          <Bar data={tokensChartConfig} options={tokensChartOptions} />
        </div>
      </div>

      <div className="aurora-card border border-[rgba(255,255,255,0.08)] p-5 sm:p-6">
        <div className="h-80 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(12,16,28,0.55)] p-3">
          <Doughnut data={costChartConfig} options={costChartOptions} />
        </div>
      </div>
    </div>
  );
}
