const DEFAULT_ORCHESTRATOR_URL = 'https://bot.radly.app'

export function getOrchestratorUrl(): string {
  const rawUrl =
    process.env.NEXT_PUBLIC_ORCHESTRATOR_URL ||
    process.env.VITE_ORCHESTRATOR_URL ||
    DEFAULT_ORCHESTRATOR_URL

  return rawUrl.replace(/\/+$/, '')
}
