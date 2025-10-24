/**
 * src/components/admin/metrics/JobStageChart.tsx
 * Horizontal bar chart showing P95 latency by job stage
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
import { parsePrometheusResult, getStageColor, formatDuration } from '@/lib/metrics-helpers';
import { PrometheusResult } from '@/lib/admin-metrics';
import { MobileChart } from './MobileChart';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface JobStageChartProps {
  data: PrometheusResult;
}

export function JobStageChart({ data }: JobStageChartProps) {
  const chartData = parsePrometheusResult(data);
  const axisColor = 'rgba(215,227,255,0.78)';
  const gridColor = 'rgba(75,142,255,0.18)';
  
  const chartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Job Stage Timing (P95)',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        color: '#D7E3FF',
      },
      tooltip: {
        backgroundColor: 'rgba(12,16,28,0.9)',
        titleColor: '#FFFFFF',
        bodyColor: '#D7E3FF',
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function(this: any, tooltipItem: any) {
            return `${tooltipItem.parsed.x.toFixed(3)}s (${formatDuration(tooltipItem.parsed.x)})`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Duration (seconds)',
          color: axisColor,
        },
        ticks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          callback: function(value: any) {
            return formatDuration(value);
          },
          color: axisColor,
        },
        grid: {
          color: gridColor,
          drawBorder: false,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Stage',
          color: axisColor,
        },
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
    labels: chartData.map(item => item.name),
    datasets: [
      {
        data: chartData.map(item => item.value),
        backgroundColor: chartData.map(item => getStageColor(item.name)),
        borderColor: chartData.map(item => getStageColor(item.name)),
        borderWidth: 1,
      },
    ],
  };

  return (
    <MobileChart title="Job Stage Timing (P95)">
      <Bar data={chartConfig} options={chartOptions} />
      
      {/* Performance indicators */}
      <div className="mt-5 grid grid-cols-1 gap-3 text-sm text-[rgba(207,207,207,0.65)] sm:grid-cols-3">
        <div className="flex items-center justify-center rounded-full border border-[rgba(63,191,140,0.35)] bg-[rgba(63,191,140,0.16)] px-4 py-2 sm:justify-start">
          <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-[#3FBF8C]" />
          <span className="text-xs uppercase tracking-[0.18em] text-[#C8F3E2]">Good (&lt; 1s)</span>
        </div>
        <div className="flex items-center justify-center rounded-full border border-[rgba(248,183,77,0.35)] bg-[rgba(248,183,77,0.16)] px-4 py-2 sm:justify-start">
          <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-[#F8B74D]" />
          <span className="text-xs uppercase tracking-[0.18em] text-[#FBE3B5]">Warning (1-5s)</span>
        </div>
        <div className="flex items-center justify-center rounded-full border border-[rgba(255,107,107,0.32)] bg-[rgba(255,107,107,0.18)] px-4 py-2 sm:justify-start">
          <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-[#FF6B6B]" />
          <span className="text-xs uppercase tracking-[0.18em] text-[#FFD1D1]">Critical (&gt; 5s)</span>
        </div>
      </div>
    </MobileChart>
  );
}
