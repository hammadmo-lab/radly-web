import { httpGet, httpPost, httpPatch } from '@/lib/http'
import { getAuthHeaderName } from '@/lib/config'
import type {
  StyleProfile,
  StyleProfileListResponse,
  UpdateStyleProfileRequest,
} from '@/types/style-profiles'

/**
 * List all style profiles for the current user.
 * Returns an empty list with count 0 when the user has no profiles.
 */
export async function listStyleProfiles(): Promise<StyleProfileListResponse> {
  return httpGet<StyleProfileListResponse>('/v1/style-profiles/')
}

/**
 * Fetch a single style profile by ID.
 */
export async function getStyleProfile(id: string): Promise<StyleProfile> {
  return httpGet<StyleProfile>(`/v1/style-profiles/${id}`)
}

/**
 * Upload a DOCX file to create a new style profile.
 * Uses multipart/form-data — cannot go through httpPost (JSON-only).
 *
 * On 400, the backend returns a structured error with `detail.message`
 * describing which required placeholder tags are missing. This function
 * extracts and throws that message so it can be shown directly to the user.
 *
 * @param name - Display name for the new profile
 * @param file - The .docx file to upload (max 10 MB, must contain {findings} and {impression})
 * @param isDefault - Whether to set this profile as the user's default
 */
export async function uploadStyleProfile(
  name: string,
  file: File,
  isDefault: boolean = false
): Promise<StyleProfile> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('name', name)
  formData.append('is_default', String(isDefault))

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE!
  const CLIENT_KEY = process.env.NEXT_PUBLIC_RADLY_CLIENT_KEY!
  const authHeaderName = getAuthHeaderName()

  const { createBrowserSupabase } = await import('@/lib/supabase/client')
  const supabase = createBrowserSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const headers: Record<string, string> = {
    [authHeaderName]: CLIENT_KEY,
    'X-Request-Id': crypto.randomUUID(),
  }
  if (token) headers['authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}/v1/style-profiles/upload`, {
    method: 'POST',
    headers,
    body: formData,
    credentials: 'include',
  })

  if (!res.ok) {
    // Attempt to parse structured error (e.g. missing placeholder 400)
    try {
      const body = await res.json()
      if (body?.detail?.message) throw new Error(body.detail.message)
      if (body?.detail) throw new Error(String(body.detail))
    } catch (parseErr) {
      // Re-throw parsed errors; fall through for JSON parse failures
      if (parseErr instanceof Error && parseErr.message !== '') throw parseErr
    }
    throw new Error(`Upload failed: ${res.status}`)
  }

  return res.json()
}

/**
 * Update a style profile's name or status.
 *
 * @param id - Profile UUID
 * @param updates - Fields to update (`name` and/or `status`)
 */
export async function updateStyleProfile(
  id: string,
  updates: UpdateStyleProfileRequest
): Promise<StyleProfile> {
  return httpPatch<UpdateStyleProfileRequest, StyleProfile>(
    `/v1/style-profiles/${id}`,
    updates
  )
}

/**
 * Delete a style profile permanently.
 * Uses direct fetch because http.ts does not expose httpDelete.
 *
 * @param id - Profile UUID
 */
export async function deleteStyleProfile(id: string): Promise<{ success: boolean }> {
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE!
  const CLIENT_KEY = process.env.NEXT_PUBLIC_RADLY_CLIENT_KEY!
  const authHeaderName = getAuthHeaderName()

  const { createBrowserSupabase } = await import('@/lib/supabase/client')
  const supabase = createBrowserSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const headers: Record<string, string> = {
    [authHeaderName]: CLIENT_KEY,
    'X-Request-Id': crypto.randomUUID(),
  }
  if (token) headers['authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}/v1/style-profiles/${id}`, {
    method: 'DELETE',
    headers,
    credentials: 'include',
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Delete failed: ${res.status} ${body}`)
  }

  return res.json()
}

/**
 * Set a style profile as the user's default.
 * The backend unsets any previously default profile automatically.
 *
 * @param id - Profile UUID
 */
export async function setDefaultStyleProfile(id: string): Promise<StyleProfile> {
  return httpPost<Record<string, never>, StyleProfile>(
    `/v1/style-profiles/${id}/set-default`,
    {}
  )
}
