/**
 * src/components/admin/metrics-v2/UsageTrendChart.tsx
 * Bar chart showing 7-day report usage trend
 */
'use client';

import React, { useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    type TooltipItem,
    type ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { UsageTrendItem } from '@/types/metrics-summary.types';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface UsageTrendChartProps {
    data: UsageTrendItem[];
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function UsageTrendChart({ data }: UsageTrendChartProps) {
    const chartData = useMemo(() => {
        return {
            labels: data.map((item) => formatDate(item.date)),
            datasets: [
                {
                    label: 'Reports',
                    data: data.map((item) => item.count),
                    backgroundColor: 'rgba(245, 215, 145, 0.7)',
                    borderColor: '#F5D791',
                    borderWidth: 1,
                    borderRadius: 6,
                    hoverBackgroundColor: '#F5D791',
                },
            ],
        };
    }, [data]);

    const options: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(12, 14, 24, 0.95)',
                titleColor: '#fff',
                bodyColor: 'rgba(207, 207, 207, 0.9)',
                borderColor: 'rgba(255, 255, 255, 0.12)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    label: (context: TooltipItem<'bar'>) => {
                        const value = context.parsed.y ?? 0;
                        return `${value} report${value !== 1 ? 's' : ''}`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: 'rgba(207, 207, 207, 0.55)',
                    font: {
                        size: 11,
                    },
                },
                border: {
                    display: false,
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.06)',
                },
                ticks: {
                    color: 'rgba(207, 207, 207, 0.55)',
                    font: {
                        size: 11,
                    },
                    stepSize: 1,
                },
                border: {
                    display: false,
                },
            },
        },
    };

    if (data.length === 0) {
        return (
            <div className="aurora-card flex h-64 items-center justify-center border border-[rgba(255,255,255,0.08)] p-6">
                <p className="text-sm text-[rgba(207,207,207,0.55)]">No usage data available</p>
            </div>
        );
    }

    return (
        <div className="aurora-card border border-[rgba(255,255,255,0.08)] p-6">
            <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.15em] text-[rgba(207,207,207,0.55)]">
                Reports (Last 7 Days)
            </h3>
            <div className="h-56">
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
}
