/**
 * src/components/admin/metrics/MobileChart.tsx
 * Mobile-optimized chart wrapper
 */
import React from 'react';
import { cn } from '@/lib/utils';

interface MobileChartProps {
  children: React.ReactNode;
  title: string;
  className?: string;
  height?: string;
}

export function MobileChart({ 
  children, 
  title, 
  className,
  height = 'h-80'
}: MobileChartProps) {
  return (
    <div className={cn(
      'aurora-card border border-[rgba(255,255,255,0.08)] p-5 sm:p-6 backdrop-blur-xl',
      className
    )}>
      <h3 className="mb-4 text-base font-semibold text-white sm:text-lg">
        {title}
      </h3>
      <div className={cn(
        'overflow-x-auto rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(12,16,28,0.55)] p-2',
        height
      )}>
        <div className="h-full min-w-[300px]">
          {children}
        </div>
      </div>
    </div>
  );
}
