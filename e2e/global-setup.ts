import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Set up test environment variables
  process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test-supabase.example.com';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key';
  process.env.NEXT_PUBLIC_API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';
  process.env.NEXT_PUBLIC_RADLY_CLIENT_KEY = process.env.NEXT_PUBLIC_RADLY_CLIENT_KEY || 'test-client-key';
  process.env.NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  process.env.NEXT_PUBLIC_EDGE_BASE = process.env.NEXT_PUBLIC_EDGE_BASE || 'https://edge.radly.app';
  process.env.NEXT_PUBLIC_ALLOW_MAGIC_LINK = process.env.NEXT_PUBLIC_ALLOW_MAGIC_LINK || '1';
  process.env.NEXT_PUBLIC_ALLOW_GOOGLE = process.env.NEXT_PUBLIC_ALLOW_GOOGLE || '0';
  process.env.NEXT_PUBLIC_ALLOW_APPLE = process.env.NEXT_PUBLIC_ALLOW_APPLE || '0';
  process.env.NEXT_PUBLIC_APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Radly';

  console.log('✅ Global setup completed - Environment variables configured');
}

export default globalSetup;
