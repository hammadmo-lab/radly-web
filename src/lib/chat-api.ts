// REST API calls for chat-related features (template upload/remove)
// These go to bot.radly.app, not to the main API

import { getAuthToken } from '@/lib/chat-auth'

const BOT_API_BASE = 'https://bot.radly.app/api/webapp'

// ─── Types ──────────────────────────────────────────────────────────

export interface TemplateUploadResult {
    id: string
    name: string
    found_placeholders: string[]
}

export interface TemplateUploadError {
    error: string
    missing?: string[]
    found?: string[]
}

// ─── Template Upload ────────────────────────────────────────────────

export async function uploadTemplate(file: File): Promise<TemplateUploadResult> {
    const token = await getAuthToken()
    if (!token) throw new Error('Not authenticated')

    const res = await fetch(`${BOT_API_BASE}/upload-template`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/octet-stream',
            'X-Filename': file.name,
        },
        body: file,
    })

    if (!res.ok) {
        const err: TemplateUploadError = await res.json().catch(() => ({ error: `Upload failed (${res.status})` }))
        throw err
    }

    return res.json() as Promise<TemplateUploadResult>
}

// ─── Template Remove ────────────────────────────────────────────────

export async function removeTemplate(): Promise<void> {
    const token = await getAuthToken()
    if (!token) throw new Error('Not authenticated')

    const res = await fetch(`${BOT_API_BASE}/template`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `Delete failed (${res.status})` }))
        throw err
    }
}
