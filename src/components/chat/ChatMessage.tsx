'use client'

// Message bubble component
// Renders bot (left) and user (right) messages with optional UI hint

import { cn } from '@/lib/utils'
import { ChatButtons } from './ChatButtons'
import { ChatTemplateSelect } from './ChatTemplateSelect'
import { ChatReportCard } from './ChatReportCard'
import { FileDown } from 'lucide-react'
import type { ChatMessage as ChatMessageType } from '@/types/chat'

interface ChatMessageProps {
    message: ChatMessageType
}

// Extract DOCX URL from bot message text.
// Finds any presigned .docx URL then strips the surrounding markdown block.
function extractDocxUrl(text: string): { cleanText: string; docxUrl: string | null; expiryNote: string | null } {
    const urlMatch = text.match(/(https?:\/\/\S+\.docx\S*?)(?=\s*\)|\s*$)/m)
    if (!urlMatch) return { cleanText: text, docxUrl: null, expiryNote: null }

    const docxUrl = urlMatch[1].trim()

    const expiryMatch = text.match(/\(expires in ([^)]+)\)/)
    const expiryNote = expiryMatch ? `Expires in ${expiryMatch[1]}` : null

    // Remove: optional emoji, [Download DOCX](...url...), expiry note, and leftover --- separator
    let cleanText = text
        .replace(/📎?\s*\[Download DOCX\]\s*\([\s\S]*?\)/g, '')
        .replace(/_?\(expires in [^)]+\)_?/g, '')
        .replace(/\n---\n/g, '\n')
        .trim()

    return { cleanText, docxUrl, expiryNote }
}

export function ChatMessage({ message }: ChatMessageProps) {
    const isBot = message.role === 'bot'
    const { cleanText, docxUrl, expiryNote } = isBot
        ? extractDocxUrl(message.text)
        : { cleanText: message.text, docxUrl: null, expiryNote: null }

    return (
        <div
            className={cn(
                'flex w-full px-4 py-1.5',
                isBot ? 'justify-start' : 'justify-end'
            )}
        >
            <div
                className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                    isBot
                        ? 'bg-white/5 border border-white/10 text-[var(--ds-text-secondary)]'
                        : 'bg-[var(--ds-primary)]/15 border border-[var(--ds-primary)]/20 text-[var(--ds-text-primary)]'
                )}
            >
                {/* Text content */}
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

                {/* UI Hint rendering */}
                {message.ui && renderUiHint(message.ui, message.id)}
            </div>
        </div>
    )
}

function renderUiHint(ui: NonNullable<ChatMessageType['ui']>, messageId: string) {
    switch (ui.type) {
        case 'none':
            return null
        case 'voice_prompt':
            return null // mic highlight handled by ChatInput
        case 'buttons':
            return <ChatButtons options={ui.options} messageId={messageId} />
        case 'template_select':
            return <ChatTemplateSelect candidates={ui.candidates} />
        case 'report_card':
            return <ChatReportCard report={ui.report} docxUrl={ui.docxUrl} />
        default:
            return null
    }
}
