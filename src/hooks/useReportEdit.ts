'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
    saveReportEdit,
    EditReportRequest,
    EditReportResponse,
    ReportEditErrorDetails,
    FIELD_LIMITS
} from '@/lib/report-edit';

// ============================================================================
// Types
// ============================================================================

export type EditableField = 'findings' | 'impression' | 'recommendations';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface EditState {
    findings: string;
    impression: string;
    recommendations: string;
}

export interface OriginalState {
    findings: string;
    impression: string;
    recommendations: string;
}

export interface UseReportEditOptions {
    /** The job ID of the report being edited */
    jobId: string;
    /** Original report content (for dirty tracking) */
    original: OriginalState;
    /** Auto-save delay in milliseconds (default: 2000) */
    autoSaveDelay?: number;
    /** Disable auto-save (manual save only) */
    disableAutoSave?: boolean;
    /** Callback when save completes successfully */
    onSaveSuccess?: (response: EditReportResponse) => void;
    /** Callback when save fails */
    onSaveError?: (error: ReportEditErrorDetails) => void;
}

export interface UseReportEditReturn {
    // Current edited values
    editState: EditState;

    // Update a field
    updateField: (field: EditableField, value: string) => void;

    // Dirty tracking (has unsaved changes)
    isDirty: boolean;
    dirtyFields: Set<EditableField>;

    // Save status
    saveStatus: SaveStatus;
    lastSavedAt: Date | null;
    error: ReportEditErrorDetails | null;

    // Manual save trigger
    save: () => Promise<void>;

    // Reset to original values
    reset: () => void;

    // Character counts and limits
    getCharCount: (field: EditableField) => number;
    getCharLimit: (field: EditableField) => number;
    isOverLimit: (field: EditableField) => boolean;

    // Validation
    isValid: boolean;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useReportEdit(options: UseReportEditOptions): UseReportEditReturn {
    const {
        jobId,
        original,
        autoSaveDelay = 2000,
        disableAutoSave = false,
        onSaveSuccess,
        onSaveError,
    } = options;

    // Current edited state
    const [editState, setEditState] = useState<EditState>({
        findings: original.findings,
        impression: original.impression,
        recommendations: original.recommendations,
    });

    // Save status
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
    const [error, setError] = useState<ReportEditErrorDetails | null>(null);

    // Refs for auto-save debouncing
    const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isSavingRef = useRef(false);
    const pendingChangesRef = useRef<Partial<EditReportRequest> | null>(null);

    // Track which fields have been modified
    const dirtyFields = new Set<EditableField>();
    if (editState.findings !== original.findings) dirtyFields.add('findings');
    if (editState.impression !== original.impression) dirtyFields.add('impression');
    if (editState.recommendations !== original.recommendations) dirtyFields.add('recommendations');

    const isDirty = dirtyFields.size > 0;

    // Character count helpers
    const getCharCount = useCallback((field: EditableField): number => {
        return editState[field].length;
    }, [editState]);

    const getCharLimit = useCallback((field: EditableField): number => {
        return FIELD_LIMITS[field];
    }, []);

    const isOverLimit = useCallback((field: EditableField): boolean => {
        return editState[field].length > FIELD_LIMITS[field];
    }, [editState]);

    // Validation - all required fields must be non-empty and within limits
    const isValid =
        editState.findings.trim().length > 0 &&
        editState.impression.trim().length > 0 &&
        !isOverLimit('findings') &&
        !isOverLimit('impression') &&
        !isOverLimit('recommendations');

    // Perform the save operation
    const performSave = useCallback(async (edits: Partial<EditReportRequest>) => {
        if (isSavingRef.current) {
            // Queue changes for next save
            pendingChangesRef.current = { ...pendingChangesRef.current, ...edits };
            return;
        }

        isSavingRef.current = true;
        setSaveStatus('saving');
        setError(null);

        try {
            const response = await saveReportEdit(jobId, edits as EditReportRequest);

            setLastSavedAt(new Date());
            setSaveStatus('saved');
            onSaveSuccess?.(response);

            // Reset to idle after showing "saved" briefly
            setTimeout(() => {
                setSaveStatus(prev => prev === 'saved' ? 'idle' : prev);
            }, 2000);

            // Process any pending changes that came in while saving
            if (pendingChangesRef.current) {
                const pending = pendingChangesRef.current;
                pendingChangesRef.current = null;
                isSavingRef.current = false;
                await performSave(pending);
                return;
            }
        } catch (err) {
            const editError = err as ReportEditErrorDetails;
            setError(editError);
            setSaveStatus('error');
            onSaveError?.(editError);
        } finally {
            isSavingRef.current = false;
        }
    }, [jobId, onSaveSuccess, onSaveError]);

    // Manual save function
    const save = useCallback(async () => {
        if (!isDirty || !isValid) return;

        // Clear any pending auto-save
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
            autoSaveTimeoutRef.current = null;
        }

        // Backend requires findings and impression - send all fields
        const edits: EditReportRequest = {
            findings: editState.findings,
            impression: editState.impression,
            recommendations: editState.recommendations,
        };

        await performSave(edits);
    }, [isDirty, isValid, editState, dirtyFields, performSave]);

    // Update a field and trigger auto-save
    const updateField = useCallback((field: EditableField, value: string) => {
        setEditState(prev => ({ ...prev, [field]: value }));
        setError(null); // Clear error when user starts typing again

        // Trigger auto-save if enabled
        if (!disableAutoSave) {
            // Clear existing timeout
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }

            // Set new timeout for auto-save
            autoSaveTimeoutRef.current = setTimeout(() => {
                // Get current state at save time
                setEditState(currentState => {
                    const currentDirty = new Set<EditableField>();
                    if (currentState.findings !== original.findings) currentDirty.add('findings');
                    if (currentState.impression !== original.impression) currentDirty.add('impression');
                    if (currentState.recommendations !== original.recommendations) currentDirty.add('recommendations');

                    if (currentDirty.size > 0) {
                        // Backend requires findings and impression - send all fields
                        const edits: EditReportRequest = {
                            findings: currentState.findings,
                            impression: currentState.impression,
                            recommendations: currentState.recommendations,
                        };

                        // Validate before auto-save
                        const valid =
                            currentState.findings.trim().length > 0 &&
                            currentState.impression.trim().length > 0 &&
                            currentState.findings.length <= FIELD_LIMITS.findings &&
                            currentState.impression.length <= FIELD_LIMITS.impression &&
                            currentState.recommendations.length <= FIELD_LIMITS.recommendations;

                        if (valid) {
                            performSave(edits);
                        }
                    }

                    return currentState; // Return unchanged state
                });
            }, autoSaveDelay);
        }
    }, [disableAutoSave, autoSaveDelay, original, performSave]);

    // Reset to original values
    const reset = useCallback(() => {
        setEditState({
            findings: original.findings,
            impression: original.impression,
            recommendations: original.recommendations,
        });
        setError(null);
        setSaveStatus('idle');

        // Clear any pending auto-save
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
            autoSaveTimeoutRef.current = null;
        }
    }, [original]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, []);

    // Update edit state when original changes (e.g., report reloads)
    useEffect(() => {
        setEditState({
            findings: original.findings,
            impression: original.impression,
            recommendations: original.recommendations,
        });
    }, [original.findings, original.impression, original.recommendations]);

    return {
        editState,
        updateField,
        isDirty,
        dirtyFields,
        saveStatus,
        lastSavedAt,
        error,
        save,
        reset,
        getCharCount,
        getCharLimit,
        isOverLimit,
        isValid,
    };
}
