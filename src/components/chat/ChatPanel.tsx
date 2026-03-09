'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, HelpCircle, Loader2, WifiOff, BarChart3, Activity } from 'lucide-react'
import { useChatClient } from '@/hooks/useChatClient'
import { ChatSettings } from './ChatSettings'
import { ChatMessage } from './ChatMessage'
import { ChatTypingIndicator } from './ChatTypingIndicator'
import { ChatInput } from './ChatInput'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import type { SessionState } from '@/types/chat'

// ─── Session Progress Map ──────────────────────────────────────────────

const SESSION_PROGRESS: Partial<Record<SessionState, { label: string; pct: number }>> = {
    onboarding_signature: { label: 'Signature', pct: 10 },
    exam_type:            { label: 'Exam type', pct: 20 },
    template_confirm:     { label: 'Template', pct: 30 },
    template_choose:      { label: 'Template', pct: 30 },
    indication:           { label: 'Indication', pct: 42 },
    comparison:           { label: 'Comparison', pct: 54 },
    findings:             { label: 'Findings', pct: 66 },
    findings_confirm:     { label: 'Findings', pct: 70 },
    findings_clarify:     { label: 'Findings', pct: 73 },
    findings_review:      { label: 'Reviewing', pct: 82 },
    patient_ask:          { label: 'Patient info', pct: 87 },
    patient_collect:      { label: 'Patient info', pct: 89 },
    review:               { label: 'Review', pct: 95 },
    editing:              { label: 'Editing', pct: 97 },
}

