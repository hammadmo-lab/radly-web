// Chat WebSocket message protocol types
// Matches the bot orchestrator WebSocket API at wss://bot.radly.app/ws/chat

// ─── Client → Server ────────────────────────────────────────────────

export type ClientMessage =
    | { type: 'text'; text: string }
    | { type: 'command'; command: 'report' | 'ask' | 'cancel' | 'stats' | 'status' | 'remove_template' }
    | { type: 'ping' }

// ─── Server → Client ────────────────────────────────────────────────

export type ServerMessage =
    | { type: 'connected'; session_state: SessionState; quota: { tier: string } }
    | { type: 'message'; text: string; ui: UiHint }
    | { type: 'typing' }
    | { type: 'error'; message: string }
    | { type: 'ping' }
    | { type: 'pong' }

// ─── Session States ──────────────────────────────────────────────────

export type SessionState =
    | 'idle'
    | 'onboarding_signature'
    | 'exam_type'
    | 'template_confirm'
    | 'template_choose'
    | 'indication'
    | 'comparison'
    | 'findings'
    | 'findings_confirm'
    | 'findings_clarify'
    | 'findings_review'
    | 'patient_ask'
    | 'patient_collect'
    | 'review'
    | 'editing'
    | 'ask_mode'

// ─── UI Hints ────────────────────────────────────────────────────────

export type UiHint =
    | { type: 'none' }
    | { type: 'voice_prompt' }
    | { type: 'buttons'; options: Array<{ label: string; value: string }> }
    | {
        type: 'template_select'
        candidates: Array<{
            template_id: string
            title: string
            modality: string
        }>
    }
    | {
        type: 'report_card'
        report: {
            title: string
            findings: string
            impression: string
            recommendations?: string | null
        }
        docxUrl?: string
    }

// ─── Internal UI Types ──────────────────────────────────────────────

export interface ChatMessage {
    id: string
    role: 'bot' | 'user'
    text: string
    ui?: UiHint
    timestamp: number
}

export type ChatConnectionStatus =
    | 'disconnected'
    | 'connecting'
    | 'connected'
    | 'reconnecting'
    | 'error'

export interface ChatSubscriptionError {
    type: 'subscription_required' | 'unauthorized'
    message: string
}
