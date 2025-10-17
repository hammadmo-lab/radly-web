/**
 * src/components/admin/metrics/MetricCard.tsx
 * Reusable metric card component for displaying KPIs
 */
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  status?: 'success' | 'warning' | 'danger';
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  unit, 
  trend, 
  status = 'success',
  icon,
  className
}: MetricCardProps) {
  const statusColors = {
    success: 'bg-green-50 border-green-200 text-green-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    danger: 'bg-red-50 border-red-200 text-red-700',
  };

  const trendIcons = {
    up: <TrendingUp className="h-4 w-4 text-green-600" />,
    down: <TrendingDown className="h-4 w-4 text-red-600" />,
    neutral: <Minus className="h-4 w-4 text-gray-500" />,
  };

  const trendText = {
    up: 'Improving',
    down: 'Degrading',
    neutral: 'Stable',
  };

  return (
    <div className={cn(
      'p-6 rounded-lg border-2 transition-all duration-200 hover:shadow-md',
      statusColors[status],
      className
    )}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium opacity-80">{title}</h3>
        {icon}
      </div>
      <div className="flex items-baseline mb-2">
        <span className="text-3xl font-bold">{value}</span>
        {unit && <span className="ml-2 text-lg opacity-70">{unit}</span>}
      </div>
      {trend && (
        <div className="flex items-center text-sm">
          {trendIcons[trend]}
          <span className="ml-1">{trendText[trend]}</span>
        </div>
      )}
    </div>
  );
}
