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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DatabaseMetricsChartProps {
  data: PrometheusResult;
}

export function DatabaseMetricsChart({ data }: DatabaseMetricsChartProps) {
  const poolData = parsePrometheusResult(data);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Database Connection Pool Usage',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function(this: any, tooltipItem: any) {
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
        },
      },
    },
  };

  // Simulate pool data structure
  const totalConnections = 20; // Assuming max pool size
  const inUseConnections = poolData[0]?.value || 0;
  const availableConnections = totalConnections - inUseConnections;

  const chartConfig = {
    labels: ['Connection Pool'],
    datasets: [
      {
        label: 'Available',
        data: [availableConnections],
        backgroundColor: '#10b981',
        borderColor: '#10b981',
        borderWidth: 1,
      },
      {
        label: 'In Use',
        data: [inUseConnections],
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
        borderWidth: 1,
      },
    ],
  };

  const usagePercentage = (inUseConnections / totalConnections) * 100;

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <div className="h-80">
        <Bar data={chartConfig} options={chartOptions} />
      </div>
      
      {/* Pool statistics */}
      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-gray-900">{inUseConnections}</div>
          <div className="text-sm text-gray-600">In Use</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{availableConnections}</div>
          <div className="text-sm text-gray-600">Available</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {usagePercentage.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Usage</div>
        </div>
      </div>

      {/* Pool health indicator */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Pool Health</span>
          <span className={`text-sm font-medium ${
            usagePercentage >= 90 ? 'text-red-600' : 
            usagePercentage >= 70 ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {usagePercentage >= 90 ? 'Critical' : 
             usagePercentage >= 70 ? 'Warning' : 'Healthy'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            usagePercentage >= 90 ? 'bg-red-500' : 
            usagePercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{ width: `${usagePercentage}%` }}
        ></div>
        </div>
      </div>
    </div>
  );
}
