'use client'

// Voice recording hook for the chatbot
// Uses MediaRecorder to capture audio, then POST to REST transcription endpoint
// Separate from useVoiceRecording which streams audio over WebSocket

import { useState, useRef, useCallback } from 'react'
import { getAuthToken } from '@/lib/chat-auth'

// ─── Constants ──────────────────────────────────────────────────────

const TRANSCRIBE_URL = 'https://api.radly.app/v1/transcribe'

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

function getFileExtension(mimeType: string): string {
    if (mimeType.includes('webm')) return 'webm'
    if (mimeType.includes('mp4')) return 'mp4'
    if (mimeType.includes('ogg')) return 'ogg'
    return 'webm'
}

// ─── Hook ────────────────────────────────────────────────────────────

export interface UseChatVoiceOptions {
    onTranscript: (text: string) => void
    onError?: (error: string) => void
}

export interface UseChatVoiceReturn {
    isRecording: boolean
    isTranscribing: boolean
    startRecording: () => Promise<void>
    stopRecording: () => void
}

export function useChatVoice({
    onTranscript,
    onError,
}: UseChatVoiceOptions): UseChatVoiceReturn {
    const [isRecording, setIsRecording] = useState(false)
    const [isTranscribing, setIsTranscribing] = useState(false)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const mimeTypeRef = useRef<string>('')

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mimeType = getSupportedMimeType()
            mimeTypeRef.current = mimeType

            const options: MediaRecorderOptions = {}
            if (mimeType) options.mimeType = mimeType

            const recorder = new MediaRecorder(stream, options)
            chunksRef.current = []

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data)
                }
            }

            recorder.onstop = async () => {
                // Stop all tracks to release microphone
                stream.getTracks().forEach(t => t.stop())

                const blob = new Blob(chunksRef.current, {
                    type: mimeType || 'audio/webm',
                })

                if (blob.size === 0) {
                    onError?.('No audio recorded')
                    return
                }

                // Transcribe via REST
                setIsTranscribing(true)
                try {
                    const transcript = await transcribeAudio(blob, mimeType)
                    if (transcript) {
                        onTranscript(transcript)
                    } else {
                        onError?.('No speech detected')
                    }
                } catch (err) {
                    onError?.(err instanceof Error ? err.message : 'Transcription failed')
                } finally {
                    setIsTranscribing(false)
                }
            }

            recorder.onerror = () => {
                onError?.('Recording failed')
                setIsRecording(false)
                stream.getTracks().forEach(t => t.stop())
            }

            mediaRecorderRef.current = recorder
            recorder.start()
            setIsRecording(true)
        } catch (err) {
            if (err instanceof DOMException && err.name === 'NotAllowedError') {
                onError?.('Microphone access denied. Please allow microphone access and try again.')
            } else {
                onError?.(err instanceof Error ? err.message : 'Failed to start recording')
            }
        }
    }, [onTranscript, onError])

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop()
        }
        setIsRecording(false)
    }, [])

    return { isRecording, isTranscribing, startRecording, stopRecording }
}

// ─── Transcription REST call ────────────────────────────────────────

async function transcribeAudio(blob: Blob, mimeType: string): Promise<string> {
    const token = await getAuthToken()
    if (!token) throw new Error('Not authenticated')

    const ext = getFileExtension(mimeType)
    const form = new FormData()
    form.append('file', blob, `recording.${ext}`)

    const res = await fetch(TRANSCRIBE_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
    })

    if (!res.ok) {
        throw new Error(`Transcription failed (${res.status})`)
    }

    const data = await res.json()
    return (data.transcript as string) || ''
}
