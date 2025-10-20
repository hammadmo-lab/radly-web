/**
 * src/components/admin/metrics/MetricCard.tsx
 * Enhanced metric card component with trends, sparklines, and targets
 */
import React from 'react';
import { Info, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TrendIndicator } from './TrendIndicator';
import { SparklineChart } from './SparklineChart';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  status?: 'success' | 'warning' | 'danger';
  icon?: React.ReactNode;
  className?: string;

  // Trend information
  change?: number; // Percentage change
  changeAbsolute?: number;
  period?: string; // e.g., "vs last hour"
  trendInverse?: boolean; // If true, down is good (for errors, costs)

  // Target/threshold information
  target?: string | number;
  targetLabel?: string; // e.g., "SLA target"

  // Sparkline data
  sparkline?: number[];

  // Additional metrics
  subtitle?: string;
  description?: string;

  // Min/max values
  min?: number;
  max?: number;
}

export function MetricCard({
  title,
  value,
  unit,
  status = 'success',
  icon,
  className,
  change,
  changeAbsolute,
  period,
  trendInverse = false,
  target,
  targetLabel = 'Target',
  sparkline,
  subtitle,
  description,
  min,
  max,
}: MetricCardProps) {
  const statusColors = {
    success: 'bg-white border-green-200 hover:border-green-300',
    warning: 'bg-white border-amber-200 hover:border-amber-300',
    danger: 'bg-white border-red-200 hover:border-red-300',
  };

  const statusDotColors = {
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
  };

  return (
    <div className={cn(
      'p-5 rounded-lg border-2 transition-all duration-200 hover:shadow-lg bg-white',
      statusColors[status],
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          <div className={cn('w-2 h-2 rounded-full', statusDotColors[status])} />
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
          {description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>

      {/* Main value */}
      <div className="mb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">{value}</span>
          {unit && <span className="text-lg text-gray-500">{unit}</span>}
        </div>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>

      {/* Trend indicator */}
      {change !== undefined && (
        <div className="mb-3">
          <TrendIndicator
            change={change}
            changeAbsolute={changeAbsolute}
            period={period}
            size="sm"
            inverse={trendInverse}
          />
        </div>
      )}

      {/* Sparkline */}
      {sparkline && sparkline.length > 0 && (
        <div className="mb-3">
          <SparklineChart
            data={sparkline}
            color={
              status === 'success' ? '#10b981' :
              status === 'warning' ? '#f59e0b' :
              '#ef4444'
            }
            height={32}
          />
        </div>
      )}

      {/* Footer - Target, Min/Max */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3">
          {target !== undefined && (
            <div>
              <span className="text-gray-400">{targetLabel}: </span>
              <span className="font-medium text-gray-600">{target}</span>
            </div>
          )}
          {min !== undefined && max !== undefined && (
            <div>
              <span className="text-gray-400">Range: </span>
              <span className="font-medium text-gray-600">{min.toFixed(1)} - {max.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
