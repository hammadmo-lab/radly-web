'use client'

import { cn } from '@/lib/utils'
import { ChatButtons } from './ChatButtons'
import { ChatTemplateSelect } from './ChatTemplateSelect'
import { ChatReportCard } from './ChatReportCard'
import { FileDown } from 'lucide-react'
import type { ChatMessage as ChatMessageType } from '@/types/chat'

interface ChatMessageProps {
    message: ChatMessageType
    isGroupedWithPrev?: boolean
    showTimestamp?: boolean
}

// Step/progress messages: short lines ending with "..." or starting with a status emoji
function isStepMessage(text: string): boolean {
    const t = text.trim()
    return t.length < 140 && (t.endsWith('...') || /^[\p{Emoji}]/u.test(t))
}

// Extract a presigned .docx URL and strip the surrounding markdown block
function extractDocxUrl(text: string): { cleanText: string; docxUrl: string | null; expiryNote: string | null } {
    const urlMatch = text.match(/(https?:\/\/\S+\.docx\S*?)(?=\s*\)|\s*$)/m)
    if (!urlMatch) return { cleanText: text, docxUrl: null, expiryNote: null }

    const docxUrl = urlMatch[1].trim()
    const expiryMatch = text.match(/\(expires in ([^)]+)\)/)
    const expiryNote = expiryMatch ? `Expires in ${expiryMatch[1]}` : null

    const cleanText = text
        .replace(/📎?\s*\[Download DOCX\]\s*\([\s\S]*?\)/g, '')
        .replace(/_?\(expires in [^)]+\)_?/g, '')
        .replace(/\n---\n/g, '\n')
        .trim()

    return { cleanText, docxUrl, expiryNote }
}

function formatTime(ts: number): string {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function ChatMessage({ message, isGroupedWithPrev, showTimestamp }: ChatMessageProps) {
    const isBot = message.role === 'bot'
    const hasReportCard = message.ui?.type === 'report_card'
    const isStep = isBot && !hasReportCard && isStepMessage(message.text)

    const { cleanText, docxUrl, expiryNote } = isBot && !hasReportCard
        ? extractDocxUrl(message.text)
        : { cleanText: hasReportCard ? null : message.text, docxUrl: null, expiryNote: null }

    // Timestamp separator
    const timestampEl = showTimestamp && (
        <div className="flex items-center justify-center px-4 py-2 mt-2">
            <span className="text-[10px] text-[var(--ds-text-muted)] bg-white/4 px-2.5 py-0.5 rounded-full border border-white/8">
                {formatTime(message.timestamp)}
            </span>
        </div>
    )

    // ── Step / progress message — compact, no bubble ──────────────────
    if (isStep) {
        return (
            <>
                {timestampEl}
                <div className={cn('flex w-full px-5', isGroupedWithPrev ? 'pt-0.5 pb-0.5' : 'pt-2 pb-0.5')}>
                    <div className="flex items-center gap-2 text-xs text-[var(--ds-text-muted)] italic">
                        <span className="h-1 w-1 rounded-full bg-[var(--ds-primary)]/50 flex-shrink-0 mt-px" />
                        <span>{message.text}</span>
                    </div>
                </div>
            </>
        )
    }

    // ── Report card — no outer bubble ─────────────────────────────────
    if (hasReportCard) {
        return (
            <>
                {timestampEl}
                <div className="px-3 pt-2 pb-1">
                    {renderUiHint(message.ui!, message.id)}
                </div>
            </>
        )
    }

    // ── Regular message bubble ────────────────────────────────────────
    return (
        <>
            {timestampEl}
            <div
                className={cn(
                    'flex w-full px-4',
                    isBot ? 'justify-start' : 'justify-end',
                    isGroupedWithPrev ? 'pt-0.5 pb-0.5' : 'pt-2 pb-0.5'
                )}
            >
                <div
                    className={cn(
                        'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                        isBot
                            ? 'bg-white/5 border border-white/10 text-[var(--ds-text-secondary)]'
                            : 'bg-[var(--ds-primary)]/15 border border-[var(--ds-primary)]/20 text-[var(--ds-text-primary)]',
                        isGroupedWithPrev && isBot  && 'rounded-tl-lg',
                        isGroupedWithPrev && !isBot && 'rounded-tr-lg',
                    )}
                >
                    {cleanText && <p className="whitespace-pre-wrap break-words">{cleanText}</p>}

                    {/* Inline DOCX download button */}
                    {docxUrl && (
                        <div className="mt-3 flex flex-col gap-1.5">
                            <a
                                href={docxUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--ds-primary)]/30 bg-[var(--ds-primary)]/10 text-[var(--ds-primary)] text-xs font-medium hover:bg-[var(--ds-primary)]/20 transition-colors w-fit"
                            >
                                <FileDown className="h-3.5 w-3.5 flex-shrink-0" />
                                Download DOCX
                            </a>
                            {expiryNote && (
                                <p className="text-xs text-[var(--ds-text-muted)] pl-1">{expiryNote}</p>
                            )}
                        </div>
                    )}

                    {message.ui && renderUiHint(message.ui, message.id)}
                </div>
            </div>
        </>
    )
}

function renderUiHint(ui: NonNullable<ChatMessageType['ui']>, messageId: string) {
    switch (ui.type) {
        case 'none':            return null
        case 'voice_prompt':    return null
        case 'buttons':         return <ChatButtons options={ui.options} messageId={messageId} />
        case 'template_select': return <ChatTemplateSelect candidates={ui.candidates} />
        case 'report_card':     return <ChatReportCard report={ui.report} docxUrl={ui.docxUrl} />
        default:                return null
    }
}
