import { getOrchestratorUrl, getTelegramConfirmUrl } from '@/lib/orchestrator'

const ORIGINAL_ENV = process.env

describe('orchestrator URL helpers', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV }
    delete process.env.NEXT_PUBLIC_ORCHESTRATOR_URL
    delete process.env.VITE_ORCHESTRATOR_URL
  })

  afterAll(() => {
    process.env = ORIGINAL_ENV
  })

  it('returns default URL when no env is configured', () => {
    expect(getOrchestratorUrl()).toBe('https://bot.radly.app')
  })

  it('trims whitespace and trailing slashes from configured URL', () => {
    process.env.NEXT_PUBLIC_ORCHESTRATOR_URL = '  https://bot.radly.app///  '
    expect(getOrchestratorUrl()).toBe('https://bot.radly.app')
  })

  it('accepts host-only values and normalizes them to https', () => {
    process.env.NEXT_PUBLIC_ORCHESTRATOR_URL = 'bot.radly.app'
    expect(getOrchestratorUrl()).toBe('https://bot.radly.app')
  })

  it('falls back to default URL when env value is malformed', () => {
    process.env.NEXT_PUBLIC_ORCHESTRATOR_URL = 'https:// bot.radly.app'
    expect(getOrchestratorUrl()).toBe('https://bot.radly.app')
  })

  it('builds a stable confirm endpoint URL', () => {
    process.env.NEXT_PUBLIC_ORCHESTRATOR_URL = 'https://bot.radly.app/'
    expect(getTelegramConfirmUrl()).toBe('https://bot.radly.app/telegram/link/confirm')
  })
})
