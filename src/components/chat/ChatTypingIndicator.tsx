'use client'

// Typing indicator — three animated bouncing dots

import { motion } from 'framer-motion'

export function ChatTypingIndicator() {
    return (
        <div className="flex items-center gap-1 px-4 py-3">
            <div className="flex items-center gap-1 rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
                {[0, 1, 2].map(i => (
                    <motion.span
                        key={i}
                        className="block h-2 w-2 rounded-full bg-[var(--ds-text-tertiary)]"
                        animate={{ y: [0, -6, 0] }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: 'easeInOut',
                        }}
                    />
                ))}
            </div>
        </div>
    )
}
