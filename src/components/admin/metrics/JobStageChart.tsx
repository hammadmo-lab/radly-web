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
      },
      tooltip: {
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
        },
        ticks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          callback: function(value: any) {
            return formatDuration(value);
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Stage',
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
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center justify-center sm:justify-start">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-gray-600">Good (&lt; 1s)</span>
        </div>
        <div className="flex items-center justify-center sm:justify-start">
          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
          <span className="text-gray-600">Warning (1-5s)</span>
        </div>
        <div className="flex items-center justify-center sm:justify-start">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <span className="text-gray-600">Critical (&gt; 5s)</span>
        </div>
      </div>
    </MobileChart>
  );
}
