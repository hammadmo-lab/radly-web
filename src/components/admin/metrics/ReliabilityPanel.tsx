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

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LinearScale,
  CategoryScale,
  BarElement,
  Title
);

interface ReliabilityPanelProps {
  errorCategories: PrometheusResult;
  cacheHitRate: PrometheusResult;
  retrySuccessRate: PrometheusResult;
}

export function ReliabilityPanel({ 
  errorCategories, 
  cacheHitRate, 
  retrySuccessRate 
}: ReliabilityPanelProps) {
  const errorData = parsePrometheusResult(errorCategories);
  const cacheRate = parsePrometheusResult(cacheHitRate)[0]?.value || 0;
  const retryRate = parsePrometheusResult(retrySuccessRate)[0]?.value || 0;

  // Error categories chart
  const errorChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Error Categories',
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
            return `${tooltipItem.label}: ${tooltipItem.parsed} errors (${percentage}%)`;
          },
        },
      },
    },
  };

  const errorChartConfig = {
    labels: errorData.map(item => item.name),
    datasets: [
      {
        data: errorData.map(item => item.value),
        backgroundColor: errorData.map(item => getErrorCategoryColor(item.name)),
        borderColor: errorData.map(item => getErrorCategoryColor(item.name)),
        borderWidth: 2,
      },
    ],
  };

  // Cache hit rate gauge
  const cacheGaugeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Cache Hit Rate',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          callback: function(value: any) {
            return `${value}%`;
          },
        },
      },
    },
  };

  const cacheGaugeConfig = {
    labels: ['Cache Hit Rate'],
    datasets: [
      {
        data: [cacheRate],
        backgroundColor: cacheRate >= 80 ? '#10b981' : cacheRate >= 60 ? '#f59e0b' : '#ef4444',
        borderColor: cacheRate >= 80 ? '#10b981' : cacheRate >= 60 ? '#f59e0b' : '#ef4444',
        borderWidth: 2,
      },
    ],
  };

  // Retry success rate gauge
  const retryGaugeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Retry Success Rate',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          callback: function(value: any) {
            return `${value}%`;
          },
        },
      },
    },
  };

  const retryGaugeConfig = {
    labels: ['Retry Success Rate'],
    datasets: [
      {
        data: [retryRate],
        backgroundColor: retryRate >= 70 ? '#10b981' : retryRate >= 50 ? '#f59e0b' : '#ef4444',
        borderColor: retryRate >= 70 ? '#10b981' : retryRate >= 50 ? '#f59e0b' : '#ef4444',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Error Categories */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="h-80">
          <Doughnut data={errorChartConfig} options={errorChartOptions} />
        </div>
      </div>

      {/* Cache Hit Rate */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="h-80">
          <Bar data={cacheGaugeConfig} options={cacheGaugeOptions} />
        </div>
        <div className="mt-4 text-center">
          <div className="text-3xl font-bold text-gray-900">
            {formatPercentage(cacheRate)}
          </div>
          <div className="text-sm text-gray-600">Current Hit Rate</div>
        </div>
      </div>

      {/* Retry Success Rate */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="h-80">
          <Bar data={retryGaugeConfig} options={retryGaugeOptions} />
        </div>
        <div className="mt-4 text-center">
          <div className="text-3xl font-bold text-gray-900">
            {formatPercentage(retryRate)}
          </div>
          <div className="text-sm text-gray-600">Success Rate</div>
        </div>
      </div>
    </div>
  );
}
