export type SecondsLike = number | string | null | undefined

export function toSeconds(value: SecondsLike): number | null {
  if (value == null) return null
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null
    return value
  }

  const stringValue = String(value).trim().replace(',', '.')
  const match = stringValue.match(/-?\d+(\.\d+)?/)
  if (!match) return null
  const normalized = Number(match[0])
  if (!Number.isFinite(normalized)) return null
  return normalized
}

export function resolveAvgGenerationSeconds(stats?: Record<string, unknown> | null): number | null {
  if (!stats) return null
  const explicitKeys = [
    'avg_generation_time',
    'avg_generation_time_seconds',
    'average_generation_time_seconds',
    'average_generation_time',
    'avg_job_duration_seconds',
    'job_history_avg_generation_time_seconds',
  ]

  const dynamicKeys = Object.keys(stats).filter((key) => {
    const lower = key.toLowerCase()
    return (
      lower.includes('avg') &&
      (lower.includes('time') || lower.includes('duration')) &&
      !explicitKeys.includes(key)
    )
  })

  const candidates = [...explicitKeys, ...dynamicKeys]
  let fallback: number | null = null

  for (const key of candidates) {
    if (!(key in stats)) continue
    const value = toSeconds((stats as Record<string, SecondsLike>)[key])
    if (value == null) continue
    if (value > 0.5) return value
    if (fallback == null || value > fallback) fallback = value
  }

  return fallback
}

export function formatSeconds(rawValue: SecondsLike): string {
  const value = toSeconds(rawValue)
  if (value == null) return '—'
  if (value <= 0.0) return '<0.1s'
  if (value < 0.1) return '<0.1s'
  if (value < 1) return `${value.toFixed(2)}s`
  if (value < 10) return `${value.toFixed(1)}s`
  if (value < 60) return `${Math.round(value)}s`

  const minutes = Math.floor(value / 60)
  const seconds = Math.round(value % 60)

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) return `${hours}h`
    return `${hours}h ${remainingMinutes}m`
  }

  if (seconds === 0) return `${minutes}m`
  return `${minutes}m ${seconds}s`
}
