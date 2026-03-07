'use client'

// Template selection list for the template_select UI hint

import { useChatClient } from '@/hooks/useChatClient'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface ChatTemplateSelectProps {
    candidates: Array<{
        template_id: string
        title: string
        modality: string
    }>
}

export function ChatTemplateSelect({ candidates }: ChatTemplateSelectProps) {
    const { sendText } = useChatClient()
    const [selected, setSelected] = useState<number | null>(null)

    const handleSelect = (index: number) => {
        setSelected(index)
        sendText(String(index + 1))
    }

    return (
        <div className="mt-3 space-y-2">
            {candidates.map((candidate, index) => (
                <button
                    key={candidate.template_id}
                    onClick={() => handleSelect(index)}
                    disabled={selected !== null}
                    className={cn(
                        'w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all border',
                        selected === index
                            ? 'bg-[var(--ds-primary)]/10 border-[var(--ds-primary)]/40'
                            : selected !== null
                                ? 'opacity-40 cursor-not-allowed border-white/5'
                                : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
                    )}
                >
                    {/* Number */}
                    <span
                        className={cn(
                            'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold',
                            selected === index
                                ? 'bg-[var(--ds-primary)] text-black'
                                : 'bg-white/10 text-[var(--ds-text-secondary)]'
                        )}
                    >
                        {index + 1}
                    </span>

                    {/* Template info */}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--ds-text-primary)] truncate">
                            {candidate.title}
                        </p>
                    </div>

                    {/* Modality badge */}
                    <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full bg-white/8 text-[var(--ds-text-tertiary)] border border-white/10">
                        {candidate.modality}
                    </span>
                </button>
            ))}
        </div>
    )
}
