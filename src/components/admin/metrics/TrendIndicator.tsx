import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendIndicatorProps {
  change: number;
  changeAbsolute?: number;
  period?: string;
  format?: 'percentage' | 'absolute' | 'both';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
  inverse?: boolean;
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
  const threshold = 0.5;

  let trend: 'up' | 'down' | 'neutral';
  if (Math.abs(change) < threshold) {
    trend = 'neutral';
  } else {
    trend = change > 0 ? 'up' : 'down';
  }

  const isPositive = inverse
    ? trend === 'down' || trend === 'neutral'
    : trend === 'up' || trend === 'neutral';

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-1',
    md: 'text-xs px-3 py-1.5',
    lg: 'text-sm px-3.5 py-2',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const containerTone =
    trend === 'neutral'
      ? 'border-[rgba(255,255,255,0.12)] bg-[rgba(18,22,36,0.75)] text-[rgba(207,207,207,0.75)]'
      : isPositive
        ? 'border-[rgba(63,191,140,0.35)] bg-[rgba(63,191,140,0.18)] text-[#C8F3E2]'
        : 'border-[rgba(255,107,107,0.32)] bg-[rgba(255,107,107,0.18)] text-[#FFD1D1]';

  const iconTone =
    trend === 'neutral'
      ? 'text-[rgba(207,207,207,0.65)]'
      : isPositive
        ? 'text-[#7AE7B4]'
        : 'text-[#FF9F9F]';

  const renderIcon = () => {
    if (!showIcon) return null;
    const iconClass = cn(iconSizes[size], iconTone);
    if (trend === 'up') return <TrendingUp className={iconClass} />;
    if (trend === 'down') return <TrendingDown className={iconClass} />;
    return <Minus className={iconClass} />;
  };

  const formatChange = () => {
    const sign = change > 0 ? '+' : '';
    const percentageText = `${sign}${Math.abs(change).toFixed(1)}%`;

    if (format === 'percentage') return percentageText;

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
        'inline-flex items-center gap-2 rounded-full border font-semibold uppercase tracking-[0.16em]',
        sizeClasses[size],
        containerTone,
        className
      )}
    >
      {renderIcon()}
      <span>{formatChange()}</span>
      {period && (
        <span className="text-[rgba(207,207,207,0.55)] first-letter:uppercase normal-case tracking-normal">
          {period}
        </span>
      )}
    </div>
  );
}
