// Voice Input Component for dictation
// Fixed: React error #185 - ref forwarding issues resolved

'use client';

import { useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SubscriptionTier } from '@/types/transcription';

export interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onError?: (error: string) => void;
  onUpgradeRequired?: (tier: SubscriptionTier) => void;
  disabled?: boolean;
  className?: string;
}

export function VoiceInput({
  onTranscript,
  onError,
  onUpgradeRequired,
  disabled = false,
  className,
}: VoiceInputProps) {
  const {
    state,
    interimTranscript,
    error,
    isRecording,
    duration,
    maxDuration,
    timeRemaining,
    tier,
    startRecording,
    stopRecording,
    clearError,
  } = useVoiceRecording({
    onTranscript: (text, isFinal) => {
      if (isFinal) {
        const invoke = () => onTranscript(text);
        if (typeof queueMicrotask === 'function') {
          queueMicrotask(invoke);
        } else {
          Promise.resolve().then(invoke);
        }
      }
    },
    onError: (err) => {
      if (onError) {
        onError(err.message);
      }
    },
    onLimitReached: (message) => {
      if (onError) {
        onError(message);
      }
    },
  });

  // Handle errors
  useEffect(() => {
    if (error) {
      if (onError) {
        onError(error);
      }

      // Check if it's a tier restriction error
      if (
        error.includes('Starter tier') ||
        error.includes('trial') ||
        error.includes('upgrade')
      ) {
        if (onUpgradeRequired && tier) {
          onUpgradeRequired(tier);
        }
      }
    }
  }, [error, tier, onError, onUpgradeRequired]);

  const handleClick = () => {
    if (error) {
      clearError();
      return;
    }

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getButtonColor = () => {
    if (error) return 'destructive';
    if (isRecording) return 'default';
    return 'outline';
  };

  const getIcon = () => {
    if (state === 'connecting' || state === 'processing') {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    if (error) {
      return <MicOff className="h-4 w-4" />;
    }
    return <Mic className="h-4 w-4" />;
  };

  const getTooltip = () => {
    if (error) return 'Click to retry';
    if (isRecording) return 'Stop recording';
    if (state === 'connecting') return 'Connecting...';
    return 'Start voice dictation';
  };

  // Show warning when time is running low
  const isWarning = isRecording && timeRemaining <= 30 && timeRemaining > 0;
  const isDanger = isRecording && timeRemaining <= 10 && timeRemaining > 0;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={getButtonColor()}
          size="sm"
          onClick={handleClick}
          disabled={disabled || state === 'connecting' || state === 'processing'}
          title={getTooltip()}
          className={cn(
            'relative',
            isRecording && 'animate-pulse',
            error && 'border-destructive'
          )}
        >
          {getIcon()}
          <span className="ml-2">
            {error ? 'Retry' : isRecording ? 'Stop' : 'Voice Dictation'}
          </span>

          {/* Recording indicator */}
          {isRecording && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </Button>

        {/* Timer display */}
        {isRecording && (
          <div
            className={cn(
              'flex items-center gap-2 text-sm font-mono',
              isDanger && 'text-destructive font-bold',
              isWarning && !isDanger && 'text-yellow-600 dark:text-yellow-500'
            )}
          >
            <span>{formatTime(duration)}</span>
            <span className="text-muted-foreground">/</span>
            <span className={cn(isDanger && 'animate-pulse')}>{formatTime(maxDuration)}</span>
          </div>
        )}
      </div>

      {/* Interim transcript preview */}
      {(isRecording || state === 'connecting') && (
        <div className="flex items-start gap-2 text-sm min-h-[2rem]">
          {state === 'connecting' ? (
            <div className="text-muted-foreground italic">Connecting to transcription service...</div>
          ) : interimTranscript ? (
            <div className="text-muted-foreground italic border-l-2 border-primary pl-2">
              {interimTranscript}
            </div>
          ) : (
            <div className="text-muted-foreground italic">Listening...</div>
          )}
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-2">
          {error}
        </div>
      )}

      {/* Keyboard shortcut hint */}
      {!isRecording && !error && (
        <div className="text-xs text-muted-foreground">
          Tip: Press{' '}
          <kbd className="px-1 py-0.5 text-xs font-semibold border border-border rounded">
            Ctrl+Shift+V
          </kbd>{' '}
          to start/stop
        </div>
      )}
    </div>
  );
}
