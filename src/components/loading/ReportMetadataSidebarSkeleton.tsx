'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function ReportMetadataSidebarSkeleton() {
  return (
    <div className="space-y-4">
      {/* Job Information Skeleton */}
      <Card className="aurora-card border border-[rgba(255,255,255,0.08)]">
        <CardHeader className="pb-3">
          <div className="h-4 w-24 bg-[rgba(207,207,207,0.15)] rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="h-3 w-16 bg-[rgba(207,207,207,0.15)] rounded mb-2 animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="h-8 flex-1 bg-[rgba(207,207,207,0.15)] rounded animate-pulse" />
              <div className="h-8 w-8 bg-[rgba(207,207,207,0.15)] rounded animate-pulse" />
            </div>
          </div>

          <div>
            <div className="h-3 w-16 bg-[rgba(207,207,207,0.15)] rounded mb-2 animate-pulse" />
            <div className="h-6 w-32 bg-[rgba(207,207,207,0.15)] rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>

      {/* Performance Skeleton */}
      <Card className="aurora-card border border-[rgba(255,255,255,0.08)]">
        <CardHeader className="pb-3">
          <div className="h-4 w-28 bg-[rgba(207,207,207,0.15)] rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="h-3 w-20 bg-[rgba(207,207,207,0.15)] rounded mb-2 animate-pulse" />
              <div className="h-6 w-24 bg-[rgba(207,207,207,0.15)] rounded animate-pulse" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Token Usage Skeleton */}
      <Card className="aurora-card border border-[rgba(255,255,255,0.08)]">
        <CardHeader className="pb-3">
          <div className="h-4 w-28 bg-[rgba(207,207,207,0.15)] rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <div className="h-3 w-28 bg-[rgba(207,207,207,0.15)] rounded mb-2 animate-pulse" />
              <div className="h-6 w-32 bg-[rgba(207,207,207,0.15)] rounded animate-pulse" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Info Note Skeleton */}
      <Card className="aurora-card border border-[rgba(75,142,255,0.25)] bg-[rgba(75,142,255,0.08)]">
        <CardContent className="pt-4">
          <div className="space-y-2">
            <div className="h-3 w-full bg-[rgba(207,207,207,0.15)] rounded animate-pulse" />
            <div className="h-3 w-5/6 bg-[rgba(207,207,207,0.15)] rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
