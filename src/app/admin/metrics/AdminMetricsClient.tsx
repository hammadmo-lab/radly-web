'use client';
import React, { useEffect, useState } from 'react';
import { fetchLLMMetrics } from '@/lib/admin-metrics';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function AdminMetricsClient() {
  const [rate, setRate] = useState<any[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);
  const [errors, setErrors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true); setErr(null);
    try {
      const data = await fetchLLMMetrics();
      setRate(data.by_rate || []);
      setTokens(data.by_tokens || []);
      setErrors(data.by_errors || []);
    } catch (e:any) {
      setErr(String(e?.message || e));
    } finally { setLoading(false); }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const label = (d:any) => `${d.provider || 'unknown'}:${d.model || 'unknown'}`;

  return (
    <div>
      {err && <div style={{ color: 'crimson' }}>{err}</div>}
      {loading && <div>Loading...</div>}

      <section style={{ height: 300 }}>
        <h3>Requests per 5m</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rate}>
            <XAxis dataKey={(d:any) => label(d)} />
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
            <XAxis dataKey={(d:any) => label(d)} />
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
            <XAxis dataKey={(d:any) => label(d)} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
