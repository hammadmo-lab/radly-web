import { NextResponse } from 'next/server'

export async function GET() {
  // Mock LLM metrics data for testing
  // In production, this would connect to your actual metrics system (Prometheus, database, etc.)
  
  const mockData = {
    by_rate: [
      { provider: 'openai', model: 'gpt-4', value: Math.floor(Math.random() * 200) + 50 },
      { provider: 'openai', model: 'gpt-3.5-turbo', value: Math.floor(Math.random() * 300) + 100 },
      { provider: 'anthropic', model: 'claude-3', value: Math.floor(Math.random() * 150) + 30 },
      { provider: 'google', model: 'gemini-pro', value: Math.floor(Math.random() * 100) + 20 },
    ],
    by_tokens: [
      { provider: 'openai', model: 'gpt-4', value: Math.floor(Math.random() * 100000) + 50000 },
      { provider: 'openai', model: 'gpt-3.5-turbo', value: Math.floor(Math.random() * 150000) + 80000 },
      { provider: 'anthropic', model: 'claude-3', value: Math.floor(Math.random() * 80000) + 40000 },
      { provider: 'google', model: 'gemini-pro', value: Math.floor(Math.random() * 60000) + 30000 },
    ],
    by_errors: [
      { provider: 'openai', model: 'gpt-4', value: Math.floor(Math.random() * 5) },
      { provider: 'openai', model: 'gpt-3.5-turbo', value: Math.floor(Math.random() * 3) },
      { provider: 'anthropic', model: 'claude-3', value: Math.floor(Math.random() * 2) },
      { provider: 'google', model: 'gemini-pro', value: Math.floor(Math.random() * 4) },
    ]
  }

  // Add some randomness to make the data look dynamic
  mockData.by_rate.forEach(item => {
    item.value += Math.floor(Math.random() * 20) - 10
    if (item.value < 0) item.value = 0
  })
  
  mockData.by_tokens.forEach(item => {
    item.value += Math.floor(Math.random() * 10000) - 5000
    if (item.value < 0) item.value = 0
  })

  return NextResponse.json(mockData)
}
