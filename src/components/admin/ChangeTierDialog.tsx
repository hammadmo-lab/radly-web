"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useActivateSubscription } from '@/hooks/useAdminData'
import { TierInfo, RegionInfo } from '@/types/admin'

const changeTierSchema = z.object({
  tier_name: z.string().min(1, 'Tier is required'),
  region: z.string().min(1, 'Region is required'),
  payment_proof: z.string().optional(),
})

type ChangeTierFormData = z.infer<typeof changeTierSchema>

interface ChangeTierDialogProps {
  isOpen: boolean
  onClose: () => void
  userEmail: string
}

const TIERS: TierInfo[] = [
  {
    name: 'free',
    display_name: 'Free',
    reports_limit: 5,
    price: 0,
    currency: 'USD',
    features: ['5 reports per month', 'Basic templates', 'Email support'],
  },
  {
    name: 'starter',
    display_name: 'Starter',
    reports_limit: 50,
    price: 29,
    currency: 'USD',
    features: ['50 reports per month', 'All templates', 'Priority support', 'Export options'],
  },
  {
    name: 'professional',
    display_name: 'Professional',
    reports_limit: 200,
    price: 79,
    currency: 'USD',
    features: ['200 reports per month', 'All templates', 'Priority support', 'Advanced export', 'API access'],
  },
  {
    name: 'premium',
    display_name: 'Premium',
    reports_limit: 500,
    price: 149,
    currency: 'USD',
    features: ['500 reports per month', 'All templates', '24/7 support', 'Advanced export', 'API access', 'Custom integrations'],
  },
]

const REGIONS: RegionInfo[] = [
  {
    name: 'egypt',
    display_name: 'Egypt',
    currency: 'EGP',
    exchange_rate: 30,
  },
  {
    name: 'international',
    display_name: 'International',
    currency: 'USD',
  },
]

export function ChangeTierDialog({ 
  isOpen, 
  onClose, 
  userEmail
}: ChangeTierDialogProps) {
  const [selectedTier, setSelectedTier] = useState<string>('')
  const [selectedRegion, setSelectedRegion] = useState<string>('')
  const { mutate: activateSubscription, isPending } = useActivateSubscription()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ChangeTierFormData>({
    resolver: zodResolver(changeTierSchema),
  })

  const handleTierChange = (tier: string) => {
    setSelectedTier(tier)
    setValue('tier_name', tier)
  }

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region)
    setValue('region', region)
  }

  const onSubmit = (data: ChangeTierFormData) => {
    activateSubscription({
      user_email: userEmail,
      tier_name: data.tier_name,
      region: data.region,
      payment_proof: data.payment_proof,
    }, {
      onSuccess: () => {
        onClose()
        reset()
        setSelectedTier('')
        setSelectedRegion('')
      },
    })
  }

  const handleClose = () => {
    onClose()
    reset()
    setSelectedTier('')
    setSelectedRegion('')
  }

  const selectedTierInfo = TIERS.find(t => t.name === selectedTier)
  const selectedRegionInfo = REGIONS.find(r => r.name === selectedRegion)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Change Subscription Tier</DialogTitle>
          <DialogDescription>
            Upgrade or downgrade the subscription for {userEmail}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tier_name">New Tier</Label>
              <Select onValueChange={handleTierChange} value={selectedTier}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  {TIERS.map((tier) => (
                    <SelectItem key={tier.name} value={tier.name}>
                      <div className="flex items-center justify-between w-full">
                        <span>{tier.display_name}</span>
                        <Badge variant="outline" className="ml-2">
                          ${tier.price}/mo
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tier_name && (
                <p className="text-sm text-red-600">{errors.tier_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select onValueChange={handleRegionChange} value={selectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((region) => (
                    <SelectItem key={region.name} value={region.name}>
                      {region.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.region && (
                <p className="text-sm text-red-600">{errors.region.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_proof">Payment Proof (Optional)</Label>
            <Input
              id="payment_proof"
              placeholder="Transaction ID or payment reference"
              {...register('payment_proof')}
            />
            {errors.payment_proof && (
              <p className="text-sm text-red-600">{errors.payment_proof.message}</p>
            )}
          </div>

          {/* Tier Preview */}
          {selectedTierInfo && selectedRegionInfo && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Subscription Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Tier:</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {selectedTierInfo.display_name}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Reports Limit:</span>
                    <span className="font-mono">{selectedTierInfo.reports_limit}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Price:</span>
                    <span className="font-mono">
                      {selectedRegionInfo.currency} {selectedTierInfo.price}
                      {selectedRegionInfo.exchange_rate && (
                        <span className="text-sm text-gray-500 ml-1">
                          (~{selectedRegionInfo.currency} {(selectedTierInfo.price * selectedRegionInfo.exchange_rate).toFixed(0)})
                        </span>
                      )}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium block mb-2">Features:</span>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {selectedTierInfo.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending || !selectedTier || !selectedRegion}
              className="bg-gradient-to-r from-emerald-500 to-violet-500 hover:from-emerald-600 hover:to-violet-600"
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Upgrading...
                </div>
              ) : (
                'Upgrade Subscription'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
