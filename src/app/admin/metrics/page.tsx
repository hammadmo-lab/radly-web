'use client';
import React, { useEffect, useState } from 'react';
import { fetchLLMMetrics } from '@/lib/admin-metrics';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MetricData {
  provider: string;
  model: string;
  value: number;
}

export default function Page() {
  const [rate, setRate] = useState<MetricData[]>([]);
  const [tokens, setTokens] = useState<MetricData[]>([]);
  const [errors, setErrors] = useState<MetricData[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true); setErr(null);
    try {
      const data = await fetchLLMMetrics();
      setRate(data.by_rate || []);
      setTokens(data.by_tokens || []);
      setErrors(data.by_errors || []);
    } catch (e: unknown) {
      setErr(String((e as Error)?.message || e));
    } finally { setLoading(false); }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const label = (d: MetricData) => `${d.provider || 'unknown'}:${d.model || 'unknown'}`;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 0,
        },
      },
    },
  };

  const createChartData = (data: MetricData[], color: string) => ({
    labels: data.map(label),
    datasets: [
      {
        data: data.map(d => d.value),
        backgroundColor: color,
        borderColor: color,
        borderWidth: 1,
      },
    ],
  });

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin — LLM Metrics</h1>
      {err && <div style={{ color: 'crimson' }}>{err}</div>}
      {loading && <div>Loading...</div>}

      <section style={{ height: 300, marginBottom: 20 }}>
        <h3>Requests per 5m</h3>
        <Bar data={createChartData(rate, '#4f46e5')} options={chartOptions} />
      </section>

      <section style={{ height: 220, marginBottom: 20 }}>
        <h3>Tokens (last 1h)</h3>
        <Bar data={createChartData(tokens, '#059669')} options={chartOptions} />
      </section>

      <section style={{ height: 180 }}>
        <h3>Errors (last 1h)</h3>
        <Bar data={createChartData(errors, '#ef4444')} options={chartOptions} />
      </section>
    </div>
  );
}
