'use client';

import { Card } from '@/components/ui/card';

interface ReportListSkeletonProps {
  count?: number;
}

export function ReportListSkeleton({ count = 5 }: ReportListSkeletonProps) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <Card
          key={i}
          className="aurora-card border border-[rgba(255,255,255,0.08)] p-4 sm:p-5"
        >
          <div className="space-y-3">
            {/* Header row with title and status */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2 min-w-0">
                <div className="h-5 w-32 bg-[rgba(207,207,207,0.2)] rounded animate-pulse" />
                <div className="h-3 w-24 bg-[rgba(207,207,207,0.1)] rounded animate-pulse" />
              </div>
              <div className="h-6 w-20 bg-[rgba(207,207,207,0.15)] rounded animate-pulse flex-shrink-0" />
            </div>

            {/* Info row with metadata */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="h-3 w-28 bg-[rgba(207,207,207,0.1)] rounded animate-pulse" />
                <div className="h-3 w-28 bg-[rgba(207,207,207,0.1)] rounded animate-pulse hidden sm:block" />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-[rgba(207,207,207,0.1)] rounded animate-pulse" />
                <div className="h-8 w-8 bg-[rgba(207,207,207,0.1)] rounded animate-pulse hidden sm:block" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
