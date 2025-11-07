'use client';

import { Users, TrendingUp, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface QueuePositionDisplayProps {
  /** Position in queue (0 = first, 1 = second, etc.) */
  queuePosition?: number | null;
  /** Number of jobs currently running */
  jobsRunning?: number | null;
  /** Estimated wait time as formatted string */
  estimatedTime?: string | null;
  /** Show detailed view or compact view */
  variant?: 'compact' | 'detailed';
}

export function QueuePositionDisplay({
  queuePosition,
  jobsRunning,
  estimatedTime,
  variant = 'detailed',
}: QueuePositionDisplayProps) {
  const isQueued = (queuePosition ?? 0) > 0;
  const isRunning = !isQueued;

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[rgba(75,142,255,0.12)] border border-[rgba(75,142,255,0.25)]">
        {isRunning ? (
          <>
            <Zap className="w-4 h-4 text-[#3FBF8C] animate-pulse" />
            <span className="text-sm font-medium">Generating your report...</span>
          </>
        ) : (
          <>
            <Users className="w-4 h-4 text-[#F8B74D]" />
            <span className="text-sm font-medium">
              {queuePosition === 1
                ? 'Next in queue'
                : `${queuePosition} ahead of you`}
            </span>
            {estimatedTime && (
              <span className="text-xs text-[rgba(207,207,207,0.6)] ml-auto">
                ~{estimatedTime}
              </span>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <Card className="aurora-card border border-[rgba(75,142,255,0.25)]">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Main Status */}
          <div className="flex items-start gap-3">
            {isRunning ? (
              <div className="flex items-center gap-3 flex-1">
                <Zap className="w-5 h-5 text-[#3FBF8C] animate-pulse flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">Report Generating</p>
                  <p className="text-xs text-[rgba(207,207,207,0.65)]">
                    Processing your imaging data...
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-1">
                <Users className="w-5 h-5 text-[#F8B74D] flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">
                    {queuePosition === 1
                      ? 'Next in Queue'
                      : `${queuePosition} reports ahead`}
                  </p>
                  <p className="text-xs text-[rgba(207,207,207,0.65)]">
                    Your report will start processing soon
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Details Grid */}
          {!isRunning && (
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[rgba(255,255,255,0.08)]">
              <div>
                <p className="text-xs text-[rgba(207,207,207,0.55)] uppercase mb-1">
                  Queue Position
                </p>
                <p className="text-lg font-semibold text-[#F8B74D]">
                  #{queuePosition}
                </p>
              </div>

              {estimatedTime && (
                <div>
                  <p className="text-xs text-[rgba(207,207,207,0.55)] uppercase mb-1">
                    Est. Wait Time
                  </p>
                  <p className="text-lg font-semibold text-[#4B8EFF]">
                    ~{estimatedTime}
                  </p>
                </div>
              )}
            </div>
          )}

          {jobsRunning !== null && jobsRunning !== undefined && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(207,207,207,0.05)]">
              <TrendingUp className="w-4 h-4 text-[rgba(207,207,207,0.6)]" />
              <span className="text-xs text-[rgba(207,207,207,0.65)]">
                {jobsRunning} {jobsRunning === 1 ? 'report' : 'reports'} processing
              </span>
            </div>
          )}

          {/* Tip */}
          <div className="text-xs text-[rgba(207,207,207,0.5)] leading-relaxed">
            💡 Queue position updates every 15 seconds. You can close this page and come back
            anytime.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
