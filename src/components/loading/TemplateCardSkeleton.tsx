import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function TemplateCardSkeleton() {
  return (
    <Card className="overflow-hidden border-2 aurora-card border-[rgba(255,255,255,0.08)] p-5 sm:p-6 flex flex-col h-full">
      {/* Header area with settings button placeholder */}
      <div className="relative mb-4">
        <Skeleton className="absolute top-0 right-0 w-10 h-10 rounded-lg" />
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 space-y-3">
        {/* Badges skeleton */}
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>

        {/* Title skeleton */}
        <Skeleton className="h-6 w-3/4" />

        {/* Description skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>

      {/* Button area at bottom */}
      <div className="mt-auto pt-3">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </Card>
  )
}
