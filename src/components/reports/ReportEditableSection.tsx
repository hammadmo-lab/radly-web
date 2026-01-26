'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Pencil } from 'lucide-react';
import { CharacterCounter } from './CharacterCounter';
import type { EditableField } from '@/hooks/useReportEdit';

interface ReportEditableSectionProps {
    /** Section label (e.g., "Findings", "Impression") */
    label: string;
    /** Field identifier for the hook */
    field: EditableField;
    /** Current value */
    value: string;
    /** Character limit for this field */
    maxLength: number;
    /** Is this field editable? (false for title/technique) */
    isEditable?: boolean;
    /** Is over the character limit? */
    isOverLimit?: boolean;
    /** Callback when value changes */
    onChange?: (field: EditableField, value: string) => void;
    /** Whether the form is currently saving */
    isSaving?: boolean;
    /** Custom background color class */
    bgColorClass?: string;
    /** Custom border color class */
    borderColorClass?: string;
    /** Minimum rows for textarea */
    minRows?: number;
    /** Optional label suffix (e.g., "(optional)") */
    labelSuffix?: string;
}

/**
 * Inline-editable report section that matches the existing ReportRenderer styling
 * Click anywhere in the section to start editing
 */
export function ReportEditableSection({
    label,
    field,
    value,
    maxLength,
    isEditable = true,
    isOverLimit = false,
    onChange,
    isSaving = false,
    bgColorClass = 'bg-[rgba(255,255,255,0.04)]',
    borderColorClass = 'border-[var(--ds-border-light)]',
    minRows = 4,
    labelSuffix,
}: ReportEditableSectionProps) {
    const [isEditing, setIsEditing] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-focus textarea when entering edit mode
    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            // Move cursor to end
            textareaRef.current.selectionStart = textareaRef.current.value.length;
            textareaRef.current.selectionEnd = textareaRef.current.value.length;
        }
    }, [isEditing]);

    // Auto-resize textarea to fit content
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value, isEditing]);

    const handleClick = () => {
        if (isEditable && !isEditing) {
            setIsEditing(true);
        }
    };

    const handleBlur = () => {
        setIsEditing(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange?.(field, e.target.value);
    };

    // Read-only (locked) section
    if (!isEditable) {
        return (
            <motion.section
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
            >
                <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-lg font-semibold text-[var(--ds-text-primary)]">
                        {label}
                    </h2>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.06)] text-[var(--ds-text-muted)]">
                        <Lock className="h-3 w-3" />
                        <span className="text-xs">Protected</span>
                    </div>
                </div>
                <div className={`${bgColorClass} border ${borderColorClass} p-4 rounded-lg`}>
                    <div className="whitespace-pre-wrap text-[var(--ds-text-secondary)] leading-relaxed">
                        {value || <span className="text-[var(--ds-text-muted)] italic">Empty</span>}
                    </div>
                </div>
            </motion.section>
        );
    }

    return (
        <motion.section
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
        >
            {/* Header with label and character counter */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-[var(--ds-text-primary)]">
                        {label}
                    </h2>
                    {labelSuffix && (
                        <span className="text-xs text-[var(--ds-text-muted)]">
                            {labelSuffix}
                        </span>
                    )}
                    {!isEditing && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-[var(--ds-text-muted)]"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </motion.div>
                    )}
                </div>
                <CharacterCounter current={value.length} max={maxLength} />
            </div>

            {/* Content - click to edit */}
            <div
                onClick={handleClick}
                className={`relative rounded-lg transition-all duration-200 ${isEditing
                        ? 'ring-2 ring-[rgba(58,130,247,0.5)] ring-offset-1 ring-offset-[var(--ds-bg-primary)]'
                        : 'cursor-pointer hover:ring-1 hover:ring-[rgba(212,180,131,0.3)]'
                    } ${isOverLimit ? 'ring-2 ring-[#FF6B6B]' : ''}`}
            >
                <AnimatePresence mode="wait">
                    {isEditing ? (
                        <motion.div
                            key="editing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <textarea
                                ref={textareaRef}
                                value={value}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={isSaving}
                                rows={minRows}
                                className={`w-full p-4 rounded-lg resize-none ${bgColorClass} border ${borderColorClass} 
                  text-[var(--ds-text-secondary)] leading-relaxed
                  placeholder:text-[var(--ds-text-muted)]
                  focus:outline-none focus:border-transparent
                  disabled:opacity-60 disabled:cursor-not-allowed
                  scrollbar-thin scrollbar-thumb-[rgba(212,180,131,0.2)] scrollbar-track-transparent`}
                                style={{ minHeight: `${minRows * 1.5}rem` }}
                                aria-label={`Edit ${label}`}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="viewing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className={`${bgColorClass} border ${borderColorClass} p-4 rounded-lg`}
                        >
                            <div className="whitespace-pre-wrap text-[var(--ds-text-secondary)] leading-relaxed min-h-[4rem]">
                                {value || (
                                    <span className="text-[var(--ds-text-muted)] italic">
                                        Click to add {label.toLowerCase()}...
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error indicator for over limit */}
                {isOverLimit && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -bottom-6 left-0 text-xs text-[#FF6B6B]"
                    >
                        Exceeds maximum length
                    </motion.div>
                )}
            </div>
        </motion.section>
    );
}
