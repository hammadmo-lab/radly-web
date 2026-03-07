// Chat WebSocket client for the Radly bot orchestrator
// Connects to wss://bot.radly.app/ws/chat — separate from TranscriptionWebSocket

import type {
    ClientMessage,
    ServerMessage,
    SessionState,
    UiHint,
    ChatSubscriptionError,
} from '@/types/chat'

// ─── Configuration ──────────────────────────────────────────────────

const CHAT_WS_URL = 'wss://bot.radly.app/ws/chat'
const MIN_RECONNECT_DELAY = 1000
const MAX_RECONNECT_DELAY = 30_000

export interface ChatWebSocketCallbacks {
    onConnected: (sessionState: SessionState, tier: string) => void
    onMessage: (text: string, ui: UiHint) => void
    onTyping: () => void
    onError: (message: string) => void
    onSubscriptionError: (error: ChatSubscriptionError) => void
    onConnectionChange: (connected: boolean) => void
}

// ─── ChatWebSocket Class ─────────────────────────────────────────────

export class ChatWebSocket {
    private ws: WebSocket | null = null
    private reconnectDelay = MIN_RECONNECT_DELAY
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null
    private accessToken: string
    private callbacks: ChatWebSocketCallbacks
    private isClosedManually = false

    constructor(accessToken: string, callbacks: ChatWebSocketCallbacks) {
        this.accessToken = accessToken
        this.callbacks = callbacks
    }

    connect(): void {
        if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
            return
        }

        this.isClosedManually = false
        this.clearReconnectTimer()

        try {
            const url = `${CHAT_WS_URL}?token=${encodeURIComponent(this.accessToken)}`
            this.ws = new WebSocket(url)

            this.ws.onopen = () => {
                this.reconnectDelay = MIN_RECONNECT_DELAY // reset backoff
                this.callbacks.onConnectionChange(true)
            }

            this.ws.onmessage = (event: MessageEvent) => {
                try {
                    const msg = JSON.parse(event.data as string) as ServerMessage

                    switch (msg.type) {
                        case 'ping':
                            // Respond to server keepalive
                            this.sendRaw({ type: 'ping' })
                            break
                        case 'pong':
                            // Server responded to our ping — no action needed
                            break
                        case 'connected':
                            this.callbacks.onConnected(msg.session_state, msg.quota.tier)
                            break
                        case 'message':
                            this.callbacks.onMessage(msg.text, msg.ui)
                            break
                        case 'typing':
                            this.callbacks.onTyping()
                            break
                        case 'error':
                            this.callbacks.onError(msg.message)
                            break
                    }
                } catch {
                    console.error('Failed to parse chat WebSocket message')
                }
            }

            this.ws.onclose = (event: CloseEvent) => {
                this.callbacks.onConnectionChange(false)

                if (event.code === 1008) {
                    // Auth or subscription error — do NOT reconnect
                    const reason = event.reason || ''
                    if (reason.toLowerCase().includes('subscription')) {
                        this.callbacks.onSubscriptionError({
                            type: 'subscription_required',
                            message: reason,
                        })
                    } else {
                        this.callbacks.onSubscriptionError({
                            type: 'unauthorized',
                            message: reason || 'Unauthorized',
                        })
                    }
                    return
                }

                // Don't reconnect if manually closed
                if (this.isClosedManually) return

                // Reconnect with exponential backoff
                this.reconnectTimer = setTimeout(() => {
                    this.connect()
                }, this.reconnectDelay)
                this.reconnectDelay = Math.min(this.reconnectDelay * 2, MAX_RECONNECT_DELAY)
            }

            this.ws.onerror = () => {
                // onclose will fire after onerror — reconnect handled there
            }
        } catch (error) {
            console.error('Failed to create chat WebSocket:', error)
            this.callbacks.onConnectionChange(false)
        }
    }

    send(message: ClientMessage): void {
        this.sendRaw(message)
    }

    disconnect(): void {
        this.isClosedManually = true
        this.clearReconnectTimer()
        if (this.ws) {
            this.ws.close()
            this.ws = null
        }
    }

    updateToken(newToken: string): void {
        this.accessToken = newToken
    }

    get isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN
    }

    // ─── Private ────────────────────────────────────────────────────────

    private sendRaw(data: unknown): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data))
        }
    }

    private clearReconnectTimer(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = null
        }
    }
}
