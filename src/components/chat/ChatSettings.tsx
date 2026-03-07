'use client'

// Chat settings panel — gear icon in header opens a dropdown/popover
// Handles: DOCX template upload/remove, stats, status

import { useState, useRef, useCallback } from 'react'
import {
    Settings,
    Upload,
    Trash2,
    FileText,
    BarChart3,
    Activity,
    Loader2,
    CheckCircle2,
    AlertTriangle,
    X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useChatClient } from '@/hooks/useChatClient'
import { uploadTemplate, removeTemplate } from '@/lib/chat-api'
import type { TemplateUploadResult, TemplateUploadError } from '@/lib/chat-api'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Types ──────────────────────────────────────────────────────────

interface TemplateState {
    hasTemplate: boolean
    templateName: string | null
    placeholders: string[] | null
}

// ─── Component ──────────────────────────────────────────────────────

export function ChatSettings() {
    const { sendCommand } = useChatClient()
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Panel visibility
    const [isOpen, setIsOpen] = useState(false)

    // Template state
    const [template, setTemplate] = useState<TemplateState>({
        hasTemplate: false,
        templateName: null,
        placeholders: null,
    })

    // Upload state
    const [isUploading, setIsUploading] = useState(false)
    const [uploadSuccess, setUploadSuccess] = useState<TemplateUploadResult | null>(null)
    const [uploadError, setUploadError] = useState<TemplateUploadError | null>(null)

    // Remove state
    const [isRemoving, setIsRemoving] = useState(false)

    // ─── Handlers ─────────────────────────────────────────────────────

    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Reset file input so same file can be re-selected
        e.target.value = ''

        // Validate client-side
        if (!file.name.toLowerCase().endsWith('.docx')) {
            setUploadError({ error: 'Only .docx files are accepted' })
            return
        }
        if (file.size > 10 * 1024 * 1024) {
            setUploadError({ error: 'File too large (max 10 MB)' })
            return
        }

        setIsUploading(true)
        setUploadError(null)
        setUploadSuccess(null)

        try {
            const result = await uploadTemplate(file)
            setUploadSuccess(result)
            setTemplate({
                hasTemplate: true,
                templateName: result.name,
                placeholders: result.found_placeholders,
            })
        } catch (err) {
            const uploadErr = err as TemplateUploadError
            setUploadError(uploadErr)
        } finally {
            setIsUploading(false)
        }
    }, [])

    const handleRemoveTemplate = useCallback(async () => {
        setIsRemoving(true)
        try {
            await removeTemplate()
            setTemplate({ hasTemplate: false, templateName: null, placeholders: null })
            setUploadSuccess(null)
            setUploadError(null)
        } catch {
            setUploadError({ error: 'Failed to remove template. Try again.' })
        } finally {
            setIsRemoving(false)
        }
    }, [])

    return (
        <div className="relative">
            {/* Gear button */}
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-[var(--ds-text-tertiary)] hover:text-[var(--ds-text-primary)] hover:bg-white/5 transition-colors"
                aria-label="Chat settings"
            >
                <Settings className="h-4.5 w-4.5" />
            </button>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".docx"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Settings dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

                        <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-10 z-50 w-72 rounded-xl border border-white/10 bg-[var(--ds-bg-primary)] shadow-2xl backdrop-blur-xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="px-4 py-2.5 border-b border-white/10 flex items-center justify-between">
                                <span className="text-sm font-semibold text-[var(--ds-text-primary)]">Settings</span>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="h-6 w-6 rounded-full flex items-center justify-center text-[var(--ds-text-muted)] hover:text-[var(--ds-text-primary)] hover:bg-white/5"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            <div className="p-3 space-y-3">
                                {/* ── DOCX Template ──────────────────────────────── */}
                                <div>
                                    <p className="text-xs font-semibold text-[var(--ds-text-tertiary)] uppercase tracking-wider mb-2 px-1">
                                        Report Template
                                    </p>

                                    {/* Current status */}
                                    <div className="rounded-lg bg-white/3 border border-white/8 p-3 mb-2">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-[var(--ds-text-muted)]" />
                                            <span className="text-sm text-[var(--ds-text-secondary)]">
                                                {template.hasTemplate ? template.templateName : 'Default format'}
                                            </span>
                                        </div>
                                        {template.placeholders && template.placeholders.length > 0 && (
                                            <p className="text-xs text-[var(--ds-text-muted)] mt-1.5 pl-6">
                                                Tags: {template.placeholders.map(t => `{${t}}`).join(', ')}
                                            </p>
                                        )}
                                    </div>

                                    {/* Upload / Remove buttons */}
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="flex-1 h-8 text-xs gap-1.5 rounded-lg border-white/15 text-[var(--ds-text-secondary)] hover:bg-white/5"
                                        >
                                            {isUploading ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Upload className="h-3.5 w-3.5" />
                                            )}
                                            {isUploading ? 'Uploading...' : 'Upload .docx'}
                                        </Button>
                                        {template.hasTemplate && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleRemoveTemplate}
                                                disabled={isRemoving}
                                                className="h-8 text-xs gap-1.5 rounded-lg border-red-500/20 text-red-400 hover:bg-red-500/10"
                                            >
                                                {isRemoving ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                )}
                                                Remove
                                            </Button>
                                        )}
                                    </div>

                                    {/* Upload success */}
                                    {uploadSuccess && (
                                        <div className="mt-2 rounded-lg bg-green-500/8 border border-green-500/20 p-2.5 flex items-start gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                                            <div className="text-xs text-green-300">
                                                <p className="font-medium">Template uploaded: {uploadSuccess.name}</p>
                                                {uploadSuccess.found_placeholders.length > 0 && (
                                                    <p className="mt-0.5 text-green-400/80">
                                                        Tags found: {uploadSuccess.found_placeholders.map(t => `{${t}}`).join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Upload error */}
                                    {uploadError && (
                                        <div className="mt-2 rounded-lg bg-red-500/8 border border-red-500/20 p-2.5 flex items-start gap-2">
                                            <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                                            <div className="text-xs text-red-300">
                                                <p className="font-medium">{uploadError.error}</p>
                                                {uploadError.missing && uploadError.missing.length > 0 && (
                                                    <p className="mt-1">
                                                        Missing required tags: {uploadError.missing.join(', ')}
                                                    </p>
                                                )}
                                                {uploadError.found && uploadError.found.length > 0 && (
                                                    <p className="mt-0.5 text-red-400/70">
                                                        Found tags: {uploadError.found.join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* ── Quick Actions ──────────────────────────────── */}
                                <div>
                                    <p className="text-xs font-semibold text-[var(--ds-text-tertiary)] uppercase tracking-wider mb-2 px-1">
                                        Quick Actions
                                    </p>
                                    <div className="space-y-1">
                                        <button
                                            onClick={() => { sendCommand('stats'); setIsOpen(false) }}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--ds-text-secondary)] hover:bg-white/5 hover:text-[var(--ds-text-primary)] transition-colors text-left"
                                        >
                                            <BarChart3 className="h-4 w-4 text-[var(--ds-text-muted)]" />
                                            View 30-Day Stats
                                        </button>
                                        <button
                                            onClick={() => { sendCommand('status'); setIsOpen(false) }}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--ds-text-secondary)] hover:bg-white/5 hover:text-[var(--ds-text-primary)] transition-colors text-left"
                                        >
                                            <Activity className="h-4 w-4 text-[var(--ds-text-muted)]" />
                                            Check Subscription & Session
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
