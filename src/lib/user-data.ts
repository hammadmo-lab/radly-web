// src/lib/user-data.ts
"use client"

import { getSupabaseClient } from '@/lib/supabase'

export interface UserProfile {
  id: string
  email: string
  default_signature_name?: string
  default_signature_date_format?: string
  accepted_terms_at?: string
  subscription?: UserSubscription | null
  updated_at?: string
}

export interface UserSubscription {
  default_signature_name?: string
  default_signature_date_format?: string
  accepted_terms_at?: string
  updated_at?: string
  [key: string]: unknown
}

export interface UserDataResponse {
  user_id: string
  subscription?: UserSubscription
}

/**
 * Fetch user data from backend API with proper error handling
 */
export async function fetchUserData(userId: string): Promise<UserProfile> {
  try {
    const supabase = getSupabaseClient()
    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token

    if (!token) {
      throw new Error('No authentication token available')
    }

    const apiKey = process.env.NEXT_PUBLIC_RADLY_API_KEY
    if (!apiKey) {
      throw new Error('API key not configured')
    }

    const response = await fetch(`/v1/admin/subscriptions/user-id/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        // User has no subscription - return default profile
        return createDefaultProfile(userId)
      }
      throw new Error(`Failed to fetch user data: ${response.statusText}`)
    }
    
    const userData: UserDataResponse = await response.json()
    return {
      id: userId,
      email: '', // Will be filled by caller
      default_signature_name: userData.subscription?.default_signature_name || '',
      default_signature_date_format: userData.subscription?.default_signature_date_format || 'MM/DD/YYYY',
      accepted_terms_at: userData.subscription?.accepted_terms_at,
      subscription: userData.subscription,
      updated_at: userData.subscription?.updated_at || new Date().toISOString()
    }
  } catch (error) {
    console.error('Error fetching user data:', error)
    // Return default profile instead of throwing
    return createDefaultProfile(userId)
  }
}

/**
 * Update user data via backend API
 */
export async function updateUserData(
  userId: string, 
  updates: Partial<Pick<UserProfile, 'default_signature_name' | 'default_signature_date_format' | 'accepted_terms_at'>>
): Promise<void> {
  const supabase = getSupabaseClient()
  const session = await supabase.auth.getSession()
  const token = session.data.session?.access_token

  if (!token) {
    throw new Error('No authentication token available')
  }

  const apiKey = process.env.NEXT_PUBLIC_RADLY_API_KEY
  if (!apiKey) {
    throw new Error('API key not configured')
  }

  const response = await fetch(`/v1/admin/subscriptions/user-id/${userId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  })

  if (!response.ok) {
    if (response.status === 404) {
      // User has no subscription - create one with updates
      await createUserSubscription(userId, updates)
    } else {
      throw new Error(`Failed to update user data: ${response.statusText}`)
    }
  }
}

/**
 * Create a new user subscription with initial data
 */
async function createUserSubscription(
  userId: string, 
  initialData: Partial<Pick<UserProfile, 'default_signature_name' | 'default_signature_date_format' | 'accepted_terms_at'>>
): Promise<void> {
  const supabase = getSupabaseClient()
  const session = await supabase.auth.getSession()
  const token = session.data.session?.access_token

  if (!token) {
    throw new Error('No authentication token available')
  }

  const user = session.data.session?.user
  if (!user?.email) {
    throw new Error('User email not available')
  }

  const apiKey = process.env.NEXT_PUBLIC_RADLY_API_KEY
  if (!apiKey) {
    throw new Error('API key not configured')
  }

  const createResponse = await fetch('/v1/admin/subscriptions/activate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user_email: user.email,
      tier: 'free',
      ...initialData
    })
  })
  
  if (!createResponse.ok) {
    throw new Error(`Failed to create subscription: ${createResponse.statusText}`)
  }
}

/**
 * Create a default profile for users without subscriptions
 */
function createDefaultProfile(userId: string): UserProfile {
  return {
    id: userId,
    email: '',
    default_signature_name: '',
    default_signature_date_format: 'MM/DD/YYYY',
    subscription: null,
    updated_at: new Date().toISOString()
  }
}

/**
 * React Query configuration for user data fetching
 */
export const userDataQueryConfig = {
  retry: (failureCount: number, error: Error) => {
    // Don't retry for 4xx errors (client errors)
    if (error.message.includes('401') || error.message.includes('403') || error.message.includes('404')) {
      return false
    }
    // Retry up to 2 times for other errors
    return failureCount < 2
  },
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  staleTime: 5 * 60 * 1000, // 5 minutes
}
