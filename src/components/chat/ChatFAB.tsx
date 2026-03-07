'use client'

// Floating Action Button to toggle the chat panel

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
                'fixed z-40 flex items-center justify-center',
                'h-14 w-14 rounded-full shadow-lg',
                'bg-gradient-to-br from-[var(--ds-primary)] to-[#E5C478]',
                'text-black hover:shadow-[0_0_20px_rgba(245,215,145,0.35)]',
                'transition-shadow duration-300',
                // Position: above bottom nav on mobile, bottom-right on desktop
                'bottom-24 right-4 md:bottom-8 md:right-8',
                'touch-manipulation'
            )}
            title={isPanelOpen ? 'Close chat' : 'Open Radly Assistant'}
            aria-label={isPanelOpen ? 'Close chat panel' : 'Open Radly Assistant chat'}
        >
            <AnimatePresence mode="wait" initial={false}>
                {isPanelOpen ? (
                    <motion.span
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                    >
                        <X className="h-6 w-6" />
                    </motion.span>
                ) : (
                    <motion.span
                        key="chat"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                    >
                        <MessageCircle className="h-6 w-6" />
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.button>
    )
}
