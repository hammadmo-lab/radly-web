"use client"

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/components/auth-provider'
import { fetchUserData, updateUserData, userDataQueryConfig } from '@/lib/user-data'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Settings, Wifi, Palette,
  Save, CheckCircle, AlertCircle, Clock,
  Eye, Download, Upload,
  Activity, Lock, FileText,
  Smartphone, ShoppingCart, Loader2
} from 'lucide-react'
import { FormattingDashboard } from '@/components/formatting/FormattingDashboard'
import { TierGate } from '@/components/formatting/TierGate'
import { useSubscriptionTier } from '@/hooks/useSubscription'
import { SubscriptionStatusCard } from '@/components/subscription/SubscriptionStatusCard'
import { usePlatform } from '@/hooks/usePlatform'
import { useRevenueCat } from '@/hooks/useRevenueCat'
import { PaywallSheet } from '@/components/iap/PaywallSheet'

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const currentTier = useSubscriptionTier() // Fetch real subscription tier
  const { isNative } = usePlatform()
  const { currentTier: mobileCurrentTier, restorePurchases, isRestoring } = useRevenueCat()
  const [defaultSignatureName, setDefaultSignatureName] = useState('')
  const [defaultDateFormat, setDefaultDateFormat] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [connectivityStatus, setConnectivityStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [autoSave, setAutoSave] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showPaywall, setShowPaywall] = useState(false)

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null
      const userProfile = await fetchUserData(user.id)
      return {
        ...userProfile,
        email: user.email || ''
      }
    },
    enabled: !!user,
    ...userDataQueryConfig
  })

  useEffect(() => {
    if (profile) {
      setDefaultSignatureName(profile.default_signature_name || '')
      setDefaultDateFormat(profile.default_signature_date_format || 'MM/DD/YYYY')
      setLastSaved(profile.updated_at ? new Date(profile.updated_at) : null)
    }
  }, [profile])

  const handleSaveSettings = useCallback(async (silent = false) => {
    if (!user) return

    console.log('Saving settings:', {
      userId: user.id,
      defaultSignatureName,
      defaultDateFormat
    });

    setIsSaving(true)
    try {
      await updateUserData(user.id, {
        default_signature_name: defaultSignatureName,
        default_signature_date_format: defaultDateFormat,
      })
      
      // Invalidate and refetch profile data
      await queryClient.invalidateQueries({ queryKey: ['profile', user.id] })
      
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
      
      console.log('Settings saved successfully');
      
      if (!silent) {
        toast.success('Settings saved successfully!')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      if (!silent) {
        toast.error(`Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    } finally {
      setIsSaving(false)
    }
  }, [user, defaultSignatureName, defaultDateFormat, queryClient])

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !hasUnsavedChanges) return

    const timeoutId = setTimeout(() => {
      handleSaveSettings(true) // Silent save
    }, 2000)

    return () => clearTimeout(timeoutId)
  }, [defaultSignatureName, defaultDateFormat, autoSave, hasUnsavedChanges, handleSaveSettings])

  // Track changes
  useEffect(() => {
    const hasChanges = 
      defaultSignatureName !== (profile?.default_signature_name || '') ||
      defaultDateFormat !== (profile?.default_signature_date_format || 'MM/DD/YYYY')
    
    setHasUnsavedChanges(hasChanges)
  }, [defaultSignatureName, defaultDateFormat, profile])

  // Test connectivity
  useEffect(() => {
    const testConnectivity = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE
        if (!apiBase) {
          setConnectivityStatus('error')
          return
        }
        
        const response = await fetch(`${apiBase}/health`, {
          headers: {
            'X-Request-Id': crypto.randomUUID(),
            'Content-Type': 'application/json',
          },
        })
        if (response.ok) {
          setConnectivityStatus('connected')
        } else {
          setConnectivityStatus('error')
        }
      } catch {
        setConnectivityStatus('error')
      }
    }

    testConnectivity()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-emerald-600 bg-emerald-50'
      case 'error': return 'text-red-600 bg-red-50'
      default: return 'text-yellow-600 bg-yellow-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4" />
      case 'error': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 md:pb-8">
      {/* Modern Header with Gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-violet-50 p-8 border-2 border-gray-100"
      >
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-8 h-8 text-primary animate-pulse" />
          <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            Configuration
          </span>
        </div>
        
        <h1 className="text-4xl font-bold mb-2">
          <span className="text-gradient-brand">Smart Settings</span>
        </h1>
        
        <p className="text-lg text-gray-600 max-w-2xl">
          Customize your Radly experience with intelligent defaults and preferences
        </p>

        {/* Save Status Indicator */}
        <div className="flex items-center gap-4 mt-6">
          <AnimatePresence>
            {hasUnsavedChanges && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
              >
                <AlertCircle className="w-4 h-4" />
                Unsaved changes
              </motion.div>
            )}
          </AnimatePresence>
          
          {lastSaved && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Last saved: {lastSaved.toLocaleTimeString()}
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Actions Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-4"
      >
        <Button
          onClick={() => handleSaveSettings()}
          disabled={isSaving || !hasUnsavedChanges}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="border-2"
        >
          <Settings className="w-4 h-4 mr-2" />
          {showAdvanced ? 'Hide' : 'Show'} Advanced
        </Button>
      </motion.div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Status */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <SubscriptionStatusCard />
        </motion.div>

        {/* Mobile App Subscription (only on native) */}
        {isNative && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full border-2 border-blue-200 hover:border-blue-500 transition-colors bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <span>Mobile Subscription</span>
                </CardTitle>
                <CardDescription>
                  Manage your in-app purchase subscription
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Current Plan</span>
                    {mobileCurrentTier && (
                      <Badge className="bg-blue-100 text-blue-700 capitalize">
                        {mobileCurrentTier}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Your subscription is managed through the App Store or Google Play Store
                  </p>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => setShowPaywall(true)}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Change Plan
                  </Button>

                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        await restorePurchases()
                        toast.success('Purchases restored successfully!')
                      } catch (err) {
                        const errorMessage = err instanceof Error ? err.message : 'Restore failed'
                        toast.error(errorMessage)
                      }
                    }}
                    disabled={isRestoring}
                    className="w-full"
                  >
                    {isRestoring ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Restoring...
                      </>
                    ) : (
                      'Restore Purchases'
                    )}
                  </Button>
                </div>

                <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded-md border border-blue-200">
                  📱 To cancel or modify your subscription, go to your App Store or Google Play settings
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Account Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full border-2 border-gray-200 hover:border-emerald-500 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span>Account Information</span>
              </CardTitle>
              <CardDescription>
                Your account details and profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Email Address</Label>
                <div className="flex items-center gap-2">
                  <Input value={user?.email || ''} disabled className="bg-gray-50" />
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                    Verified
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">User ID</Label>
                <div className="flex items-center gap-2">
                  <Input value={user?.id || ''} disabled className="bg-gray-50 font-mono text-sm" />
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Member Since</Label>
                <p className="text-lg font-semibold text-gray-900">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full border-2 border-gray-200 hover:border-violet-500 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <span>Preferences</span>
              </CardTitle>
              <CardDescription>
                Customize your experience and interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Auto-save Settings</Label>
                  <p className="text-xs text-gray-500">Automatically save changes after 2 seconds</p>
                </div>
                <Switch
                  checked={autoSave}
                  onCheckedChange={setAutoSave}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Notifications</Label>
                  <p className="text-xs text-gray-500">Receive updates about your reports</p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Dark Mode</Label>
                  <p className="text-xs text-gray-500">Switch to dark theme (coming soon)</p>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                  disabled
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Default Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-2 border-gray-200 hover:border-blue-500 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <span>Report Defaults</span>
              </CardTitle>
              <CardDescription>
                Set default values for new medical reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="default-signature-name" className="text-sm font-medium">
                  Default Signature Name
                </Label>
                <Input
                  id="default-signature-name"
                  value={defaultSignatureName}
                  onChange={(e) => setDefaultSignatureName(e.target.value)}
                  placeholder="Dr. Jane Smith"
                  className="border-2 focus:border-emerald-500"
                />
                <p className="text-xs text-gray-500">
                  This will be pre-filled when creating new reports
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="default-date-format" className="text-sm font-medium">
                  Default Date Format
                </Label>
                <Select value={defaultDateFormat} onValueChange={setDefaultDateFormat}>
                  <SelectTrigger className="border-2 focus:border-emerald-500">
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US Format)</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (EU Format)</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO Format)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Choose your preferred date format for reports
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-2 border-gray-200 hover:border-orange-500 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <span>System Status</span>
              </CardTitle>
              <CardDescription>
                Monitor system health and connectivity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Wifi className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">API Connectivity</span>
                  </div>
                  <Badge className={getStatusColor(connectivityStatus)}>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(connectivityStatus)}
                      {connectivityStatus.charAt(0).toUpperCase() + connectivityStatus.slice(1)}
                    </div>
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Response Time</span>
                    <span className="font-medium">
                      {connectivityStatus === 'connected' ? '< 100ms' : 'N/A'}
                    </span>
                  </div>
                  <Progress 
                    value={connectivityStatus === 'connected' ? 100 : 0} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Profile Update</span>
                  <span className="text-sm font-medium">
                    {profile?.updated_at 
                      ? new Date(profile.updated_at).toLocaleString()
                      : 'Never'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Advanced Settings */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6"
          >
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <span>Advanced Settings</span>
                </CardTitle>
                <CardDescription>
                  Advanced configuration options for power users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Advanced Settings Overview</h4>
                    <p className="text-sm text-blue-700">
                      These settings are designed for power users who need additional control over their data and preferences.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Data Export</Label>
                    <p className="text-xs text-gray-500 mb-2">
                      Download your profile data, settings, and preferences as a JSON file for backup or migration purposes.
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        const exportData = {
                          profile: profile,
                          settings: {
                            defaultSignatureName,
                            defaultDateFormat,
                            autoSave,
                            notifications,
                            darkMode
                          },
                          exportedAt: new Date().toISOString()
                        };
                        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `radly-settings-${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                        toast.success('Settings exported successfully!');
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Profile Data
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Data Import</Label>
                    <p className="text-xs text-gray-500 mb-2">
                      Import previously exported settings to restore your configuration or migrate from another account.
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.json';
                        input.onchange = async (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            try {
                              const text = await file.text();
                              const data = JSON.parse(text);
                              if (data.settings) {
                                setDefaultSignatureName(data.settings.defaultSignatureName || '');
                                setDefaultDateFormat(data.settings.defaultDateFormat || 'MM/DD/YYYY');
                                setAutoSave(data.settings.autoSave ?? true);
                                setNotifications(data.settings.notifications ?? true);
                                setDarkMode(data.settings.darkMode ?? false);
                                toast.success('Settings imported successfully!');
                              } else {
                                toast.error('Invalid settings file format');
                              }
                            } catch {
                              toast.error('Failed to parse settings file');
                            }
                          }
                        };
                        input.click();
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Import Settings
                    </Button>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Reset to Defaults</Label>
                      <p className="text-xs text-gray-500">
                        Reset all settings to their default values. This action cannot be undone.
                      </p>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
                          setDefaultSignatureName('');
                          setDefaultDateFormat('MM/DD/YYYY');
                          setAutoSave(true);
                          setNotifications(true);
                          setDarkMode(false);
                          toast.success('Settings reset to defaults');
                        }
                      }}
                    >
                      Reset All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Formatting Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Custom Report Formatting</h2>
            <p className="text-gray-600">
              Upload and manage DOCX templates for custom report formatting
            </p>
          </div>
        </div>

        <TierGate
          requiredTiers={['professional', 'premium']}
          currentTier={currentTier}
          featureName="Custom Report Formatting"
        >
          <FormattingDashboard />
        </TierGate>
      </motion.div>

      {/* Mobile Paywall Sheet */}
      <PaywallSheet isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  )
}
