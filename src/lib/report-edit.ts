/**
 * Report Editing API Client
 * Handles saving edits to radiology reports before export
 */

import { httpPatch, httpGet } from '@/lib/http';

// ============================================================================
// Types
// ============================================================================

export interface EditReportRequest {
    findings?: string;
    impression?: string;
    recommendations?: string;
}

export interface EditReportResponse {
    success: boolean;
    job_id: string;
    edited_fields: string[];
    edited_at: string;
    message: string;
}

export interface EditedReportResponse {
    job_id: string;
    report: {
        title: string;
        technique: string;
        findings: string;
        impression: string;
        recommendations: string;
    };
    edited_at: string;
    edited_by: string;
    edited_fields: string[];
}

export interface EditStatusResponse {
    job_id: string;
    has_been_edited: boolean;
    edited_at: string | null;
}

export type ReportEditError =
    | 'REPORT_EXPIRED'
    | 'UNAUTHORIZED'
    | 'VALIDATION_FAILED'
    | 'RATE_LIMITED'
    | 'SERVER_ERROR'
    | 'NETWORK_ERROR';

export interface ReportEditErrorDetails {
    type: ReportEditError;
    message: string;
    retryAfter?: number; // seconds for rate limiting
}

// ============================================================================
// Constants
// ============================================================================

export const FIELD_LIMITS = {
    findings: 50_000,
    impression: 50_000,
    recommendations: 10_000,
} as const;

// ============================================================================
// API Functions
// ============================================================================

/**
 * Save edits to a report
 * @param jobId - The job ID of the report to edit
 * @param edits - The fields to update
 * @returns Promise with edit response
 * @throws ReportEditErrorDetails on failure
 */
export async function saveReportEdit(
    jobId: string,
    edits: EditReportRequest
): Promise<EditReportResponse> {
    try {
        // Validate field lengths before sending
        if (edits.findings && edits.findings.length > FIELD_LIMITS.findings) {
            throw createError('VALIDATION_FAILED', `Findings exceeds ${FIELD_LIMITS.findings} character limit`);
        }
        if (edits.impression && edits.impression.length > FIELD_LIMITS.impression) {
            throw createError('VALIDATION_FAILED', `Impression exceeds ${FIELD_LIMITS.impression} character limit`);
        }
        if (edits.recommendations && edits.recommendations.length > FIELD_LIMITS.recommendations) {
            throw createError('VALIDATION_FAILED', `Recommendations exceeds ${FIELD_LIMITS.recommendations} character limit`);
        }

        // Backend requires findings and impression as required fields at root level
        // Send flat structure with all fields that are provided
        const payload: Record<string, string> = {};

        // findings and impression are required by backend
        if (edits.findings !== undefined) payload.findings = edits.findings;
        if (edits.impression !== undefined) payload.impression = edits.impression;
        if (edits.recommendations !== undefined) payload.recommendations = edits.recommendations;

        console.log('[ReportEdit] Sending PATCH request:', { jobId, payload });

        return await httpPatch<typeof payload, EditReportResponse>(
            `/v1/reports/${encodeURIComponent(jobId)}`,
            payload
        );
    } catch (error) {
        throw handleApiError(error);
    }
}

/**
 * Get the edited version of a report (if it exists)
 * @param jobId - The job ID of the report
 * @returns Promise with edited report or null if never edited
 */
export async function getEditedReport(
    jobId: string
): Promise<EditedReportResponse | null> {
    try {
        return await httpGet<EditedReportResponse>(
            `/v1/reports/${encodeURIComponent(jobId)}/edited`
        );
    } catch (error) {
        // 404 means no edits exist - not an error
        if (isApiError(error) && error.status === 404) {
            return null;
        }
        throw handleApiError(error);
    }
}

/**
 * Check if a report has been edited
 * @param jobId - The job ID of the report
 * @returns Promise with edit status
 */
export async function getEditStatus(
    jobId: string
): Promise<EditStatusResponse> {
    try {
        return await httpGet<EditStatusResponse>(
            `/v1/reports/${encodeURIComponent(jobId)}/edit-status`
        );
    } catch (error) {
        throw handleApiError(error);
    }
}

// ============================================================================
// Error Handling
// ============================================================================

interface ApiError extends Error {
    status?: number;
    body?: string;
}

function isApiError(error: unknown): error is ApiError {
    return error instanceof Error && 'status' in error;
}

function createError(type: ReportEditError, message: string, retryAfter?: number): ReportEditErrorDetails {
    return { type, message, retryAfter };
}

function handleApiError(error: unknown): ReportEditErrorDetails {
    // Log full error details for debugging
    console.error('[ReportEdit] API Error:', {
        error,
        isApiError: isApiError(error),
        status: isApiError(error) ? error.status : 'N/A',
        body: isApiError(error) ? error.body : 'N/A',
        message: error instanceof Error ? error.message : String(error),
    });

    if (!isApiError(error)) {
        // Network error or unknown
        return createError('NETWORK_ERROR', 'Network error. Please check your connection.');
    }

    switch (error.status) {
        case 404:
            return createError('REPORT_EXPIRED', 'Report expired. Please regenerate the report to continue editing.');
        case 403:
            return createError('UNAUTHORIZED', 'You do not have permission to edit this report.');
        case 422:
            return createError('VALIDATION_FAILED', 'Please check that all required fields are filled correctly.');
        case 429:
            // Extract retry-after from response if available
            const retryMatch = error.body?.match(/retry.+?(\d+)/i);
            const retryAfter = retryMatch ? parseInt(retryMatch[1], 10) : 60;
            return createError('RATE_LIMITED', `Too many saves. Please wait ${retryAfter} seconds.`, retryAfter);
        case 405:
            // Method not allowed - endpoint might not support PATCH
            return createError('SERVER_ERROR', 'Edit endpoint not available. Contact support.');
        case 500:
        case 502:
        case 503:
            return createError('SERVER_ERROR', 'Server error. Please try again later.');
        default:
            return createError('SERVER_ERROR', `Failed to save changes (${error.status}). Please try again.`);
    }
}
