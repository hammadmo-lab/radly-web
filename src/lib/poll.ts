export type PollResult<T> = { result?: T; aborted?: boolean; timedOut?: boolean }

export async function pollUntil<T>(
  fn: () => Promise<T>,
  isDone: (v: T) => boolean,
  { intervalMs = 2500, maxMs = 120000, signal }: { intervalMs?: number; maxMs?: number; signal?: AbortSignal } = {}
): Promise<PollResult<T>> {
  const start = Date.now()
  let delay = intervalMs
  while (true) {
    if (signal?.aborted) return { aborted: true }
    const v = await fn()
    if (isDone(v)) return { result: v }
    if (Date.now() - start > maxMs) return { result: v, timedOut: true }
    await new Promise(r => setTimeout(r, delay))
    delay = Math.min(delay + 500, 5000)
  }
}
