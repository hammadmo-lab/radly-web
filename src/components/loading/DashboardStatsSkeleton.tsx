'use client';

import { Card, CardContent } from '@/components/ui/card';

interface DashboardStatsSkeletonProps {
  count?: number;
}

export function DashboardStatsSkeleton({ count = 3 }: DashboardStatsSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(count)].map((_, i) => (
        <Card key={i} className="aurora-card border border-[rgba(255,255,255,0.08)]">
          <CardContent className="pt-6">
            <div className="space-y-3">
              {/* Label */}
              <div className="h-4 w-32 bg-[rgba(207,207,207,0.15)] rounded animate-pulse" />

              {/* Value */}
              <div className="h-8 w-24 bg-[rgba(207,207,207,0.2)] rounded animate-pulse" />

              {/* Change/Subtitle */}
              <div className="h-3 w-40 bg-[rgba(207,207,207,0.1)] rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
