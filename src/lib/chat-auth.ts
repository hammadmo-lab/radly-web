// Re-export getAuthToken for chat-related modules
// Thin wrapper to avoid importing internal http.ts implementation details

import { createBrowserSupabase } from '@/lib/supabase/client'

/**
 * Get the current Supabase access token for the chat WebSocket and voice transcription
 */
export async function getAuthToken(): Promise<string | null> {
    try {
        if (typeof window === 'undefined') return null
        const supabase = createBrowserSupabase()
        const { data: { session } } = await supabase.auth.getSession()
        return session?.access_token ?? null
    } catch {
        return null
    }
}
