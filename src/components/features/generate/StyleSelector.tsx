"use client"

import { useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useStyleProfiles } from '@/hooks/use-style-profiles'

interface StyleSelectorProps {
  /** Currently selected profile ID, or undefined for "None" */
  value: string | undefined
  /** Called with a profile ID, or undefined when "None" is selected */
  onChange: (value: string | undefined) => void
}

/**
 * Optional style profile selector for the report generation form.
 *
 * Renders nothing when:
 * - data is still loading
 * - the user has no active style profiles
 * - the API returns 403 (free/starter tier — silently hidden)
 *
 * Pre-selects the user's default active profile on first render.
 */
export function StyleSelector({ value, onChange }: StyleSelectorProps) {
  const { data, isLoading } = useStyleProfiles()

  const activeProfiles = (data?.profiles ?? []).filter((p) => p.status === 'active')

  // Pre-select the default profile on first mount when no value is set
  useEffect(() => {
    if (value !== undefined) return
    const defaultProfile = activeProfiles.find((p) => p.is_default)
    if (defaultProfile) onChange(defaultProfile.id)
  // Only run once when active profiles first arrive
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfiles.length])

  // Don't render while loading, or when no active profiles are available
  if (isLoading || activeProfiles.length === 0) return null

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-[rgba(207,207,207,0.85)]">
        Style Profile <span className="text-[rgba(207,207,207,0.45)] font-normal">(optional)</span>
      </label>
      <Select
        value={value ?? ''}
        onValueChange={(v) => onChange(v || undefined)}
      >
        <SelectTrigger className="border border-[rgba(255,255,255,0.12)] bg-[rgba(12,16,28,0.8)] text-white focus:border-[rgba(143,130,255,0.55)]">
          <SelectValue placeholder="None (backend default)" />
        </SelectTrigger>
        <SelectContent className="border border-[rgba(255,255,255,0.12)] bg-[rgba(12,14,24,0.95)] text-white">
          {activeProfiles.map((profile) => (
            <SelectItem key={profile.id} value={profile.id}>
              {profile.name}
              {profile.is_default ? ' ★' : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-[rgba(207,207,207,0.45)]">
        Style affects formatting only, not medical content.
      </p>
    </div>
  )
}
