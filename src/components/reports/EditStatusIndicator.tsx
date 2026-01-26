'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, AlertCircle, Clock } from 'lucide-react';
import type { SaveStatus } from '@/hooks/useReportEdit';

interface EditStatusIndicatorProps {
    status: SaveStatus;
    lastSavedAt: Date | null;
    error?: { message: string } | null;
    className?: string;
}

/**
 * Shows the current save status with appropriate icon and color
 * Matches the existing Radly theme colors
 */
export function EditStatusIndicator({
    status,
    lastSavedAt,
    error,
    className = ''
}: EditStatusIndicatorProps) {
    // Format relative time
    const formatLastSaved = (date: Date | null): string => {
        if (!date) return '';

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);

        if (diffSecs < 10) return 'just now';
        if (diffSecs < 60) return `${diffSecs}s ago`;
        if (diffMins < 60) return `${diffMins}m ago`;
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={`flex items-center gap-2 min-h-[24px] ${className}`}>
            <AnimatePresence mode="wait">
                {status === 'saving' && (
                    <motion.div
                        key="saving"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2 text-[#F5D791]"
                    >
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-xs font-medium">Saving...</span>
                    </motion.div>
                )}

                {status === 'saved' && (
                    <motion.div
                        key="saved"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2 text-[#4ECDC4]"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        >
                            <Check className="h-4 w-4" />
                        </motion.div>
                        <span className="text-xs font-medium">Saved</span>
                    </motion.div>
                )}

                {status === 'error' && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2 text-[#FF6B6B]"
                    >
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-xs font-medium">
                            {error?.message || 'Save failed'}
                        </span>
                    </motion.div>
                )}

                {status === 'idle' && lastSavedAt && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 text-[var(--ds-text-muted)]"
                    >
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-xs">
                            Last saved {formatLastSaved(lastSavedAt)}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
