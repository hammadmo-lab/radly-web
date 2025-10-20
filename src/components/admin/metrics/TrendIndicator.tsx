/**
 * src/components/admin/metrics/TrendIndicator.tsx
 * Visual indicator for metric trends with percentage change
 */
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendIndicatorProps {
  change: number; // Percentage change
  changeAbsolute?: number;
  period?: string; // e.g., "vs last hour"
  format?: 'percentage' | 'absolute' | 'both';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
  inverse?: boolean; // If true, down is good, up is bad (for error rates, costs, etc.)
}

export function TrendIndicator({
  change,
  changeAbsolute,
  period = 'vs previous',
  format = 'percentage',
  size = 'md',
  className,
  showIcon = true,
  inverse = false,
}: TrendIndicatorProps) {
  const threshold = 0.5; // 0.5% change threshold for "neutral"

  let trend: 'up' | 'down' | 'neutral';
  if (Math.abs(change) < threshold) {
    trend = 'neutral';
  } else {
    trend = change > 0 ? 'up' : 'down';
  }

  // Determine if this is a "good" or "bad" trend
  const isGood = inverse
    ? (trend === 'down' || trend === 'neutral')
    : (trend === 'up' || trend === 'neutral');

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const getColor = () => {
    if (trend === 'neutral') return 'text-gray-600';
    return isGood ? 'text-green-600' : 'text-red-600';
  };

  const getBgColor = () => {
    if (trend === 'neutral') return 'bg-gray-100';
    return isGood ? 'bg-green-50' : 'bg-red-50';
  };

  const getIcon = () => {
    if (!showIcon) return null;

    const iconClass = cn(iconSizes[size], getColor());

    if (trend === 'up') return <TrendingUp className={iconClass} />;
    if (trend === 'down') return <TrendingDown className={iconClass} />;
    return <Minus className={iconClass} />;
  };

  const formatChange = () => {
    const sign = change > 0 ? '+' : '';
    const percentageText = `${sign}${Math.abs(change).toFixed(1)}%`;

    if (format === 'percentage') {
      return percentageText;
    }

    if (format === 'absolute' && changeAbsolute !== undefined) {
      const absSign = changeAbsolute > 0 ? '+' : '';
      return `${absSign}${changeAbsolute.toFixed(2)}`;
    }

    if (format === 'both' && changeAbsolute !== undefined) {
      const absSign = changeAbsolute > 0 ? '+' : '';
      return `${percentageText} (${absSign}${changeAbsolute.toFixed(2)})`;
    }

    return percentageText;
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded-md',
        sizeClasses[size],
        getColor(),
        getBgColor(),
        className
      )}
    >
      {getIcon()}
      <span className="font-medium">{formatChange()}</span>
      {period && <span className="text-gray-500 ml-1">{period}</span>}
    </div>
  );
}
