"use client";

import { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Star, Info, Sparkles } from 'lucide-react';
import { useFormattingProfiles, useDefaultProfile } from '@/hooks/useFormattingProfiles';
import { Skeleton } from '@/components/ui/skeleton';
import type { SubscriptionTier } from './TierGate';

interface FormattingProfileSelectorProps {
  /**
   * Selected profile ID
   */
  value: string | null;

  /**
   * Callback when selection changes
   */
  onChange: (profileId: string | null) => void;

  /**
   * Current user's tier
   */
  userTier?: SubscriptionTier;

  /**
   * Whether the selector is disabled
   */
  disabled?: boolean;
}

export function FormattingProfileSelector({
  value,
  onChange,
  userTier = 'free',
  disabled = false,
}: FormattingProfileSelectorProps) {
  const { data: profilesData, isLoading: isLoadingProfiles } = useFormattingProfiles();
  const { data: defaultData, isLoading: isLoadingDefault } = useDefaultProfile();

  const profiles = profilesData?.profiles || [];
  const defaultProfile = defaultData?.default_profile;

  const hasAccess = userTier === 'professional' || userTier === 'premium';
  const isLoading = isLoadingProfiles || isLoadingDefault;

  // Auto-select default profile on mount if no value is set
  useEffect(() => {
    if (!value && defaultProfile && hasAccess) {
      onChange(defaultProfile.profile_id);
    }
  }, [defaultProfile, value, onChange, hasAccess]);

  // If user doesn't have access, show upgrade prompt
  if (!hasAccess) {
    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          Report Formatting
          <Badge variant="secondary" className="bg-violet-100 text-violet-700">
            <Sparkles className="w-3 h-3 mr-1" />
            Professional
          </Badge>
        </Label>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
          Custom formatting is available for Professional and Premium users.{' '}
          <a href="/pricing" className="text-emerald-600 hover:underline font-medium">
            Upgrade to unlock
          </a>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Report Formatting</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  // No profiles available
  if (profiles.length === 0) {
    return (
      <div className="space-y-2">
        <Label>Report Formatting</Label>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          No custom formatting profiles yet.{' '}
          <a href="/app/settings" className="text-blue-900 hover:underline font-medium">
            Create one in settings
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor="formatting-profile">Report Formatting</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="inline-flex items-center justify-center" type="button">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">
                Select a formatting profile to apply custom styles to your exported report.
                Leave as &quot;System Default&quot; to use standard formatting.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Select
        value={value || '__system_default__'}
        onValueChange={(val) => onChange(val === '__system_default__' ? null : val)}
        disabled={disabled}
      >
        <SelectTrigger id="formatting-profile" className="border-2 focus:border-emerald-500">
          <SelectValue placeholder="System Default" />
        </SelectTrigger>
        <SelectContent>
          {/* System Default Option */}
          <SelectItem value="__system_default__">
            <div className="flex items-center gap-2">
              <span>System Default</span>
            </div>
          </SelectItem>

          {/* Default Profile (if exists) */}
          {defaultProfile && (
            <SelectItem value={defaultProfile.profile_id}>
              <div className="flex items-center gap-2">
                <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                <span>{defaultProfile.profile_name}</span>
                <Badge variant="secondary" className="ml-auto bg-emerald-100 text-emerald-700 text-xs">
                  Default
                </Badge>
              </div>
            </SelectItem>
          )}

          {/* Other Profiles */}
          {profiles
            .filter((p) => !p.is_default)
            .map((profile) => (
              <SelectItem key={profile.profile_id} value={profile.profile_id}>
                <div className="flex items-center gap-2">
                  <span>{profile.profile_name}</span>
                </div>
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {/* Selected profile info */}
      {value && (
        <p className="text-xs text-gray-500">
          {profiles.find((p) => p.profile_id === value)?.profile_name || 'Selected profile'} will
          be used for formatting
        </p>
      )}
      {!value && (
        <p className="text-xs text-gray-500">
          Standard system formatting will be applied
        </p>
      )}
    </div>
  );
}
