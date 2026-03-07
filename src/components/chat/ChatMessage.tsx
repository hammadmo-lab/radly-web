'use client'

// Message bubble component
// Renders bot (left) and user (right) messages with optional UI hint

import { cn } from '@/lib/utils'
import { ChatButtons } from './ChatButtons'
import { ChatTemplateSelect } from './ChatTemplateSelect'
import { ChatReportCard } from './ChatReportCard'
import type { ChatMessage as ChatMessageType } from '@/types/chat'

interface ChatMessageProps {
    message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
    const isBot = message.role === 'bot'

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
                <p className="whitespace-pre-wrap break-words">{message.text}</p>

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