// ─── Component ────────────────────────────────────────────────────────

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

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isTyping])

    const lastBotMessage = [...messages].reverse().find(m => m.role === 'bot')
    const isCancelled = !!lastBotMessage?.text.toLowerCase().includes('cancelled')

    const showIdle      = connectionStatus === 'connected' && sessionState === 'idle' && messages.length === 0
    const showResume    = connectionStatus === 'connected' && sessionState !== 'idle' && messages.length === 0
    const showWhatsNext = connectionStatus === 'connected' && messages.length > 0 && !isTyping &&
        (sessionState === 'idle' || isCancelled)
    const progress      = SESSION_PROGRESS[sessionState]
    const showProgress  = !!progress && messages.length > 0 && !isCancelled

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
                        <div className="flex-shrink-0">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/3">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[var(--ds-primary)] to-[#E5C478] flex items-center justify-center flex-shrink-0">
                                        <span className="text-black text-sm font-bold">R</span>
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-[var(--ds-text-primary)]">
                                            Radly Assistant
                                        </h2>
                                        <div className="flex items-center gap-2">
                                            <StatusIndicator status={connectionStatus} />
                                            {showProgress && (
                                                <span className="text-xs text-[var(--ds-primary)] font-medium">
                                                    · {progress.label}
                                                </span>
                                            )}
                                        </div>
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

                            {/* Progress bar */}
                            {showProgress && (
                                <div className="h-[2px] bg-white/5">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-[var(--ds-primary)] to-[#E5C478]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress.pct}%` }}
                                        transition={{ duration: 0.6, ease: 'easeOut' }}
                                    />
                                </div>
                            )}
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
                                                router.push(subscriptionError.type === 'subscription_required' ? '/pricing' : '/login')
                                            }}
                                            className="bg-[var(--ds-primary)] text-black hover:bg-[var(--ds-primary-alt)] rounded-lg"
                                        >
                                            {subscriptionError.type === 'subscription_required' ? 'View Plans' : 'Sign In'}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Connecting */}
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

                            {/* Disconnected */}
                            {connectionStatus === 'disconnected' && !subscriptionError && messages.length === 0 && (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center space-y-3 px-4">
                                        <WifiOff className="h-8 w-8 text-[var(--ds-text-muted)] mx-auto" />
                                        <p className="text-sm text-[var(--ds-text-tertiary)]">
                                            Unable to connect. Please check your connection.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* ─── Idle — Quick Start ───────────────────────────── */}
                            {showIdle && (
                                <div className="flex flex-col h-full p-5 justify-center gap-6">
                                    <div className="text-center">
                                        <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-br from-[var(--ds-primary)] to-[#E5C478] items-center justify-center mb-3">
                                            <span className="text-black text-xl font-bold">R</span>
                                        </div>
                                        <h3 className="text-base font-semibold text-[var(--ds-text-primary)]">
                                            Radly Assistant
                                        </h3>
                                        <p className="text-sm text-[var(--ds-text-tertiary)] mt-1">
                                            What would you like to do?
                                        </p>
                                    </div>

                                    {/* Primary action cards */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => sendCommand('report')}
                                            className="flex flex-col items-start gap-3 p-4 rounded-2xl border border-[var(--ds-primary)]/25 bg-[var(--ds-primary)]/8 hover:bg-[var(--ds-primary)]/15 hover:border-[var(--ds-primary)]/40 transition-all text-left group"
                                        >
                                            <div className="h-9 w-9 rounded-xl bg-[var(--ds-primary)]/20 flex items-center justify-center group-hover:bg-[var(--ds-primary)]/30 transition-colors">
                                                <FileText className="h-[18px] w-[18px] text-[var(--ds-primary)]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-[var(--ds-text-primary)]">Start Report</p>
                                                <p className="text-xs text-[var(--ds-text-muted)] mt-0.5 leading-snug">Generate a radiology report</p>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => sendCommand('ask')}
                                            className="flex flex-col items-start gap-3 p-4 rounded-2xl border border-white/10 bg-white/3 hover:bg-white/6 hover:border-white/20 transition-all text-left group"
                                        >
                                            <div className="h-9 w-9 rounded-xl bg-white/8 flex items-center justify-center group-hover:bg-white/12 transition-colors">
                                                <HelpCircle className="h-[18px] w-[18px] text-[var(--ds-text-secondary)]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-[var(--ds-text-primary)]">Ask a Question</p>
                                                <p className="text-xs text-[var(--ds-text-muted)] mt-0.5 leading-snug">Radiology Q&amp;A and advice</p>
                                            </div>
                                        </button>
                                    </div>

                                    {/* Secondary links */}
                                    <div className="flex items-center justify-center gap-1">
                                        <button
                                            onClick={() => sendCommand('stats')}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-[var(--ds-text-muted)] hover:text-[var(--ds-text-secondary)] hover:bg-white/5 transition-colors"
                                        >
                                            <BarChart3 className="h-3.5 w-3.5" />
                                            My Stats
                                        </button>
                                        <span className="text-white/20 text-sm">·</span>
                                        <button
                                            onClick={() => sendCommand('status')}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-[var(--ds-text-muted)] hover:text-[var(--ds-text-secondary)] hover:bg-white/5 transition-colors"
                                        >
                                            <Activity className="h-3.5 w-3.5" />
                                            My Status
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ─── Session Resume ───────────────────────────────── */}
                            {showResume && (
                                <div className="p-4 h-full flex items-center justify-center">
                                    <div className="rounded-2xl border border-[var(--ds-primary)]/20 bg-[var(--ds-primary)]/5 p-6 text-center space-y-4 w-full">
                                        <div className="h-10 w-10 rounded-full bg-[var(--ds-primary)]/15 flex items-center justify-center mx-auto">
                                            <FileText className="h-5 w-5 text-[var(--ds-primary)]" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-[var(--ds-text-primary)]">Report in progress</p>
                                            <p className="text-xs text-[var(--ds-text-tertiary)] mt-1">Continue where you left off?</p>
                                        </div>
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

                            {/* ─── Message List ─────────────────────────────────── */}
                            <div className="py-2">
                                {messages.map((msg, i) => {
                                    const prev = messages[i - 1]
                                    const isGrouped = prev?.role === msg.role &&
                                        msg.timestamp - (prev?.timestamp ?? 0) < 90_000
                                    const showTimestamp = i === 0 ||
                                        msg.timestamp - (prev?.timestamp ?? 0) > 5 * 60_000
                                    return (
                                        <ChatMessage
                                            key={msg.id}
                                            message={msg}
                                            isGroupedWithPrev={isGrouped}
                                            showTimestamp={showTimestamp}
                                        />
                                    )
                                })}
                                {isTyping && <ChatTypingIndicator />}

                                {/* Post-session "What's next?" */}
                                {showWhatsNext && (
                                    <div className="px-4 py-4">
                                        <div className="rounded-2xl border border-white/8 bg-white/2 p-4">
                                            <p className="text-[10px] text-[var(--ds-text-muted)] text-center mb-3 uppercase tracking-widest font-semibold">
                                                What&apos;s next?
                                            </p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => sendCommand('report')}
                                                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[var(--ds-primary)]/10 border border-[var(--ds-primary)]/20 text-[var(--ds-primary)] text-xs font-medium hover:bg-[var(--ds-primary)]/20 transition-colors"
                                                >
                                                    <FileText className="h-3.5 w-3.5" />
                                                    New Report
                                                </button>
                                                <button
                                                    onClick={() => sendCommand('ask')}
                                                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[var(--ds-text-secondary)] text-xs font-medium hover:bg-white/8 transition-colors"
                                                >
                                                    <HelpCircle className="h-3.5 w-3.5" />
                                                    Ask a Question
                                                </button>
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
        connected:    { color: 'bg-green-500', label: 'Online' },
        connecting:   { color: 'bg-yellow-500 animate-pulse', label: 'Connecting' },
        reconnecting: { color: 'bg-yellow-500 animate-pulse', label: 'Reconnecting' },
        disconnected: { color: 'bg-gray-500', label: 'Offline' },
        error:        { color: 'bg-red-500', label: 'Error' },
    }
    const config = statusMap[status] ?? { color: 'bg-gray-500', label: 'Unknown' }
    return (
        <div className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${config.color}`} />
            <span className="text-xs text-[var(--ds-text-muted)]">{config.label}</span>
        </div>
    )
}
