/**
 * src/components/admin/metrics/SparklineChart.tsx
 * Mini line chart for showing trends in metric cards
 */
import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
);

interface SparklineChartProps {
  data: number[];
  color?: string;
  height?: number;
  showArea?: boolean;
}

export function SparklineChart({
  data,
  color = '#10b981',
  height = 40,
  showArea = true
}: SparklineChartProps) {
  const chartData = useMemo(() => ({
    labels: data.map((_, i) => i.toString()),
    datasets: [
      {
        data,
        borderColor: color,
        backgroundColor: showArea ? `${color}33` : 'transparent', // 20% opacity
        borderWidth: 2,
        fill: showArea,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 0,
      },
    ],
  }), [data, color, showArea]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  }), []);

  if (!data || data.length === 0) {
    return <div style={{ height }} className="bg-gray-100 rounded" />;
  }

  return (
    <div style={{ height }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
