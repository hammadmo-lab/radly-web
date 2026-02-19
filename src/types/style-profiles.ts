/**
 * Style profile status — 'active' when the profile is ready to use,
 * 'error' when the upload or processing failed.
 */
export type StyleProfileStatus = 'active' | 'error'

/**
 * A style profile created from an uploaded DOCX template.
 * The backend substitutes placeholder tags (e.g. `{findings}`) with
 * the generated report content on export.
 */
export interface StyleProfile {
  /** Unique profile identifier (UUID) */
  id: string
  /** Owner user ID */
  user_id: string
  /** Human-readable profile name */
  name: string
  /** Profile status — always 'active' immediately after upload */
  status: StyleProfileStatus
  /** Signed URL to the original uploaded DOCX file, or null */
  source_file_url: string | null
  /** Whether this is the user's default style profile */
  is_default: boolean
  /**
   * Placeholder tags detected in the uploaded DOCX template.
   * e.g. ["findings", "impression", "exam_title"]
   */
  found_placeholders: string[]
  /** ISO 8601 creation timestamp */
  created_at: string
  /** ISO 8601 last-updated timestamp */
  updated_at: string
}

/**
 * Response from GET /v1/style-profiles/
 */
export interface StyleProfileListResponse {
  profiles: StyleProfile[]
  count: number
}

/**
 * Input for POST /v1/style-profiles/upload (multipart/form-data)
 */
export interface UploadStyleProfileRequest {
  name: string
  file: File
  isDefault?: boolean
}

/**
 * Input for PATCH /v1/style-profiles/{id}
 */
export interface UpdateStyleProfileRequest {
  name?: string
  status?: StyleProfileStatus
}

/**
 * Structured error body returned by the backend on a 400 upload failure.
 * Occurs when required placeholder tags (e.g. `{findings}`) are missing
 * from the uploaded DOCX. The `message` field is already user-friendly.
 */
export interface StyleProfileUploadError {
  error: string
  message: string
  missing: string[]
  found: string[]
}
