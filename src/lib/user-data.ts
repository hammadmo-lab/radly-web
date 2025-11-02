// src/lib/user-data.ts
"use client"

import { getSupabaseClient } from '@/lib/supabase-singleton'

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
    const supabase = await getSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      throw new Error('User not found')
    }
    
    return {
      id: userId,
      email: user.email || '',
      default_signature_name: user.user_metadata?.default_signature_name || '',
      default_signature_date_format: user.user_metadata?.default_signature_date_format || 'MM/DD/YYYY',
      accepted_terms_at: user.user_metadata?.accepted_terms_at,
      subscription: null, // Not using subscription data for now
      updated_at: user.updated_at || new Date().toISOString()
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
  try {
    const supabase = await getSupabaseClient()
    
    // Update user metadata in Supabase
    const { error } = await supabase.auth.updateUser({
      data: {
        default_signature_name: updates.default_signature_name,
        default_signature_date_format: updates.default_signature_date_format,
        accepted_terms_at: updates.accepted_terms_at,
      }
    })

    if (error) {
      throw new Error(`Failed to update user data: ${error.message}`)
    }
  } catch (error) {
    console.error('Error updating user data:', error)
    throw error
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
