// Transcription API client

import type {
  TranscriptionResponse,
  TranscriptionLimits,
} from '@/types/transcription';
import { httpClient } from '@/lib/http';

/**
 * Upload an audio file for transcription (fallback method)
 */
export async function transcribeFile(
  file: File
): Promise<TranscriptionResponse> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await httpClient.post<TranscriptionResponse>(
      '/v1/transcribe',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  } catch (error: unknown) {
    // Handle specific error cases
    const err = error as { response?: { status: number; data?: { detail?: unknown } } };
    if (err.response) {
      const status = err.response.status;
      const detail = err.response.data?.detail;

      if (status === 403) {
        // Tier restriction or trial exhausted
        throw new TranscriptionAccessError(
          detail?.message || 'Access denied',
          detail
        );
      } else if (status === 429) {
        // Rate limit exceeded
        throw new TranscriptionRateLimitError(
          detail?.message || 'Rate limit exceeded',
          detail
        );
      } else if (status === 413) {
        // File too large
        throw new TranscriptionFileSizeError(
          detail?.message || 'File too large',
          detail
        );
      } else if (status === 400) {
        // Invalid file format
        throw new TranscriptionFormatError(
          detail?.message || 'Invalid file format',
          detail
        );
      } else if (status === 503) {
        // Service not configured
        throw new TranscriptionServiceError(
          detail?.message || 'Service unavailable',
          detail
        );
      }
    }

    throw new TranscriptionError(
      'Failed to transcribe audio',
      err.response?.data?.detail
    );
  }
}

/**
 * Get transcription limits from response headers
 */
export function getTranscriptionLimits(
  headers: Record<string, string>
): TranscriptionLimits | null {
  const used = headers['x-transcription-used'];
  const remaining = headers['x-transcription-remaining'];
  const limit = headers['x-transcription-limit'];

  if (!used || !limit) {
    return null;
  }

  // Infer tier from limits
  let tier: TranscriptionLimits['tier'] = 'free';
  const limitNum = parseInt(limit, 10);
  if (limitNum === 3) tier = 'free';
  else if (limitNum === 100) tier = 'professional';
  else if (limitNum === 300) tier = 'premium';

  return {
    used: parseInt(used, 10),
    remaining: remaining ? parseInt(remaining, 10) : 0,
    limit: limitNum,
    tier,
  };
}

// Custom error classes
export class TranscriptionError extends Error {
  detail?: unknown;

  constructor(message: string, detail?: unknown) {
    super(message);
    this.name = 'TranscriptionError';
    this.detail = detail;
  }
}

export class TranscriptionAccessError extends TranscriptionError {
  upgradeRequired: boolean;
  tier?: string;

  constructor(message: string, detail?: Record<string, unknown>) {
    super(message, detail);
    this.name = 'TranscriptionAccessError';
    this.upgradeRequired = (detail?.upgrade_required as boolean) || false;
    this.tier = detail?.tier as string | undefined;
  }
}

export class TranscriptionRateLimitError extends TranscriptionError {
  used?: number;
  limit?: number;
  resetInHours?: number;

  constructor(message: string, detail?: Record<string, unknown>) {
    super(message, detail);
    this.name = 'TranscriptionRateLimitError';
    this.used = detail?.used as number | undefined;
    this.limit = detail?.limit as number | undefined;
    this.resetInHours = detail?.reset_in_hours as number | undefined;
  }
}

export class TranscriptionFileSizeError extends TranscriptionError {
  sizeMB?: number;

  constructor(message: string, detail?: Record<string, unknown>) {
    super(message, detail);
    this.name = 'TranscriptionFileSizeError';
    this.sizeMB = detail?.size_mb as number | undefined;
  }
}

export class TranscriptionFormatError extends TranscriptionError {
  received?: string;

  constructor(message: string, detail?: Record<string, unknown>) {
    super(message, detail);
    this.name = 'TranscriptionFormatError';
    this.received = detail?.received as string | undefined;
  }
}

export class TranscriptionServiceError extends TranscriptionError {
  constructor(message: string, detail?: unknown) {
    super(message, detail);
    this.name = 'TranscriptionServiceError';
  }
}
