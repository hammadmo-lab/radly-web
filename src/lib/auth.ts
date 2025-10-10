'use client';

import { getSupabaseClient } from './supabase';

/**
 * Get the current user's access token or throw an error if not authenticated.
 * This function should only be called from client-side code (functions/effects/handlers).
 * 
 * @returns Promise<string> - The Supabase access token
 * @throws Error with message "unauthenticated" if no valid session exists
 */
export async function getAccessTokenOrThrow(): Promise<string> {
  const supabase = getSupabaseClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session?.access_token) {
    throw new Error("unauthenticated");
  }
  
  return session.access_token;
}
