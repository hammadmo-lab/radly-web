'use client';
import React, { useEffect, useState } from 'react';
import { fetchLLMMetrics } from '@/lib/admin-metrics';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

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

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin — LLM Metrics</h1>
      {err && <div style={{ color: 'crimson' }}>{err}</div>}
      {loading && <div>Loading...</div>}

      <section style={{ height: 300 }}>
        <h3>Requests per 5m</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rate}>
            <XAxis dataKey={(d: MetricData) => label(d)} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section style={{ height: 220 }}>
        <h3>Tokens (last 1h)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={tokens}>
            <XAxis dataKey={(d: MetricData) => label(d)} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#059669" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section style={{ height: 180 }}>
        <h3>Errors (last 1h)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={errors}>
            <XAxis dataKey={(d: MetricData) => label(d)} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
