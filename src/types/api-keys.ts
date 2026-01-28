/**
 * API Keys Types
 * Types for the admin API keys management feature
 */

/** Valid scopes for API keys */
export type ApiKeyScope = 'chatbot' | 'generate' | 'export'

/** API Key object as returned from the backend */
export interface ApiKey {
  id: number
  key_prefix: string
  name: string
  user_id: string
  user_email: string
  scopes: ApiKeyScope[]
  rate_limit: number
  is_active: boolean
  created_at: string
  last_used_at: string | null
  expires_at: string | null
}

/** Response from GET /v1/admin/api-keys */
export interface ApiKeyListResponse {
  keys: ApiKey[]
  total: number
}

/** Parameters for listing API keys */
export interface ApiKeyListParams {
  user_id?: string
}

/** Request body for POST /v1/admin/api-keys */
export interface CreateApiKeyRequest {
  user_id: string
  name: string
  scopes: ApiKeyScope[]
  rate_limit?: number
  expires_at?: string | null
}

/** Response from POST /v1/admin/api-keys (includes full key only once) */
export interface CreateApiKeyResponse extends ApiKey {
  key: string // Full key, only shown once
}

/** Request body for PATCH /v1/admin/api-keys/{id} */
export interface UpdateApiKeyRequest {
  name?: string
  is_active?: boolean
  scopes?: ApiKeyScope[]
  rate_limit?: number
}

/** Response from DELETE /v1/admin/api-keys/{id} */
export interface DeleteApiKeyResponse {
  success: boolean
  message: string
}
