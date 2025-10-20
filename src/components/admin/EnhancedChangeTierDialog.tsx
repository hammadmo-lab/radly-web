"use client"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useChangeTier } from '@/hooks/useAdminData'
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react'

interface EnhancedChangeTierDialogProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  userEmail?: string
  currentTier?: string
}

const TIERS = [
  { value: 'free', label: 'Free', limit: 5 },
  { value: 'starter', label: 'Starter', limit: 50 },
  { value: 'professional', label: 'Professional', limit: 200 },
  { value: 'premium', label: 'Premium', limit: 1000 },
]

const REGIONS = [
  { value: 'egypt', label: 'Egypt (EGP)' },
  { value: 'international', label: 'International (USD)' },
]

export function EnhancedChangeTierDialog({
  isOpen,
  onClose,
  userId,
  userEmail,
  currentTier = 'free',
}: EnhancedChangeTierDialogProps) {
  const [selectedTier, setSelectedTier] = useState(currentTier)
  const [selectedRegion, setSelectedRegion] = useState('egypt')
  const changeTier = useChangeTier()

  const handleChangeTier = async () => {
    if (!selectedTier) return

    try {
      await changeTier.mutateAsync({
        userId,
        tierName: selectedTier,
        region: selectedRegion,
      })
      onClose()
    } catch (error) {
      // Error is handled in the mutation
      console.error('Change tier error:', error)
    }
  }

  const handleClose = () => {
    setSelectedTier(currentTier)
    setSelectedRegion('egypt')
    onClose()
  }

  const currentTierInfo = TIERS.find((t) => t.value === currentTier)
  const selectedTierInfo = TIERS.find((t) => t.value === selectedTier)
  const isUpgrade =
    TIERS.findIndex((t) => t.value === selectedTier) >
    TIERS.findIndex((t) => t.value === currentTier)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isUpgrade ? (
              <ArrowUpCircle className="w-5 h-5 text-green-600" />
            ) : (
              <ArrowDownCircle className="w-5 h-5 text-orange-600" />
            )}
            Change User Tier
          </DialogTitle>
          <DialogDescription>
            Update the subscription tier for this user. This will take effect immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {userEmail && (
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm font-medium">User:</p>
              <p className="text-sm text-muted-foreground font-mono mt-1">{userEmail}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Current Tier: <span className="font-semibold">{currentTierInfo?.label}</span> (
                {currentTierInfo?.limit} reports/month)
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="tier">New Tier</Label>
            <Select value={selectedTier} onValueChange={setSelectedTier}>
              <SelectTrigger id="tier">
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent>
                {TIERS.map((tier) => (
                  <SelectItem key={tier.value} value={tier.value}>
                    {tier.label} ({tier.limit} reports/month)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="region">Region</Label>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger id="region">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((region) => (
                  <SelectItem key={region.value} value={region.value}>
                    {region.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTier !== currentTier && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950 p-3">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {isUpgrade ? 'Upgrade' : 'Downgrade'} Summary:
              </p>
              <div className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <p>
                  • From: <span className="font-semibold">{currentTierInfo?.label}</span> (
                  {currentTierInfo?.limit} reports)
                </p>
                <p>
                  • To: <span className="font-semibold">{selectedTierInfo?.label}</span> (
                  {selectedTierInfo?.limit} reports)
                </p>
                <p>• Region: {REGIONS.find((r) => r.value === selectedRegion)?.label}</p>
                <p className="mt-2 text-xs">
                  ⚠️ The user&apos;s current usage counters will be reset to match the new tier limits.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={changeTier.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleChangeTier}
            disabled={selectedTier === currentTier || changeTier.isPending}
          >
            {changeTier.isPending ? 'Changing...' : 'Change Tier'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
