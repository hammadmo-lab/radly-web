"use client"

/**
 * src/components/admin/metrics/QueueMetricsChart.tsx
 * Queue processing rates and saturation visualization
 */
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { parsePrometheusResult, formatPercentage } from '@/lib/metrics-helpers';
import { PrometheusResult } from '@/lib/admin-metrics';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

interface QueueMetricsChartProps {
  queueRates: PrometheusResult;
  queueSaturation: PrometheusResult;
}

export function QueueMetricsChart({ queueRates, queueSaturation }: QueueMetricsChartProps) {
  const ratesData = parsePrometheusResult(queueRates);
  const saturationData = parsePrometheusResult(queueSaturation);

  const axisColor = 'rgba(215,227,255,0.78)';
  const gridColor = 'rgba(75,142,255,0.18)';

  const ratesChartOptions = {
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
        text: 'Queue Processing Rates',
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
          label: function (this: any, tooltipItem: any) {
            return `${tooltipItem.dataset.label}: ${tooltipItem.parsed.y.toFixed(2)} jobs/sec`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Jobs per Second',
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
        title: {
          display: true,
          text: 'Time',
          color: axisColor,
        },
        ticks: {
          color: axisColor,
        },
        grid: {
          color: 'rgba(75,142,255,0.08)',
        },
      },
    },
  };

  const ratesChartConfig = {
    labels: ratesData.map((_, index) => `T${index + 1}`),
    datasets: [
      {
        label: 'Enqueue Rate',
        data: ratesData.map((item) => item.value),
        borderColor: '#4B8EFF',
        backgroundColor: 'rgba(75,142,255,0.18)',
        pointRadius: 3,
        tension: 0.25,
      },
      {
        label: 'Dequeue Rate',
        data: ratesData.map((item) => item.value * 0.95),
        borderColor: '#3FBF8C',
        backgroundColor: 'rgba(63,191,140,0.16)',
        pointRadius: 3,
        tension: 0.25,
      },
    ],
  };

  const saturationChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Queue Saturation',
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
          label: function (this: any, tooltipItem: any) {
            return `Saturation: ${formatPercentage(tooltipItem.parsed.y)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Saturation (%)',
          color: axisColor,
        },
        ticks: {
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
  };

  const saturationValue = saturationData[0]?.value || 0;

  const saturationChartConfig = {
    labels: ['Current Saturation'],
    datasets: [
      {
        data: [saturationValue],
        backgroundColor:
          saturationValue >= 80
            ? '#FF6B6B'
            : saturationValue >= 60
              ? '#F8B74D'
              : '#3FBF8C',
        borderColor:
          saturationValue >= 80
            ? 'rgba(255,107,107,0.85)'
            : saturationValue >= 60
              ? 'rgba(248,183,77,0.85)'
              : 'rgba(63,191,140,0.9)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="aurora-card border border-[rgba(255,255,255,0.08)] p-5 sm:p-6">
        <div className="h-80 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(12,16,28,0.55)] p-3">
          <Line data={ratesChartConfig} options={ratesChartOptions} />
        </div>
      </div>

      <div className="aurora-card border border-[rgba(255,255,255,0.08)] p-5 sm:p-6">
        <div className="h-80 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(12,16,28,0.55)] p-3">
          <Bar data={saturationChartConfig} options={saturationChartOptions} />
        </div>
        <div className="mt-5 text-center text-sm text-[rgba(207,207,207,0.65)]">
          <div className="text-3xl font-semibold text-white">
            {formatPercentage(saturationValue)}
          </div>
          <div className="mt-1 uppercase tracking-[0.18em] text-[rgba(207,207,207,0.45)]">
            Current Saturation
          </div>
        </div>
      </div>
    </div>
  );
}
