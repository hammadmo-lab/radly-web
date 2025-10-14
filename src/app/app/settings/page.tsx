"use client"

import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/components/auth-provider'
import { getSupabaseClient } from '@/lib/supabase'
import { httpGet } from '@/lib/http'
import { UserProfile } from '@/types'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Settings, Wifi, Palette, 
  Save, CheckCircle, AlertCircle, Clock, 
  Eye, Download, Upload,
  Activity, Lock
} from 'lucide-react'

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const { user } = useAuth()
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

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      return data as UserProfile
    },
    enabled: !!user,
  })

  useEffect(() => {
    if (profile) {
      setDefaultSignatureName(profile.default_signature_name || '')
      setDefaultDateFormat(profile.default_signature_date_format || 'MM/DD/YYYY')
      setLastSaved(profile.updated_at ? new Date(profile.updated_at) : null)
    }
  }, [profile])

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !hasUnsavedChanges) return

    const timeoutId = setTimeout(() => {
      handleSaveSettings(true) // Silent save
    }, 2000)

    return () => clearTimeout(timeoutId)
  }, [defaultSignatureName, defaultDateFormat, autoSave, hasUnsavedChanges])

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
        await httpGet('/v1/health')
        setConnectivityStatus('connected')
      } catch {
        setConnectivityStatus('error')
      }
    }

    testConnectivity()
  }, [])

  const handleSaveSettings = useCallback(async (silent = false) => {
    if (!user) return

    setIsSaving(true)
    try {
      const supabase = getSupabaseClient()
      const profileData = {
        id: user.id,
        default_signature_name: defaultSignatureName,
        default_signature_date_format: defaultDateFormat,
      };
      const { error } = await supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from('profiles' as any)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .upsert(profileData as any)

      if (error) throw error
      
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
      
      if (!silent) {
        toast.success('Settings saved successfully!')
      }
    } catch {
      if (!silent) {
        toast.error('Failed to save settings')
      }
    } finally {
      setIsSaving(false)
    }
  }, [user, defaultSignatureName, defaultDateFormat])

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Data Export</Label>
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Export Profile Data
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Data Import</Label>
                    <Button variant="outline" className="w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      Import Settings
                    </Button>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Reset to Defaults</Label>
                      <p className="text-xs text-gray-500">Reset all settings to their default values</p>
                    </div>
                    <Button variant="destructive" size="sm">
                      Reset All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
