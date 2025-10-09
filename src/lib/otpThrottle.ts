export function getRemaining(email: string, windowSec = 60) {
  const k = `radly:lastOtp:${email.toLowerCase().trim()}`
  const last = parseInt(localStorage.getItem(k) || '0', 10)
  const now = Date.now()
  const remaining = Math.max(0, Math.ceil((last + windowSec * 1000 - now) / 1000))
  return { key: k, remaining }
}

export function markSent(key: string) {
  localStorage.setItem(key, String(Date.now()))
}
