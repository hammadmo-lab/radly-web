'use client'

// Main chat slide-out panel
// Contains header, message area, idle/resume state, and input bar

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, HelpCircle, Loader2, WifiOff, BarChart3, Activity, Settings } from 'lucide-react'
import { useChatClient } from '@/hooks/useChatClient'
import { ChatSettings } from './ChatSettings'
import { ChatMessage } from './ChatMessage'
import { ChatTypingIndicator } from './ChatTypingIndicator'
import { ChatInput } from './ChatInput'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function ChatPanel() {
    const {
        messages,
        connectionStatus,
        sessionState,
        isTyping,
        isPanelOpen,
        subscriptionError,
        closePanel,
        sendCommand,
        clearSubscriptionError,
    } = useChatClient()

    const router = useRouter()
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom on new messages or typing change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isTyping])

    const showIdle = connectionStatus === 'connected' && sessionState === 'idle' && messages.length === 0
    const showResume = connectionStatus === 'connected' && sessionState !== 'idle' && messages.length === 0

    return (
        <AnimatePresence>
            {isPanelOpen && (
                <>
                    {/* Backdrop — mobile only */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
                        onClick={closePanel}
                    />

                    {/* Panel */}
                    <motion.div
                        key="panel"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed z-50 top-0 right-0 h-full w-full md:w-[420px] flex flex-col bg-[var(--ds-bg-primary)]/95 backdrop-blur-xl border-l border-white/10 shadow-2xl"
                    >
                        {/* ─── Header ──────────────────────────────────────────── */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/3 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[var(--ds-primary)] to-[#E5C478] flex items-center justify-center">
                                    <span className="text-black text-sm font-bold">R</span>
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold text-[var(--ds-text-primary)]">
                                        Radly Assistant
                                    </h2>
                                    <StatusIndicator status={connectionStatus} />
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <ChatSettings />
                                <button
                                    onClick={closePanel}
                                    className="h-8 w-8 rounded-full flex items-center justify-center text-[var(--ds-text-tertiary)] hover:text-[var(--ds-text-primary)] hover:bg-white/5 transition-colors"
                                    aria-label="Close chat"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* ─── Messages Area ───────────────────────────────────── */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden">
                            {/* Subscription error */}
                            {subscriptionError && (
                                <div className="p-4">
                                    <div className="rounded-xl border border-[var(--ds-primary)]/30 bg-[var(--ds-primary)]/5 p-4 text-center">
                                        <p className="text-sm text-[var(--ds-text-secondary)] mb-3">
                                            {subscriptionError.type === 'subscription_required'
                                                ? 'The Radly Assistant is available on Professional and Premium plans.'
                                                : 'Your session has expired. Please sign in again.'}
                                        </p>
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                clearSubscriptionError()
                                                if (subscriptionError.type === 'subscription_required') {
                                                    router.push('/pricing')
                                                } else {
                                                    router.push('/login')
                                                }
                                            }}
                                            className="bg-[var(--ds-primary)] text-black hover:bg-[var(--ds-primary-alt)] rounded-lg"
                                        >
                                            {subscriptionError.type === 'subscription_required'
                                                ? 'View Plans'
                                                : 'Sign In'}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Connecting state */}
                            {(connectionStatus === 'connecting' || connectionStatus === 'reconnecting') && messages.length === 0 && (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center space-y-3">
                                        <Loader2 className="h-8 w-8 animate-spin text-[var(--ds-primary)] mx-auto" />
                                        <p className="text-sm text-[var(--ds-text-tertiary)]">
                                            {connectionStatus === 'reconnecting' ? 'Reconnecting...' : 'Connecting...'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Disconnected state */}
                            {connectionStatus === 'disconnected' && !subscriptionError && messages.length === 0 && (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center space-y-3 px-4">
                                        <WifiOff className="h-8 w-8 text-[var(--ds-text-muted)] mx-auto" />
                                        <p className="text-sm text-[var(--ds-text-tertiary)]">
                                            Unable to connect. Please check your connection and try again.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Idle state — show action buttons */}
                            {showIdle && (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center space-y-6 px-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-[var(--ds-text-primary)] mb-1">
                                                Welcome to Radly Assistant
                                            </h3>
                                            <p className="text-sm text-[var(--ds-text-tertiary)]">
                                                Start a new report or ask a radiology question.
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <Button
                                                onClick={() => sendCommand('report')}
                                                className="bg-[var(--ds-primary)] text-black hover:bg-[var(--ds-primary-alt)] rounded-xl h-12 gap-2 text-sm font-medium"
                                            >
                                                <FileText className="h-5 w-5" />
                                                Start Report
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => sendCommand('ask')}
                                                className="border-white/15 text-[var(--ds-text-secondary)] hover:bg-white/5 rounded-xl h-12 gap-2 text-sm font-medium"
                                            >
                                                <HelpCircle className="h-5 w-5" />
                                                Ask a Question
                                            </Button>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => sendCommand('stats')}
                                                    className="flex-1 border-white/10 text-[var(--ds-text-tertiary)] hover:bg-white/5 rounded-xl h-10 gap-1.5 text-sm"
                                                >
                                                    <BarChart3 className="h-4 w-4" />
                                                    My Stats
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => sendCommand('status')}
                                                    className="flex-1 border-white/10 text-[var(--ds-text-tertiary)] hover:bg-white/5 rounded-xl h-10 gap-1.5 text-sm"
                                                >
                                                    <Activity className="h-4 w-4" />
                                                    My Status
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Session resume banner */}
                            {showResume && (
                                <div className="p-4">
                                    <div className="rounded-xl border border-[var(--ds-primary)]/20 bg-[var(--ds-primary)]/5 p-4 text-center space-y-3">
                                        <p className="text-sm text-[var(--ds-text-secondary)]">
                                            You have an active report session in progress. Continue where you left off?
                                        </p>
                                        <div className="flex gap-2 justify-center">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => sendCommand('cancel')}
                                                className="border-white/15 text-[var(--ds-text-secondary)] hover:bg-white/5 rounded-lg"
                                            >
                                                Start Over
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => sendCommand('report')}
                                                className="bg-[var(--ds-primary)] text-black hover:bg-[var(--ds-primary-alt)] rounded-lg"
                                            >
                                                Continue
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Message list */}
                            <div className="py-2">
                                {messages.map(msg => (
                                    <ChatMessage key={msg.id} message={msg} />
                                ))}
                                {isTyping && <ChatTypingIndicator />}

                                {/* Show action buttons when session returns to idle after a completed flow */}
                                {connectionStatus === 'connected' && sessionState === 'idle' && messages.length > 0 && (
                                    <div className="px-4 py-4">
                                        <div className="rounded-xl border border-white/10 bg-white/3 p-4 text-center space-y-3">
                                            <p className="text-sm text-[var(--ds-text-tertiary)]">
                                                What would you like to do next?
                                            </p>
                                            <div className="flex flex-wrap gap-2 justify-center">
                                                <Button
                                                    size="sm"
                                                    onClick={() => sendCommand('report')}
                                                    className="bg-[var(--ds-primary)] text-black hover:bg-[var(--ds-primary-alt)] rounded-lg gap-1.5"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                    New Report
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => sendCommand('ask')}
                                                    className="border-white/15 text-[var(--ds-text-secondary)] hover:bg-white/5 rounded-lg gap-1.5"
                                                >
                                                    <HelpCircle className="h-4 w-4" />
                                                    Ask a Question
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => sendCommand('stats')}
                                                    className="border-white/10 text-[var(--ds-text-tertiary)] hover:bg-white/5 rounded-lg gap-1.5"
                                                >
                                                    <BarChart3 className="h-4 w-4" />
                                                    Stats
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => sendCommand('status')}
                                                    className="border-white/10 text-[var(--ds-text-tertiary)] hover:bg-white/5 rounded-lg gap-1.5"
                                                >
                                                    <Activity className="h-4 w-4" />
                                                    Status
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* ─── Input Bar ───────────────────────────────────────── */}
                        {!subscriptionError && <ChatInput />}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

// ─── Status Indicator ─────────────────────────────────────────────────

function StatusIndicator({ status }: { status: string }) {
    const statusMap: Record<string, { color: string; label: string }> = {
        connected: { color: 'bg-green-500', label: 'Online' },
        connecting: { color: 'bg-yellow-500 animate-pulse', label: 'Connecting' },
        reconnecting: { color: 'bg-yellow-500 animate-pulse', label: 'Reconnecting' },
        disconnected: { color: 'bg-gray-500', label: 'Offline' },
        error: { color: 'bg-red-500', label: 'Error' },
    }
    const config = statusMap[status] ?? { color: 'bg-gray-500', label: 'Unknown' }

    return (
        <div className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${config.color}`} />
            <span className="text-xs text-[var(--ds-text-muted)]">{config.label}</span>
        </div>
    )
}
