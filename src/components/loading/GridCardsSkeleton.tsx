'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface GridCardsSkeletonProps {
  count?: number;
  columns?: number;
  variant?: 'card' | 'template' | 'stat';
}

export function GridCardsSkeleton({
  count = 6,
  columns = 3,
  variant = 'card',
}: GridCardsSkeletonProps) {
  const colClass = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }[columns] || `grid-cols-1 md:grid-cols-${columns}`;

  return (
    <div className={`grid ${colClass} gap-4`}>
      {[...Array(count)].map((_, i) => (
        <Card
          key={i}
          className="aurora-card border border-[rgba(255,255,255,0.08)] overflow-hidden"
        >
          {variant === 'template' ? (
            // Template card variant with header, description, and footer
            <>
              <CardHeader className="pb-3">
                <div className="space-y-2">
                  <div className="h-5 w-24 bg-[rgba(207,207,207,0.2)] rounded animate-pulse" />
                  <div className="h-3 w-full bg-[rgba(207,207,207,0.1)] rounded animate-pulse" />
                  <div className="h-3 w-4/5 bg-[rgba(207,207,207,0.1)] rounded animate-pulse" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between pt-4 border-t border-[rgba(255,255,255,0.08)]">
                  <div className="h-3 w-20 bg-[rgba(207,207,207,0.1)] rounded animate-pulse" />
                  <div className="h-4 w-4 bg-[rgba(207,207,207,0.15)] rounded animate-pulse" />
                </div>
              </CardContent>
            </>
          ) : variant === 'stat' ? (
            // Stat card variant
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="h-4 w-32 bg-[rgba(207,207,207,0.15)] rounded animate-pulse" />
                <div className="h-8 w-24 bg-[rgba(207,207,207,0.2)] rounded animate-pulse" />
                <div className="h-3 w-40 bg-[rgba(207,207,207,0.1)] rounded animate-pulse" />
              </div>
            </CardContent>
          ) : (
            // Default card variant
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="h-5 w-3/4 bg-[rgba(207,207,207,0.2)] rounded animate-pulse" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-[rgba(207,207,207,0.1)] rounded animate-pulse" />
                  <div className="h-3 w-5/6 bg-[rgba(207,207,207,0.1)] rounded animate-pulse" />
                </div>
                <div className="pt-2">
                  <div className="h-8 w-20 bg-[rgba(75,142,255,0.2)] rounded animate-pulse" />
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
