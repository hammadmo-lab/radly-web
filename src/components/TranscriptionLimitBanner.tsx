// Transcription Limit Banner Component

'use client';

import { Mic, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import type { SubscriptionTier } from '@/types/transcription';
import { TIER_CONFIGS } from '@/types/transcription';

export interface TranscriptionLimitBannerProps {
  tier: SubscriptionTier;
  used: number;
  limit?: number;
  className?: string;
}

export function TranscriptionLimitBanner({
  tier,
  used,
  limit,
  className,
}: TranscriptionLimitBannerProps) {
  const config = TIER_CONFIGS[tier];

  // Don't show banner if tier doesn't have access
  if (!config.hasAccess) {
    return null;
  }

  // Calculate limits
  const totalLimit = limit || config.dailyLimit || config.trialLimit || 0;
  const remaining = Math.max(0, totalLimit - used);
  const percentage = totalLimit > 0 ? (used / totalLimit) * 100 : 0;

  // Determine status
  const isWarning = percentage >= 80 && percentage < 100;
  const isDanger = percentage >= 100 || remaining === 0;
  const isInfo = percentage < 80;

  const getMessage = () => {
    if (config.isTrial) {
      if (remaining === 0) {
        return `You've used all ${totalLimit} free trials. Upgrade to continue.`;
      }
      return `${remaining} of ${totalLimit} free trial${remaining === 1 ? '' : 's'} remaining`;
    }

    if (remaining === 0) {
      return `Daily limit reached (${totalLimit}). Limit resets tomorrow.`;
    }

    return `${remaining} of ${totalLimit} transcriptions remaining today`;
  };

  const getIcon = () => {
    if (isDanger) {
      return <AlertTriangle className="h-4 w-4" />;
    }
    if (isWarning) {
      return <AlertTriangle className="h-4 w-4" />;
    }
    return <Mic className="h-4 w-4" />;
  };

  const getVariant = (): 'default' | 'destructive' => {
    if (isDanger) return 'destructive';
    return 'default';
  };

  return (
    <Alert
      variant={getVariant()}
      className={cn(
        'border-l-4',
        isDanger && 'border-l-destructive bg-destructive/5',
        isWarning && 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20',
        isInfo && 'border-l-primary bg-primary/5',
        className
      )}
    >
      <div className="flex items-start gap-2">
        <div className="mt-0.5">{getIcon()}</div>
        <div className="flex-1 space-y-2">
          <AlertDescription className="text-sm font-medium">
            {getMessage()}
          </AlertDescription>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                isDanger && 'bg-destructive',
                isWarning && 'bg-yellow-500',
                isInfo && 'bg-primary'
              )}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>

          {/* Additional info */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Info className="h-3 w-3" />
            <span>
              {config.isTrial ? (
                `Trial limit: ${totalLimit} lifetime transcriptions`
              ) : (
                <>
                  Resets daily • Max {Math.floor(config.maxDuration / 60)} min per recording
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </Alert>
  );
}
