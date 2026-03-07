'use client'

// Clickable chip/pill buttons for the buttons UI hint

import { Button } from '@/components/ui/button'
import { useChatClient } from '@/hooks/useChatClient'

interface ChatButtonsProps {
    options: Array<{ label: string; value: string }>
    messageId: string
}

export function ChatButtons({ options, messageId }: ChatButtonsProps) {
    const { sendText, dismissButtonHint } = useChatClient()

    const handleClick = (value: string) => {
        sendText(value)
        dismissButtonHint(messageId)
    }

    return (
        <div className="flex flex-wrap gap-2 mt-2">
            {options.map((option) => (
                <Button
                    key={option.value}
                    variant="outline"
                    size="sm"
                    onClick={() => handleClick(option.value)}
                    className="rounded-full border-[var(--ds-primary)]/30 text-[var(--ds-text-secondary)] hover:bg-[var(--ds-primary)]/10 hover:text-[var(--ds-primary)] hover:border-[var(--ds-primary)]/50 transition-all text-sm px-4 py-1.5 h-auto min-h-[36px]"
                >
                    {option.label}
                </Button>
            ))}
        </div>
    )
}
