// Voice recording hook with WebSocket streaming

import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { createTranscriptionWebSocket, TranscriptionWebSocket } from '@/lib/websocket';
import type {
  RecordingState,
  WebSocketMessage,
  SubscriptionTier,
} from '@/types/transcription';

export interface UseVoiceRecordingOptions {
  onTranscript?: (text: string, isFinal: boolean) => void;
  onError?: (error: Error) => void;
  onLimitReached?: (message: string) => void;
  apiBase?: string;
}

export interface UseVoiceRecordingReturn {
  // State
  state: RecordingState;
  transcript: string;
  interimTranscript: string;
  error: string | null;

  // Recording info
  isRecording: boolean;
  duration: number;
  maxDuration: number;
  timeRemaining: number;
  tier: SubscriptionTier | null;

  // Actions
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  clearTranscript: () => void;
  clearError: () => void;
}

export function useVoiceRecording(
  options: UseVoiceRecordingOptions = {}
): UseVoiceRecordingReturn {
  const { session } = useAuth();
  const [state, setState] = useState<RecordingState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [maxDuration, setMaxDuration] = useState(0);
  const [tier, setTier] = useState<SubscriptionTier | null>(null);

  const wsRef = useRef<TranscriptionWebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Get API base URL from environment or use default
  const apiBase = options.apiBase || process.env.NEXT_PUBLIC_API_BASE || 'http://localhost';

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startDurationTimer = useCallback(() => {
    setDuration(0);
    durationTimerRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopDurationTimer = useCallback(() => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
  }, []);

  const handleError = useCallback(
    (err: Error | string) => {
      const errorMessage = typeof err === 'string' ? err : err.message;
      setError(errorMessage);
      setState('error');

      if (options.onError) {
        options.onError(typeof err === 'string' ? new Error(err) : err);
      }

      stopRecording();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options]
  );

  const handleWebSocketMessage = useCallback(
    (message: WebSocketMessage) => {
      switch (message.type) {
        case 'connection_established':
          setTier(message.tier);
          setMaxDuration(message.max_duration_seconds);
          setState('recording');
          startDurationTimer();
          break;

        case 'transcript':
          if (message.is_final) {
            setTranscript((prev) => {
              const newText = prev + (prev ? ' ' : '') + message.transcript;
              if (options.onTranscript) {
                options.onTranscript(message.transcript, true);
              }
              return newText;
            });
            setInterimTranscript('');
          } else {
            setInterimTranscript(message.transcript);
            if (options.onTranscript) {
              options.onTranscript(message.transcript, false);
            }
          }
          break;

        case 'duration_limit_reached':
          if (options.onLimitReached) {
            options.onLimitReached(message.message);
          }
          handleError(message.message);
          break;

        case 'error':
          handleError(message.message);
          break;
      }
    },
    [options, startDurationTimer, handleError]
  );

  const startRecording = useCallback(async () => {
    try {
      // Check authentication
      if (!session?.access_token) {
        throw new Error('Authentication required');
      }

      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser does not support audio recording');
      }

      if (!window.MediaRecorder) {
        throw new Error('Browser does not support MediaRecorder');
      }

      // Reset state
      setError(null);
      setTranscript('');
      setInterimTranscript('');
      setDuration(0);
      setState('connecting');

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      mediaStreamRef.current = stream;

      // Determine MIME type
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus';
      }

      // Create MediaRecorder but don't start yet
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && wsRef.current?.isOpen) {
          console.log('📤 Sending audio chunk:', event.data.size, 'bytes');
          wsRef.current.send(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('❌ MediaRecorder error:', event);
        handleError('Recording error occurred');
      };

      // Create WebSocket connection
      const ws = createTranscriptionWebSocket(
        apiBase,
        session.access_token,
        {
          onOpen: () => {
            console.log('🔌 WebSocket opened, waiting for connection_established...');
            // Connection established, waiting for connection_established message
          },
          onMessage: (message) => {
            handleWebSocketMessage(message);

            // Start recording only after receiving connection_established
            if (message.type === 'connection_established' && mediaRecorderRef.current?.state === 'inactive') {
              console.log('🎤 Starting MediaRecorder...');
              mediaRecorderRef.current.start(250); // Send chunks every 250ms
            }
          },
          onError: (err) => {
            handleError(err);
          },
          onClose: (code, reason) => {
            if (code === 1008) {
              // Authentication or access denied
              handleError(reason || 'Access denied. Please check your subscription plan.');
            } else if (code !== 1000 && state === 'recording') {
              // Unexpected close
              handleError('Connection lost');
            }
          },
          reconnect: false, // Don't auto-reconnect during recording
        }
      );

      wsRef.current = ws;
      ws.connect();
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          handleError('Microphone permission denied. Please allow microphone access.');
        } else if (err.name === 'NotFoundError') {
          handleError('No microphone found. Please connect a microphone.');
        } else {
          handleError(err);
        }
      } else {
        handleError('Failed to start recording');
      }
    }
  }, [session, apiBase, state, handleWebSocketMessage, handleError]);

  const stopRecording = useCallback(() => {
    stopDurationTimer();

    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Update state
    if (state !== 'error') {
      setState('idle');
    }

    mediaRecorderRef.current = null;
  }, [state, stopDurationTimer]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    if (state === 'error') {
      setState('idle');
    }
  }, [state]);

  const timeRemaining = maxDuration - duration;

  return {
    // State
    state,
    transcript,
    interimTranscript,
    error,

    // Recording info
    isRecording: state === 'recording',
    duration,
    maxDuration,
    timeRemaining,
    tier,

    // Actions
    startRecording,
    stopRecording,
    clearTranscript,
    clearError,
  };
}
