import { httpGet, httpPost, httpPut } from '@/lib/http';
import { getAuthHeaderName } from '@/lib/config';

export interface FormattingConfig {
  patient_info?: {
    style?: string;
    font_name?: string;
    font_size?: number;
    bold?: boolean;
    spacing_after?: number;
  };
  report_title?: {
    style?: string;
    font_name?: string;
    font_size?: number;
    bold?: boolean;
    uppercase?: boolean;
    alignment?: string;
  };
  section_headers?: {
    style?: string;
    font_name?: string;
    font_size?: number;
    bold?: boolean;
    spacing_before?: number;
    spacing_after?: number;
  };
  findings?: {
    style?: string;
    font_name?: string;
    font_size?: number;
    bullet_character?: string;
    spacing_after?: number;
  };
  impression?: {
    style?: string;
    font_name?: string;
    font_size?: number;
    bold?: boolean;
    numbering_format?: string;
    spacing_after?: number;
  };
  recommendations?: {
    style?: string;
    font_name?: string;
    font_size?: number;
    bullet_character?: string;
    spacing_after?: number;
  };
  signature?: {
    style?: string;
    font_name?: string;
    font_size?: number;
    bold?: boolean;
    italic?: boolean;
    indent?: number;
  };
}

export interface FormattingProfile {
  profile_id: string;
  user_id: string;
  profile_name: string;
  formatting_config: FormattingConfig;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface FormattingProfileListResponse {
  profiles: FormattingProfile[];
  total: number;
}

export interface FormattingProfileResponse {
  default_profile: FormattingProfile | null;
}

/**
 * Upload DOCX template and create formatting profile
 */
export async function uploadTemplate(
  file: File,
  profileName: string,
  isDefault: boolean = false
): Promise<FormattingProfile> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('profile_name', profileName);
  formData.append('is_default', String(isDefault));

  // We need to use fetch directly for multipart/form-data
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE!;
  const CLIENT_KEY = process.env.NEXT_PUBLIC_RADLY_CLIENT_KEY!;

  // Determine which auth header to use based on environment
  // Production (edge.radly.app) uses x-client-key, staging uses x-api-key
  const authHeaderName = getAuthHeaderName();

  // Get auth token
  const { createBrowserSupabase } = await import('@/lib/supabase/client');
  const supabase = createBrowserSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers: Record<string, string> = {
    [authHeaderName]: CLIENT_KEY,
    'X-Request-Id': crypto.randomUUID(),
  };

  if (token) {
    headers['authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}/v1/formatting/upload`, {
    method: 'POST',
    headers,
    body: formData,
    credentials: 'include',
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Upload failed: ${res.status} ${body}`);
  }

  return res.json();
}

/**
 * List all formatting profiles for the current user
 */
export async function listProfiles(): Promise<FormattingProfileListResponse> {
  return httpGet<FormattingProfileListResponse>('/v1/formatting/profiles');
}

/**
 * Get a specific formatting profile by ID
 */
export async function getProfile(profileId: string): Promise<FormattingProfile> {
  return httpGet<FormattingProfile>(`/v1/formatting/profiles/${profileId}`);
}

/**
 * Update a formatting profile
 */
export async function updateProfile(
  profileId: string,
  data: { profile_name?: string; formatting_config?: FormattingConfig }
): Promise<FormattingProfile> {
  return httpPut<typeof data, FormattingProfile>(
    `/v1/formatting/profiles/${profileId}`,
    data
  );
}

/**
 * Delete a formatting profile
 */
export async function deleteProfile(profileId: string): Promise<{ success: boolean; message: string }> {
  // http.ts doesn't have DELETE, so we'll use fetch directly
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE!;
  const CLIENT_KEY = process.env.NEXT_PUBLIC_RADLY_CLIENT_KEY!;

  // Determine which auth header to use based on environment
  // Production (edge.radly.app) uses x-client-key, staging uses x-api-key
  const authHeaderName = getAuthHeaderName();

  const { createBrowserSupabase } = await import('@/lib/supabase/client');
  const supabase = createBrowserSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers: Record<string, string> = {
    [authHeaderName]: CLIENT_KEY,
    'X-Request-Id': crypto.randomUUID(),
  };

  if (token) {
    headers['authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}/v1/formatting/profiles/${profileId}`, {
    method: 'DELETE',
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Delete failed: ${res.status} ${body}`);
  }

  return res.json();
}

/**
 * Set a profile as default
 */
export async function setDefaultProfile(profileId: string): Promise<FormattingProfile> {
  return httpPost<Record<string, never>, FormattingProfile>(
    `/v1/formatting/profiles/${profileId}/set-default`,
    {}
  );
}

/**
 * Get the default formatting profile
 */
export async function getDefaultProfile(): Promise<FormattingProfileResponse> {
  return httpGet<FormattingProfileResponse>('/v1/formatting/profiles/default/get');
}
