"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

// A simple in-memory cache to handle synchronous access
const memoryCache: Record<string, string> = {};

// A tiny Capacitor Preferences adapter that matches Supabase's expected interface
const CapacitorStorageAdapter = {
  getItem: (key: string): string | null => {
    // Return from memory cache first (synchronous)
    if (memoryCache[key] !== undefined) {
      return memoryCache[key];
    }
    // Return null if not in cache (async operation would be handled elsewhere)
    return null;
  },
  setItem: (key: string, value: string): void => {
    // Store in memory cache immediately (synchronous)
    memoryCache[key] = value;
    // Then persist to Capacitor Preferences asynchronously
    Preferences.set({ key, value }).catch(error => {
      console.error('Failed to store in Preferences:', error);
    });
  },
  removeItem: (key: string): void => {
    // Remove from memory cache immediately (synchronous)
    delete memoryCache[key];
    // Then remove from Capacitor Preferences asynchronously
    Preferences.remove({ key }).catch(error => {
      console.error('Failed to remove from Preferences:', error);
    });
  },
};

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // On native iOS or Android, use Capacitor Preferences. On web, allow default localStorage.
  const isNative = Capacitor.isNativePlatform();

  console.log('🍎 Creating Supabase client - Native platform:', isNative);

  client = createClient(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storage: isNative ? CapacitorStorageAdapter : undefined,
      // Use a stable, custom key that we control
      storageKey: "radly.auth",
    },
  });

  // Initialize memory cache from Capacitor Preferences if on native platform
  if (isNative) {
    initializeMemoryCache();
  }

  return client;
}

// Initialize memory cache from Capacitor Preferences
async function initializeMemoryCache() {
  try {
    const { value } = await Preferences.get({ key: "radly.auth" });
    if (value) {
      console.log('🍎 Loading session from Capacitor Preferences into memory cache');
      memoryCache["radly.auth"] = value;
    }
  } catch (error) {
    console.error('🍎 Failed to initialize memory cache from Preferences:', error);
  }
}