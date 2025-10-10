"use client"

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/components/auth-provider'
import { getSupabaseClient } from '@/lib/supabase'
import { apiFetch } from '@/lib/api'
import { UserProfile } from '@/types'
import { toast } from 'sonner'
import { User, Settings, Shield, Wifi } from 'lucide-react'

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const { user } = useAuth()
  const [defaultSignatureName, setDefaultSignatureName] = useState('')
  const [defaultDateFormat, setDefaultDateFormat] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [connectivityStatus, setConnectivityStatus] = useState<'checking' | 'connected' | 'error'>('checking')

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
    }
  }, [profile])

  // Test connectivity
  useEffect(() => {
    const testConnectivity = async () => {
      try {
        await apiFetch('/health')
        setConnectivityStatus('connected')
      } catch {
        setConnectivityStatus('error')
      }
    }

    testConnectivity()
  }, [])

  const handleSaveSettings = async () => {
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
      toast.success('Settings saved successfully!')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Account Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Email</Label>
            <p className="text-foreground">{user?.email}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">User ID</Label>
            <p className="text-foreground font-mono text-sm">{user?.id}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Account Created</Label>
            <p className="text-foreground">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Terms Acceptance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Terms & Privacy</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Terms Accepted</Label>
            <p className="text-foreground">
              {profile?.accepted_terms_at 
                ? new Date(profile.accepted_terms_at).toLocaleDateString()
                : 'Not accepted'
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Default Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Default Settings</span>
          </CardTitle>
          <CardDescription>
            Configure default values for new reports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="default-signature-name">Default Signature Name</Label>
            <Input
              id="default-signature-name"
              value={defaultSignatureName}
              onChange={(e) => setDefaultSignatureName(e.target.value)}
              placeholder="Dr. Jane Smith"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="default-date-format">Default Date Format</Label>
            <select
              id="default-date-format"
              value={defaultDateFormat}
              onChange={(e) => setDefaultDateFormat(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <Button 
            onClick={handleSaveSettings} 
            disabled={isSaving}
            variant="default"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wifi className="w-5 h-5" />
            <span>System Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">API Connectivity</span>
            <div className="flex items-center space-x-2">
              {connectivityStatus === 'checking' && (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-muted-foreground">Checking...</span>
                </>
              )}
              {connectivityStatus === 'connected' && (
                <>
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-accent-foreground">Connected</span>
                </>
              )}
              {connectivityStatus === 'error' && (
                <>
                  <div className="w-2 h-2 bg-destructive rounded-full"></div>
                  <span className="text-destructive-foreground">Error</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Last Updated</span>
            <span className="text-foreground">
              {profile?.updated_at 
                ? new Date(profile.updated_at).toLocaleString()
                : 'Never'
              }
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
