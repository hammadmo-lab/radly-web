import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function TemplateCardSkeleton() {
  return (
    <Card className="overflow-hidden border-2">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            {/* Badges skeleton */}
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            {/* Title skeleton */}
            <Skeleton className="h-6 w-3/4" />
          </div>
          {/* Icon skeleton */}
          <Skeleton className="w-12 h-12 rounded-full shrink-0" />
        </div>
        {/* Description skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  )
}
