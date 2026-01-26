'use client';

import { motion } from 'framer-motion';
import { Pencil, Sparkles, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface EditHintBannerProps {
    className?: string;
    onDismiss?: () => void;
}

const STORAGE_KEY = 'radly-edit-hint-dismissed';

/**
 * A dismissible banner that informs users they can edit reports before exporting
 * Only shows once per user (remembered in localStorage)
 */
export function EditHintBanner({ className = '', onDismiss }: EditHintBannerProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(true);

    useEffect(() => {
        // Check if user has dismissed this hint before
        const dismissed = localStorage.getItem(STORAGE_KEY);
        if (!dismissed) {
            setIsDismissed(false);
            // Small delay for animation
            const timer = setTimeout(() => setIsVisible(true), 300);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem(STORAGE_KEY, 'true');
        setTimeout(() => {
            setIsDismissed(true);
            onDismiss?.();
        }, 300);
    };

    if (isDismissed) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -10 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`relative overflow-hidden rounded-xl border border-[rgba(212,180,131,0.3)] bg-gradient-to-r from-[rgba(212,180,131,0.1)] to-[rgba(245,215,145,0.08)] p-4 ${className}`}
        >
            {/* Decorative sparkle */}
            <div className="absolute -top-2 -right-2 w-24 h-24 bg-[radial-gradient(circle,rgba(245,215,145,0.15)_0%,transparent_70%)]" />

            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 p-2 rounded-lg bg-[rgba(212,180,131,0.15)]">
                    <Sparkles className="w-5 h-5 text-[#F5D791]" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-[var(--ds-text-primary)]">
                            New: Edit Before Export
                        </h3>
                        <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-[rgba(212,180,131,0.2)] text-[#D4B483]">
                            New
                        </span>
                    </div>
                    <p className="text-sm text-[var(--ds-text-secondary)] leading-relaxed">
                        Click on any section below to edit the report. Your changes are auto-saved and will be included when you export.
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-[var(--ds-text-muted)]">
                        <Pencil className="w-3 h-3" />
                        <span>Click Findings, Impression, or Recommendations to edit</span>
                    </div>
                </div>

                {/* Dismiss button */}
                <button
                    onClick={handleDismiss}
                    className="flex-shrink-0 p-1 rounded-md hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                    aria-label="Dismiss hint"
                >
                    <X className="w-4 h-4 text-[var(--ds-text-muted)]" />
                </button>
            </div>
        </motion.div>
    );
}

/**
 * Compact inline hint that shows next to a section header
 */
export function EditableHint() {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-[rgba(212,180,131,0.15)] text-[#D4B483] ml-2">
            <Pencil className="w-3 h-3" />
            Click to edit
        </span>
    );
}
