import '@testing-library/jest-dom'

// Set up environment variables for tests
process.env.NEXT_PUBLIC_EDGE_BASE = 'https://test-edge.example.com'
process.env.NEXT_PUBLIC_PUBLIC_CLIENT_KEY = 'test-client-key'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-supabase.example.com'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
