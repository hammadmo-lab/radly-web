import dynamic from 'next/dynamic';
import React from 'react';

// Load client-only dashboard (no SSR)
const AdminMetricsClient = dynamic(() => import('./AdminMetricsClient'), { ssr: false });

export default function Page() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Admin — LLM Metrics</h1>
      <AdminMetricsClient />
    </div>
  );
}
