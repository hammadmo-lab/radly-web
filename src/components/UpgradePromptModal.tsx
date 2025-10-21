// Upgrade Prompt Modal for transcription feature

'use client';

import { Mic, Zap, Clock, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { SubscriptionTier } from '@/types/transcription';
import { TIER_CONFIGS } from '@/types/transcription';

export interface UpgradePromptModalProps {
  open: boolean;
  onClose: () => void;
  currentTier: SubscriptionTier;
  reason: 'trial_exhausted' | 'tier_blocked' | 'daily_limit';
  onUpgrade: () => void;
}

export function UpgradePromptModal({
  open,
  onClose,
  currentTier,
  reason,
  onUpgrade,
}: UpgradePromptModalProps) {
  const getMessage = () => {
    switch (reason) {
      case 'trial_exhausted':
        return {
          title: 'Free Trial Completed',
          description:
            "You've used your 3 free voice dictation trials. Upgrade to Professional or Premium to continue using this powerful feature.",
          icon: <Mic className="h-12 w-12 text-primary" />,
        };
      case 'tier_blocked':
        return {
          title: 'Premium Feature',
          description:
            'Voice dictation is available for Professional and Premium plans. Upgrade to unlock this feature and speed up your report generation.',
          icon: <Zap className="h-12 w-12 text-yellow-500" />,
        };
      case 'daily_limit':
        return {
          title: 'Daily Limit Reached',
          description:
            "You've reached your daily transcription limit. Upgrade to Premium for higher limits and longer recording times.",
          icon: <Clock className="h-12 w-12 text-orange-500" />,
        };
    }
  };

  const { title, description, icon } = getMessage();

  const getRecommendedPlan = (): 'professional' | 'premium' => {
    if (currentTier === 'free' || currentTier === 'starter') {
      return 'professional';
    }
    return 'premium';
  };

  const recommendedPlan = getRecommendedPlan();
  const config = TIER_CONFIGS[recommendedPlan];

  const features = [
    `${config.dailyLimit} transcriptions per day`,
    `Up to ${Math.floor(config.maxDuration / 60)} minutes per recording`,
    `${config.maxConcurrentStreams} concurrent streams`,
    'Medical terminology optimized',
    'Real-time transcription',
    'No trial limits',
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex justify-center mb-4">{icon}</div>
          <DialogTitle className="text-center text-2xl">{title}</DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h4 className="font-semibold text-lg mb-3 capitalize flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              {recommendedPlan} Plan
            </h4>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {currentTier === 'professional' && recommendedPlan === 'premium' && (
          <div className="text-sm text-muted-foreground text-center pb-2">
            Your current Professional plan gives you {TIER_CONFIGS.professional.dailyLimit}{' '}
            transcriptions per day. Upgrade to Premium for{' '}
            {TIER_CONFIGS.premium.dailyLimit} per day.
          </div>
        )}

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Maybe Later
          </Button>
          <Button onClick={onUpgrade} className="flex-1">
            Upgrade to {recommendedPlan}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
