import { getSupabaseClient } from './supabase';

export async function authedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
) {
  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  return fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'X-App-Client': 'radly-frontend',
    },
    credentials: 'omit',
  });
}
