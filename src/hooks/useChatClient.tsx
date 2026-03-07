'use client'

// Chat client React Context and hook
// Manages WebSocket lifecycle, messages, and chat panel state

import {
    createContext,
    useContext,
    useCallback,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from 'react'
import { ChatWebSocket } from '@/lib/chat-websocket'
import { useAuth } from '@/components/auth-provider'
import type {
    ChatMessage,
    ChatConnectionStatus,
    ChatSubscriptionError,
    SessionState,
    UiHint,
} from '@/types/chat'

// ─── Context Type ─────────────────────────────────────────────────────

interface ChatContextType {
    // State
    messages: ChatMessage[]
    connectionStatus: ChatConnectionStatus
    sessionState: SessionState
    isTyping: boolean
    isPanelOpen: boolean
    subscriptionError: ChatSubscriptionError | null
    latestUiHint: UiHint | null

    // Actions
    sendText: (text: string) => void
    sendCommand: (command: 'report' | 'ask' | 'cancel' | 'stats' | 'status' | 'remove_template') => void
    togglePanel: () => void
    openPanel: () => void
    closePanel: () => void
    clearSubscriptionError: () => void
    dismissButtonHint: (messageId: string) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

// ─── Provider ─────────────────────────────────────────────────────────

export function ChatProvider({ children }: { children: ReactNode }) {
    const { session } = useAuth()
    const accessToken = session?.access_token ?? null

    // State
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [connectionStatus, setConnectionStatus] = useState<ChatConnectionStatus>('disconnected')
    const [sessionState, setSessionState] = useState<SessionState>('idle')
    const [isTyping, setIsTyping] = useState(false)
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const [subscriptionError, setSubscriptionError] = useState<ChatSubscriptionError | null>(null)
    const [latestUiHint, setLatestUiHint] = useState<UiHint | null>(null)

    // Refs
    const wsRef = useRef<ChatWebSocket | null>(null)
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // ─── Helper: generate message ID ──────────────────────────────────

    const createMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    // ─── Helper: add bot message ──────────────────────────────────────

    const addBotMessage = useCallback((text: string, ui?: UiHint) => {
        const msg: ChatMessage = {
            id: createMessageId(),
            role: 'bot',
            text,
            ui,
            timestamp: Date.now(),
        }
        setMessages(prev => [...prev, msg])
        setIsTyping(false)
        if (ui) setLatestUiHint(ui)
    }, [])

    // ─── Helper: add user message ─────────────────────────────────────

    const addUserMessage = useCallback((text: string) => {
        const msg: ChatMessage = {
            id: createMessageId(),
            role: 'user',
            text,
            timestamp: Date.now(),
        }
        setMessages(prev => [...prev, msg])
    }, [])

    // ─── WebSocket lifecycle ──────────────────────────────────────────

    useEffect(() => {
        // Only connect when panel is open and we have a token
        if (!isPanelOpen || !accessToken) {
            return
        }

        const ws = new ChatWebSocket(accessToken, {
            onConnected: (state, _tier) => {
                setSessionState(state)
                setConnectionStatus('connected')
            },
            onMessage: (text, ui) => {
                addBotMessage(text, ui)
            },
            onTyping: () => {
                setIsTyping(true)
                // Clear typing after 10s as a safety net
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
                typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 10_000)
            },
            onError: (message) => {
                addBotMessage(`⚠️ ${message}`)
            },
            onSubscriptionError: (error) => {
                setSubscriptionError(error)
                setConnectionStatus('error')
            },
            onConnectionChange: (connected) => {
                if (connected) {
                    setConnectionStatus('connected')
                } else {
                    setConnectionStatus(prev =>
                        prev === 'connected' ? 'reconnecting' : 'connecting'
                    )
                }
            },
        })

        ws.connect()
        wsRef.current = ws

        return () => {
            ws.disconnect()
            wsRef.current = null
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        }
    }, [isPanelOpen, accessToken, addBotMessage])

    // ─── Actions ──────────────────────────────────────────────────────

    // Map slash commands typed in the input to proper command messages
    type CommandType = 'report' | 'ask' | 'cancel' | 'stats' | 'status' | 'remove_template'
    const SLASH_COMMANDS: Record<string, CommandType> = {
        '/report': 'report',
        '/ask': 'ask',
        '/cancel': 'cancel',
        '/stats': 'stats',
        '/status': 'status',
        '/signature': 'report', // triggers onboarding flow
        'report': 'report',
        'ask': 'ask',
        'cancel': 'cancel',
        'stats': 'stats',
        'status': 'status',
    }

    const sendText = useCallback((text: string) => {
        const trimmed = text.trim()
        if (!trimmed) return

        // Check if the input is a slash command
        const command = SLASH_COMMANDS[trimmed.toLowerCase()]
        if (command) {
            addUserMessage(trimmed)
            wsRef.current?.send({ type: 'command', command })
            return
        }

        addUserMessage(trimmed)
        wsRef.current?.send({ type: 'text', text: trimmed })
    }, [addUserMessage])

    const sendCommand = useCallback((command: CommandType) => {
        wsRef.current?.send({ type: 'command', command })
    }, [])

    const togglePanel = useCallback(() => setIsPanelOpen(prev => !prev), [])
    const openPanel = useCallback(() => setIsPanelOpen(true), [])
    const closePanel = useCallback(() => setIsPanelOpen(false), [])
    const clearSubscriptionError = useCallback(() => setSubscriptionError(null), [])

    const dismissButtonHint = useCallback((messageId: string) => {
        setMessages(prev =>
            prev.map(m =>
                m.id === messageId ? { ...m, ui: { type: 'none' as const } } : m
            )
        )
    }, [])

    // ─── Context Value ────────────────────────────────────────────────

    const value: ChatContextType = {
        messages,
        connectionStatus,
        sessionState,
        isTyping,
        isPanelOpen,
        subscriptionError,
        latestUiHint,
        sendText,
        sendCommand,
        togglePanel,
        openPanel,
        closePanel,
        clearSubscriptionError,
        dismissButtonHint,
    }

    return <ChatContext.Provider value={value}> {children} </ChatContext.Provider>
}

// ─── Hook ─────────────────────────────────────────────────────────────

export function useChatClient() {
    const context = useContext(ChatContext)
    if (context === undefined) {
        throw new Error('useChatClient must be used within a ChatProvider')
    }
    return context
}
