'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/components/admin/AdminAuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminLoginPage() {
  const router = useRouter()
  const { login } = useAdminAuth()
  
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Load saved username on component mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('admin_username')
    if (savedUsername) {
      setUsername(savedUsername)
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!username || !password) {
      setError('Please enter both username and password')
      return
    }

    setIsLoading(true)

    try {
      // Call the backend login endpoint
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://edge.radly.app'
      const response = await fetch(`${apiBase}/v1/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Id': crypto.randomUUID(),
        },
        body: JSON.stringify({
          username,
          password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Login failed' }))
        throw new Error(errorData.detail || 'Invalid credentials')
      }

      const data = await response.json()
      
      // Store the returned keys
      login(data.admin_key, data.api_key)
      
      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem('admin_username', username)
      } else {
        localStorage.removeItem('admin_username')
      }
      
      toast.success('Login successful!')
      router.push('/admin')
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Shield className="w-6 h-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Admin Login
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                autoComplete="username"
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded"
                aria-label="Remember username"
              />
              <Label htmlFor="remember" className="text-sm font-normal">
                Remember username
              </Label>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>Authorized personnel only</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
