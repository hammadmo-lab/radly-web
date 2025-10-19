"use client";

import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Sparkles, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export type SubscriptionTier = 'free' | 'starter' | 'professional' | 'premium';

interface TierGateProps {
  /**
   * Tiers that have access to this feature
   */
  requiredTiers: SubscriptionTier[];

  /**
   * Current user's tier
   * TODO: This should come from user data once subscription tiers are implemented
   */
  currentTier?: SubscriptionTier;

  /**
   * Name of the feature being gated
   */
  featureName: string;

  /**
   * Children to render if user has access
   */
  children: ReactNode;

  /**
   * Optional custom upgrade message
   */
  upgradeMessage?: string;
}

const tierColors: Record<SubscriptionTier, string> = {
  free: 'bg-gray-100 text-gray-700',
  starter: 'bg-blue-100 text-blue-700',
  professional: 'bg-emerald-100 text-emerald-700',
  premium: 'bg-violet-100 text-violet-700',
};

const tierFeatures: Record<SubscriptionTier, string[]> = {
  free: ['Basic report generation', '5 reports per month', 'Standard templates'],
  starter: ['All Free features', '50 reports per month', 'Priority support'],
  professional: [
    'All Starter features',
    'Unlimited reports',
    'Custom formatting',
    'Advanced templates',
    'Team collaboration',
  ],
  premium: [
    'All Professional features',
    'Dedicated support',
    'Custom integrations',
    'Advanced analytics',
    'White-label option',
  ],
};

export function TierGate({
  requiredTiers,
  currentTier = 'free', // Default to free tier for now
  featureName,
  children,
  upgradeMessage,
}: TierGateProps) {
  // Check if user has access
  const hasAccess = requiredTiers.includes(currentTier);

  // If user has access, render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // Get the minimum required tier
  const minRequiredTier = requiredTiers.includes('professional')
    ? 'professional'
    : requiredTiers.includes('premium')
    ? 'premium'
    : requiredTiers.includes('starter')
    ? 'starter'
    : 'free';

  // Otherwise, show upgrade prompt
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <Card className="border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 via-white to-gray-50">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-violet-500 flex items-center justify-center">
                <Lock className="w-8 h-8 text-white" />
              </div>
            </div>

            <CardTitle className="text-3xl font-bold mb-2">
              Unlock {featureName}
            </CardTitle>

            <CardDescription className="text-base">
              {upgradeMessage ||
                `${featureName} is available for ${minRequiredTier === 'professional' ? 'Professional' : 'Premium'} tier users`}
            </CardDescription>

            <div className="flex justify-center gap-2 mt-4">
              <Badge className={tierColors[currentTier]}>
                Current: {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
              </Badge>
              <Badge className={tierColors[minRequiredTier]}>
                <Sparkles className="w-3 h-3 mr-1" />
                Required: {minRequiredTier.charAt(0).toUpperCase() + minRequiredTier.slice(1)}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Feature comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">
                  Your Plan
                </h4>
                <div className="space-y-2">
                  {tierFeatures[currentTier].map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm bg-gradient-to-r from-emerald-600 to-violet-600 bg-clip-text text-transparent uppercase tracking-wide">
                  {minRequiredTier.charAt(0).toUpperCase() + minRequiredTier.slice(1)} Plan
                </h4>
                <div className="space-y-2">
                  {tierFeatures[minRequiredTier].map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-900 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                onClick={() => {
                  // TODO: Navigate to pricing page or upgrade flow
                  window.location.href = '/pricing';
                }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Upgrade to {minRequiredTier.charAt(0).toUpperCase() + minRequiredTier.slice(1)}
              </Button>
              <Button variant="outline" size="lg" onClick={() => window.history.back()}>
                Go Back
              </Button>
            </div>

            {/* Additional info */}
            <p className="text-xs text-center text-gray-500">
              Questions about pricing?{' '}
              <a href="/contact" className="text-emerald-600 hover:underline">
                Contact us
              </a>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
