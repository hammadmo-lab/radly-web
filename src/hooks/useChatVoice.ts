'use client'

// Voice recording hook for the chatbot
// Uses MediaRecorder to capture audio, then streams via WebSocket to /v1/transcribe/stream
// Provides real-time interim transcription and delivers final transcript on stop

import { useState, useRef, useCallback } from 'react'
import { getAuthToken } from '@/lib/chat-auth'
import { createTranscriptionWebSocket, TranscriptionWebSocket } from '@/lib/websocket'
import type { WebSocketMessage } from '@/types/transcription'

// ─── Constants ──────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.radly.app'

// Preferred MIME types in order of preference
const MIME_PREFERENCES = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
]

function getSupportedMimeType(): string {
    for (const mime of MIME_PREFERENCES) {
        if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mime)) {
            return mime
        }
    }
    return '' // browser default
}

// ─── Hook ────────────────────────────────────────────────────────────

export interface UseChatVoiceOptions {
    onTranscript: (text: string) => void
    onError?: (error: string) => void
}

export interface UseChatVoiceReturn {
    isRecording: boolean
    isTranscribing: boolean
    liveTranscript: string
    interimTranscript: string
    startRecording: () => Promise<void>
    stopRecording: () => void
}

export function useChatVoice({
    onTranscript,
    onError,
}: UseChatVoiceOptions): UseChatVoiceReturn {
    const [isRecording, setIsRecording] = useState(false)
    const [isTranscribing, setIsTranscribing] = useState(false)
    const [interimTranscript, setInterimTranscript] = useState('')
    const [liveTranscript, setLiveTranscript] = useState('')

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const mediaStreamRef = useRef<MediaStream | null>(null)
    const wsRef = useRef<TranscriptionWebSocket | null>(null)
    const chunkTimerRef = useRef<NodeJS.Timeout | null>(null)

    // Accumulated final transcripts from this recording session
    const accumulatedRef = useRef<string[]>([])

    const cleanup = useCallback(() => {
        // Stop chunk flush timer
        if (chunkTimerRef.current) {
            clearInterval(chunkTimerRef.current)
            chunkTimerRef.current = null
        }

        // Stop media recorder
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop()
        }
        mediaRecorderRef.current = null

        // Stop media stream tracks (release microphone)
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(t => t.stop())
            mediaStreamRef.current = null
        }

        // Close WebSocket
        if (wsRef.current) {
            wsRef.current.close()
            wsRef.current = null
        }
    }, [])

    const handleWsMessage = useCallback((message: WebSocketMessage) => {
        switch (message.type) {
            case 'connection_established':
                // WebSocket ready — start the MediaRecorder
                if (mediaRecorderRef.current?.state === 'inactive') {
                    mediaRecorderRef.current.start(250) // 250ms timeslice for streaming
                    // Backup flush every 1s
                    chunkTimerRef.current = setInterval(() => {
                        if (mediaRecorderRef.current?.state === 'recording') {
                            mediaRecorderRef.current.requestData()
                        }
                    }, 1000)
                }
                setIsRecording(true)
                setIsTranscribing(false)
                break

            case 'transcript':
                if (message.is_final) {
                    accumulatedRef.current.push(message.transcript)
                    setLiveTranscript(accumulatedRef.current.join(' '))
                    setInterimTranscript('')
                } else {
                    setInterimTranscript(message.transcript)
                }
                break

            case 'duration_limit_reached':
                onError?.(message.message)
                break

            case 'error':
                onError?.(message.message)
                break
        }
    }, [onError])

    const startRecording = useCallback(async () => {
        try {
            const token = await getAuthToken()
            if (!token) {
                onError?.('Not authenticated')
                return
            }

            // Reset state
            accumulatedRef.current = []
            setInterimTranscript('')
            setLiveTranscript('')
            setIsTranscribing(true) // show connecting state

            // Request microphone
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: 16000,
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            })
            mediaStreamRef.current = stream

            // Determine MIME type
            let mimeType = ''
            for (const mime of MIME_PREFERENCES) {
                if (MediaRecorder.isTypeSupported(mime)) {
                    mimeType = mime
                    break
                }
            }

            const options: MediaRecorderOptions = {}
            if (mimeType) options.mimeType = mimeType

            const recorder = new MediaRecorder(stream, options)
            mediaRecorderRef.current = recorder

            // Send audio chunks to WebSocket
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0 && wsRef.current?.isOpen) {
                    wsRef.current.send(event.data)
                }
            }

            recorder.onerror = () => {
                onError?.('Recording failed')
                cleanup()
                setIsRecording(false)
                setIsTranscribing(false)
            }

            // Create transcription WebSocket
            const ws = createTranscriptionWebSocket(API_BASE, token, {
                onOpen: () => {
                    // Wait for connection_established message
                },
                onMessage: handleWsMessage,
                onError: (err) => {
                    onError?.(err.message)
                    cleanup()
                    setIsRecording(false)
                    setIsTranscribing(false)
                },
                onClose: (code, reason) => {
                    if (code === 1008) {
                        onError?.(reason || 'Access denied. Please check your subscription plan.')
                    } else if (code !== 1000 && isRecording) {
                        onError?.('Connection lost')
                    }

                    // Deliver accumulated transcript on WebSocket close
                    const full = accumulatedRef.current.join(' ').trim()
                    if (full) {
                        onTranscript(full)
                    }

                    setIsRecording(false)
                    setIsTranscribing(false)
                },
                reconnect: false,
            })

            wsRef.current = ws
            ws.connect()
        } catch (err) {
            if (err instanceof DOMException && err.name === 'NotAllowedError') {
                onError?.('Microphone access denied. Please allow microphone access and try again.')
            } else {
                onError?.(err instanceof Error ? err.message : 'Failed to start recording')
            }
            cleanup()
            setIsRecording(false)
            setIsTranscribing(false)
        }
    }, [onTranscript, onError, handleWsMessage, cleanup, isRecording])

    const stopRecording = useCallback(() => {
        // Deliver accumulated transcript before closing
        const full = accumulatedRef.current.join(' ').trim()
        accumulatedRef.current = []

        cleanup()
        setIsRecording(false)
        setInterimTranscript('')
        setLiveTranscript('')

        if (full) {
            onTranscript(full)
            setIsTranscribing(false)
        } else {
            // Brief transcribing state for any in-flight final
            setIsTranscribing(false)
        }
    }, [onTranscript, cleanup])

    return { isRecording, isTranscribing, liveTranscript, interimTranscript, startRecording, stopRecording }
}
