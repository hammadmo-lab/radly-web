/**
 * Bulk Operations API - Frontend wrapper for bulk report operations
 * Handles deletion, export, and queue position queries for multiple reports
 */

import { httpPost, httpGet } from '@/lib/http';

export interface BulkDeleteRequest {
  job_ids: string[];
}

export interface BulkDeleteResponse {
  deleted_count: number;
  failed_count: number;
  failed_ids: string[];
  failed_reasons?: Record<string, string>;
  message: string;
}

export interface BulkExportRequest {
  job_ids: string[];
  formatting_profile_id?: string | null;
}

export interface BulkExportResponse {
  download_url: string;
  exported_count: number;
  failed_count: number;
  failed_ids: string[];
  failed_reasons?: Record<string, string>;
  expires_in_seconds: number;
  file_size_bytes: number;
  message: string;
}

export interface QueuePositionResponse {
  job_id: string;
  status: 'queued' | 'running' | 'done' | 'error';
  queue_position: number | null;
  jobs_ahead?: number;
  jobs_running?: number;
  estimated_wait_seconds?: number;
  estimated_wait_formatted?: string;
  elapsed_seconds?: number;
  estimated_remaining_seconds?: number;
}

/**
 * Delete multiple reports at once
 * @param jobIds - Array of job IDs to delete
 * @returns Promise with deletion results and any failures
 * @throws ApiError if request fails
 */
export async function bulkDeleteReports(
  jobIds: string[]
): Promise<BulkDeleteResponse> {
  if (!jobIds.length) {
    throw new Error('No job IDs provided');
  }

  return httpPost<BulkDeleteRequest, BulkDeleteResponse>(
    '/v1/reports/bulk-delete',
    { job_ids: jobIds }
  );
}

/**
 * Export multiple reports as a ZIP file
 * @param jobIds - Array of job IDs to export
 * @param formattingProfileId - Optional custom formatting profile
 * @returns Promise with download URL and export results
 * @throws ApiError if request fails
 */
export async function bulkExportReports(
  jobIds: string[],
  formattingProfileId?: string | null
): Promise<BulkExportResponse> {
  if (!jobIds.length) {
    throw new Error('No job IDs provided');
  }

  return httpPost<BulkExportRequest, BulkExportResponse>(
    '/v1/reports/bulk-export',
    {
      job_ids: jobIds,
      formatting_profile_id: formattingProfileId || undefined,
    }
  );
}

/**
 * Get queue position for a specific job
 * @param jobId - The job ID to check queue position for
 * @returns Promise with queue position details
 * @throws ApiError if request fails or job not found
 */
export async function getQueuePosition(
  jobId: string
): Promise<QueuePositionResponse> {
  return httpGet<QueuePositionResponse>(
    `/v1/reports/${jobId}/queue-position`
  );
}

/**
 * Helper to format estimated wait time from seconds
 * @param seconds - Seconds to wait
 * @returns Formatted string like "~5 minutes" or "~45 seconds"
 */
export function formatWaitTime(seconds: number): string {
  if (seconds < 60) {
    return `~${Math.ceil(seconds)}s`;
  }
  const minutes = Math.ceil(seconds / 60);
  return `~${minutes}m`;
}

/**
 * Helper to determine if bulk operation can be performed
 * @param jobIds - Array of job IDs
 * @param maxSize - Maximum allowed job IDs (default 100)
 * @returns Object with isValid flag and error message if invalid
 */
export function validateBulkOperation(
  jobIds: string[],
  maxSize: number = 100
): { isValid: boolean; error?: string } {
  if (!jobIds.length) {
    return { isValid: false, error: 'No reports selected' };
  }

  if (jobIds.length > maxSize) {
    return {
      isValid: false,
      error: `Maximum ${maxSize} reports can be selected at once`,
    };
  }

  return { isValid: true };
}
