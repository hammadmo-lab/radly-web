'use client'

// Chat input bar with text field, mic button, and send button

import { useState, useRef, useCallback, useEffect } from 'react'
import { Send, Mic, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useChatClient } from '@/hooks/useChatClient'
import { useChatVoice } from '@/hooks/useChatVoice'

export function ChatInput() {
    const { sendText, latestUiHint, connectionStatus } = useChatClient()
    const [text, setText] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)
    const liveBoxRef = useRef<HTMLDivElement>(null)

    const isVoicePrompt = latestUiHint?.type === 'voice_prompt'
    const isDisconnected = connectionStatus !== 'connected'

    // Voice recording
    const { isRecording, isTranscribing, liveTranscript, interimTranscript, startRecording, stopRecording } = useChatVoice({
        onTranscript: (transcript) => {
            sendText(transcript)
        },
        onError: (error) => {
            console.error('Voice error:', error)
        },
    })

    // Auto-scroll the live transcription box to bottom
    useEffect(() => {
        if (liveBoxRef.current) {
            liveBoxRef.current.scrollTop = liveBoxRef.current.scrollHeight
        }
    }, [liveTranscript, interimTranscript])

    const handleSend = useCallback(() => {
        const trimmed = text.trim()
        if (!trimmed) return
        sendText(trimmed)
        setText('')
        inputRef.current?.focus()
    }, [text, sendText])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleMicClick = () => {
        if (isRecording) {
            stopRecording()
        } else {
            startRecording()
        }
    }

    // Compose the full live display: final text + interim text
    const displayText = [liveTranscript, interimTranscript].filter(Boolean).join(' ')

    return (
        <div className="border-t border-white/10 bg-black/20 px-3 py-3 backdrop-blur-sm">
            {/* Live transcription panel */}
            {(isRecording || isTranscribing) && (
                <div className="mb-2">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                        </span>
                        <span className="text-xs font-medium text-red-400 uppercase tracking-wider">
                            Live Transcription
                        </span>
                    </div>
                    <div
                        ref={liveBoxRef}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-[var(--ds-text-primary)] max-h-[120px] overflow-y-auto min-h-[48px]"
                    >
                        {displayText ? (
                            <>
                                {liveTranscript && (
                                    <span>{liveTranscript}</span>
                                )}
                                {interimTranscript && (
                                    <span className="text-[var(--ds-text-muted)] italic">
                                        {liveTranscript ? ' ' : ''}{interimTranscript}
                                    </span>
                                )}
                                <span className="inline-block w-0.5 h-4 bg-[var(--ds-primary)] animate-pulse ml-0.5 align-text-bottom" />
                            </>
                        ) : (
                            <span className="text-[var(--ds-text-muted)] italic">
                                Listening...
                                <span className="inline-block w-0.5 h-4 bg-[var(--ds-primary)] animate-pulse ml-0.5 align-text-bottom" />
                            </span>
                        )}
                    </div>
                </div>
            )}

            <div className="flex items-center gap-2">
                {/* Mic button */}
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleMicClick}
                    disabled={isDisconnected || isTranscribing}
                    className={cn(
                        'flex-shrink-0 h-10 w-10 rounded-full transition-all',
                        isRecording
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            : isVoicePrompt
                                ? 'bg-[var(--ds-primary)]/15 text-[var(--ds-primary)] animate-pulse hover:bg-[var(--ds-primary)]/25'
                                : 'text-[var(--ds-text-tertiary)] hover:text-[var(--ds-text-secondary)] hover:bg-white/5'
                    )}
                    title={isRecording ? 'Stop recording' : 'Start recording'}
                >
                    {isTranscribing ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Mic className="h-5 w-5" />
                    )}

                    {/* Recording pulse indicator */}
                    {isRecording && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                        </span>
                    )}
                </Button>

                {/* Text input */}
                <input
                    ref={inputRef}
                    type="text"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                        isRecording
                            ? 'Listening...'
                            : isTranscribing
                                ? 'Transcribing...'
                                : 'Type a message...'
                    }
                    disabled={isDisconnected || isRecording || isTranscribing}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[var(--ds-text-primary)] placeholder:text-[var(--ds-text-muted)] focus:outline-none focus:border-[var(--ds-primary)]/40 focus:ring-1 focus:ring-[var(--ds-primary)]/20 transition-all min-h-[40px]"
                />

                {/* Send button */}
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleSend}
                    disabled={!text.trim() || isDisconnected}
                    className="flex-shrink-0 h-10 w-10 rounded-full text-[var(--ds-primary)] hover:bg-[var(--ds-primary)]/10 disabled:opacity-30 transition-all"
                    title="Send message"
                >
                    <Send className="h-5 w-5" />
                </Button>
            </div>
        </div>
    )
}
