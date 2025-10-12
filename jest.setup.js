import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Set up environment variables for tests
process.env.NEXT_PUBLIC_EDGE_BASE = 'https://test-edge.example.com'
process.env.NEXT_PUBLIC_PUBLIC_CLIENT_KEY = 'test-client-key'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-supabase.example.com'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

// Polyfills for Web Crypto API in Jest
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock crypto.subtle for testing
global.crypto = {
  subtle: {
    importKey: jest.fn().mockResolvedValue({}),
    sign: jest.fn().mockResolvedValue(new ArrayBuffer(32))
  }
}
