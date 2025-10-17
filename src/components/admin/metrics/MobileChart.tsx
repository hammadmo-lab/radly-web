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
      'bg-white p-4 sm:p-6 rounded-lg border shadow-sm',
      className
    )}>
      <h3 className="text-lg font-semibold mb-4 text-center sm:text-left">
        {title}
      </h3>
      <div className={cn(
        'overflow-x-auto',
        height
      )}>
        <div className="min-w-[300px] h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
