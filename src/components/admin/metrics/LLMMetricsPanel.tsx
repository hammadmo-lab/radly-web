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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface LLMMetricsPanelProps {
  tokensData: PrometheusResult;
  costData: PrometheusResult;
}

export function LLMMetricsPanel({ tokensData, costData }: LLMMetricsPanelProps) {
  const tokensChartData = parsePrometheusResult(tokensData);
  const costChartData = parsePrometheusResult(costData);

  // Tokens chart configuration
  const tokensChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Token Usage by Provider',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function(this: any, tooltipItem: any) {
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
        },
        ticks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          callback: function(value: any) {
            return value.toLocaleString();
          },
        },
      },
    },
  };

  const tokensChartConfig = {
    labels: tokensChartData.map(item => item.name),
    datasets: [
      {
        data: tokensChartData.map(item => item.value),
        backgroundColor: tokensChartData.map(item => getProviderColor(item.name)),
        borderColor: tokensChartData.map(item => getProviderColor(item.name)),
        borderWidth: 1,
      },
    ],
  };

  // Cost breakdown chart configuration
  const costChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Cost Breakdown by Provider',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function(this: any, tooltipItem: any) {
            const total = tooltipItem.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((tooltipItem.parsed / total) * 100).toFixed(1);
            return `${tooltipItem.label}: ${formatCost(tooltipItem.parsed)} (${percentage}%)`;
          },
        },
      },
    },
  };

  const costChartConfig = {
    labels: costChartData.map(item => item.name),
    datasets: [
      {
        data: costChartData.map(item => item.value),
        backgroundColor: costChartData.map(item => getProviderColor(item.name)),
        borderColor: costChartData.map(item => getProviderColor(item.name)),
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Token Usage Chart */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="h-80">
          <Bar data={tokensChartConfig} options={tokensChartOptions} />
        </div>
      </div>

      {/* Cost Breakdown Chart */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="h-80">
          <Doughnut data={costChartConfig} options={costChartOptions} />
        </div>
      </div>
    </div>
  );
}
