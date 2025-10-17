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
  const [requestsData, setRequestsData] = useState<MetricData[]>([]);
  const [tokensData, setTokensData] = useState<MetricData[]>([]);
  const [errorsData, setErrorsData] = useState<MetricData[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true); setErr(null);
    try {
      const data = await fetchLLMMetrics();
      
      // Use absolute counts by default, fallback to rates when they have meaningful values
      const displayRequests = data.by_rate?.some((r: MetricData) => r.value > 0) 
        ? data.by_rate 
        : data.by_absolute?.requests || [];
      
      const displayTokens = data.by_tokens?.some((t: MetricData) => t.value > 0) 
        ? data.by_tokens 
        : data.by_absolute?.tokens || [];
      
      const displayErrors = data.by_errors?.some((e: MetricData) => e.value > 0) 
        ? data.by_errors 
        : data.by_absolute?.errors || [];
      
      setRequestsData(displayRequests);
      setTokensData(displayTokens);
      setErrorsData(displayErrors);
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
        <h3>Total Requests</h3>
        <Bar data={createChartData(requestsData, '#4f46e5')} options={chartOptions} />
      </section>

      <section style={{ height: 220, marginBottom: 20 }}>
        <h3>Total Tokens Used</h3>
        <Bar data={createChartData(tokensData, '#059669')} options={chartOptions} />
      </section>

      <section style={{ height: 180 }}>
        <h3>Total Errors</h3>
        <Bar data={createChartData(errorsData, '#ef4444')} options={chartOptions} />
      </section>
    </div>
  );
}
