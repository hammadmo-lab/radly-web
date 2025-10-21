// Transcription API types

export type SubscriptionTier = 'free' | 'starter' | 'professional' | 'premium';

export interface TranscriptionResponse {
  text: string;
  confidence: number;
  duration_seconds: number;
  words: number;
}

export interface TranscriptionErrorDetail {
  error: string;
  message: string;
  tier?: SubscriptionTier;
  upgrade_required?: boolean;
  used?: number;
  limit?: number;
  reset_in_hours?: number;
  size_mb?: number;
  received?: string;
}

export interface TranscriptionLimits {
  used: number;
  remaining: number;
  limit: number;
  tier: SubscriptionTier;
}

// WebSocket message types
export type WebSocketMessageType =
  | 'connection_established'
  | 'transcript'
  | 'duration_limit_reached'
  | 'error';

export interface ConnectionEstablishedMessage {
  type: 'connection_established';
  tier: SubscriptionTier;
  max_duration_seconds: number;
  message: string;
}

export interface TranscriptMessage {
  type: 'transcript';
  transcript: string;
  is_final: boolean;
  confidence: number;
}

export interface DurationLimitReachedMessage {
  type: 'duration_limit_reached';
  message: string;
  duration_seconds: number;
}

export interface ErrorMessage {
  type: 'error';
  message: string;
}

export type WebSocketMessage =
  | ConnectionEstablishedMessage
  | TranscriptMessage
  | DurationLimitReachedMessage
  | ErrorMessage;

// Recording states
export type RecordingState = 'idle' | 'connecting' | 'recording' | 'processing' | 'error';

// Supported audio formats
export const SUPPORTED_AUDIO_FORMATS = [
  '.mp3',
  '.wav',
  '.webm',
  '.ogg',
  '.m4a',
  '.flac',
] as const;

export type AudioFormat = (typeof SUPPORTED_AUDIO_FORMATS)[number];

// Tier configuration
export interface TierConfig {
  maxDuration: number; // seconds
  dailyLimit: number;
  maxConcurrentStreams: number;
  hasAccess: boolean;
  isTrial?: boolean;
  trialLimit?: number;
}

export const TIER_CONFIGS: Record<SubscriptionTier, TierConfig> = {
  free: {
    maxDuration: 60, // 1 minute
    dailyLimit: 0,
    maxConcurrentStreams: 3,
    hasAccess: true,
    isTrial: true,
    trialLimit: 3,
  },
  starter: {
    maxDuration: 0,
    dailyLimit: 0,
    maxConcurrentStreams: 0,
    hasAccess: false,
  },
  professional: {
    maxDuration: 180, // 3 minutes
    dailyLimit: 100,
    maxConcurrentStreams: 10,
    hasAccess: true,
  },
  premium: {
    maxDuration: 300, // 5 minutes
    dailyLimit: 300,
    maxConcurrentStreams: 15,
    hasAccess: true,
  },
};
