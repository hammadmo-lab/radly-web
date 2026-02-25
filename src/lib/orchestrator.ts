const DEFAULT_ORCHESTRATOR_URL = 'https://bot.radly.app'

export function getOrchestratorUrl(): string {
  const rawUrl =
    process.env.NEXT_PUBLIC_ORCHESTRATOR_URL ||
    process.env.VITE_ORCHESTRATOR_URL ||
    DEFAULT_ORCHESTRATOR_URL

  const trimmed = rawUrl.trim()
  const withProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed)
    ? trimmed
    : `https://${trimmed}`

  try {
    const parsed = new URL(withProtocol)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return DEFAULT_ORCHESTRATOR_URL
    }
    return `${parsed.origin}${parsed.pathname}`.replace(/\/+$/, '')
  } catch {
    return DEFAULT_ORCHESTRATOR_URL
  }
}

export function getTelegramConfirmUrl(): string {
  return new URL('/telegram/link/confirm', `${getOrchestratorUrl()}/`).toString()
}
