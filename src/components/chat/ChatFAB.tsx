'use client'

import { MessageCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChatClient } from '@/hooks/useChatClient'
import { cn } from '@/lib/utils'

export function ChatFAB() {
    const { isPanelOpen, togglePanel } = useChatClient()

    return (
        <motion.button
            onClick={togglePanel}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
            className={cn(
                'fixed z-40 flex items-center gap-2.5',
                'bottom-24 right-4 md:bottom-8 md:right-8',
                'touch-manipulation',
                // When open: compact circle
                isPanelOpen
                    ? 'h-12 w-12 rounded-full justify-center'
                    : 'h-12 px-4 rounded-full justify-center',
                'bg-gradient-to-r from-[var(--ds-primary)] to-[#6B8FFF]',
                'text-white font-semibold text-sm',
                'shadow-[0_4px_24px_rgba(38,83,255,0.55)]',
                'hover:shadow-[0_4px_32px_rgba(38,83,255,0.75)]',
                'transition-all duration-300',
            )}
            title={isPanelOpen ? 'Close assistant' : 'Open Radly Assistant'}
            aria-label={isPanelOpen ? 'Close chat panel' : 'Open Radly Assistant chat'}
        >
            {/* Subtle pulse ring — only when closed */}
            {!isPanelOpen && (
                <span className="absolute inset-0 rounded-full bg-[var(--ds-primary)] animate-ping opacity-20 pointer-events-none" />
            )}

            <AnimatePresence mode="wait" initial={false}>
                {isPanelOpen ? (
                    <motion.span
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                    >
                        <X className="h-5 w-5" />
                    </motion.span>
                ) : (
                    <motion.span
                        key="chat"
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: 6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 6 }}
                        transition={{ duration: 0.15 }}
                    >
                        <MessageCircle className="h-5 w-5 flex-shrink-0" />
                        <span className="pr-0.5">Ask Radly</span>
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.button>
    )
}
