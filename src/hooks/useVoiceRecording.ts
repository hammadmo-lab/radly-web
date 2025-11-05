// Voice recording hook with WebSocket streaming

import { useState, useRef, useCallback, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '@/components/auth-provider';
import { createTranscriptionWebSocket, TranscriptionWebSocket } from '@/lib/websocket';
import { useIosPcmRecorder } from './useIosPcmRecorder';
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
  const chunkTimerRef = useRef<NodeJS.Timeout | null>(null);

  // iOS PCM recorder hook
  const iosRecorder = useIosPcmRecorder(options.onTranscript);

  // Check if we're on iOS
  const isIos = Capacitor.getPlatform() === 'ios';

  // Log platform detection on mount
  useEffect(() => {
    console.log('🔍 Platform detection:', {
      platform: Capacitor.getPlatform(),
      isNative: Capacitor.isNativePlatform(),
      isIos,
    });
  }, [isIos]);

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

  const startChunkTimer = useCallback(() => {
    // Periodically request data from MediaRecorder to ensure chunks are sent
    // even if the browser is buffering them. We do this LESS frequently than
    // the timeslice (every 1000ms vs 250ms) to avoid forcing empty chunks.
    chunkTimerRef.current = setInterval(() => {
      if (mediaRecorderRef.current?.state === 'recording') {
        console.log('⏰ Forcing MediaRecorder to flush buffered data');
        mediaRecorderRef.current.requestData();
      }
    }, 1000); // Request data every 1000ms (less frequent than timeslice)
  }, []);

  const stopChunkTimer = useCallback(() => {
    if (chunkTimerRef.current) {
      clearInterval(chunkTimerRef.current);
      chunkTimerRef.current = null;
    }
  }, []);

  const handleError = useCallback(
    (err: Error | string) => {
      const errorMessage = typeof err === 'string' ? err : err.message;
      setError(errorMessage);
      setState('error');
      stopChunkTimer(); // Ensure chunk timer is stopped on error

      if (options.onError) {
        options.onError(typeof err === 'string' ? new Error(err) : err);
      }

      stopRecording();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options, stopChunkTimer]
  );

  const handleWebSocketMessage = useCallback(
    (message: WebSocketMessage) => {
      console.log('📨 Received WebSocket message:', message.type, message);
      switch (message.type) {
        case 'connection_established':
          console.log('✅ Connection established, tier:', message.tier, 'max duration:', message.max_duration_seconds);
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
    console.log('🎙️ [useVoiceRecording] startRecording called');
    console.log('🎙️ [useVoiceRecording] Platform check:', {
      isIos,
      platform: Capacitor.getPlatform(),
      isNative: Capacitor.isNativePlatform(),
      hasSession: !!session?.access_token,
    });

    try {
      // Check authentication
      if (!session?.access_token) {
        throw new Error('Authentication required');
      }

      // Reset state
      setError(null);
      setTranscript('');
      setInterimTranscript('');
      setDuration(0);
      setState('connecting');

      // Use iOS PCM approach for iOS devices
      if (isIos) {
        console.log('📱 [useVoiceRecording] Using iOS PCM audio worklet approach');
        console.log('📱 [useVoiceRecording] API base:', apiBase);

        // Build backend WebSocket URL for iOS
        // iOS will send PCM data as binary to backend, backend routes to Deepgram
        const wsProtocol = apiBase.startsWith('https') ? 'wss' : 'ws';
        const wsBaseUrl = apiBase.replace(/^https?:\/\//, '');
        const wsUrl = `${wsProtocol}://${wsBaseUrl}/v1/transcribe/stream`;
        const wsUrlWithToken = (() => {
          try {
            const url = new URL(wsUrl);
            url.searchParams.set('token', session.access_token);
            return url.toString();
          } catch {
            console.warn('⚠️ [useVoiceRecording] Failed to construct URL object, falling back to query concat');
            const separator = wsUrl.includes('?') ? '&' : '?';
            return `${wsUrl}${separator}token=${encodeURIComponent(session.access_token)}`;
          }
        })();

        console.log('📱 [useVoiceRecording] Connecting to backend WebSocket:', wsUrlWithToken);

        // Start iOS PCM recorder with backend WebSocket URL and auth token
        await iosRecorder.start(wsUrlWithToken, session.access_token);

        // For iOS, set max duration manually since we're not getting it from backend
        setMaxDuration(300); // 5 minutes default
        setState('recording');
        startDurationTimer();
        console.log('✅ [useVoiceRecording] iOS recording started successfully');

      } else {
        console.log('🌐 Using web MediaRecorder API');

        // Check browser support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Browser does not support audio recording');
        }

        if (!window.MediaRecorder) {
          throw new Error('Browser does not support MediaRecorder');
        }

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

        // Verify audio tracks
        const audioTracks = stream.getAudioTracks();
        console.log('🎤 Audio tracks:', {
          count: audioTracks.length,
          enabled: audioTracks[0]?.enabled,
          muted: audioTracks[0]?.muted,
          readyState: audioTracks[0]?.readyState,
          label: audioTracks[0]?.label,
          settings: audioTracks[0]?.getSettings(),
        });

        if (audioTracks.length === 0) {
          throw new Error('No audio tracks found in media stream');
        }

        if (!audioTracks[0]?.enabled || audioTracks[0]?.readyState !== 'live') {
          throw new Error('Audio track is not enabled or not live');
        }

        // Determine MIME type
        let mimeType = 'audio/webm';
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
          mimeType = 'audio/ogg;codecs=opus';
        }

        console.log('🎙️ Selected MIME type:', mimeType, 'Supported:', MediaRecorder.isTypeSupported(mimeType));

        // Create MediaRecorder but don't start yet
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType,
        });

        console.log('📼 MediaRecorder created:', {
          state: mediaRecorder.state,
          mimeType: mediaRecorder.mimeType,
          audioBitsPerSecond: mediaRecorder.audioBitsPerSecond,
        });

        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          const blobSize = event.data.size;
          const blobType = event.data.type;

          console.log('🎵 Audio chunk available:', {
            size: blobSize,
            type: blobType,
            isEmpty: blobSize === 0,
            recorderState: mediaRecorderRef.current?.state,
            wsOpen: wsRef.current?.isOpen,
            wsConnecting: wsRef.current?.isConnecting,
            wsClosed: wsRef.current?.isClosed,
          });

          // Send all chunks, even empty ones, to keep Deepgram connection alive
          const ws = wsRef.current;
          const recorderState = mediaRecorderRef.current?.state;

          if (!ws || !ws.isOpen) {
            if (recorderState === 'recording') {
              console.error('❌ Cannot send audio: WebSocket is not open', {
                wsExists: !!ws,
                wsOpen: ws?.isOpen,
                wsConnecting: ws?.isConnecting,
                wsClosed: ws?.isClosed,
              });
            } else {
              console.log('ℹ️ Skipping audio chunk because recording has stopped');
            }
            return;
          }

          if (ws.isOpen) {
            if (blobSize > 0) {
              console.log('📤 Sending audio chunk to WebSocket:', blobSize, 'bytes');
              ws.send(event.data);
              console.log('✅ Audio chunk sent successfully');
            } else {
              console.log('⏭️ Skipping empty audio chunk (0 bytes)');
            }
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
            },
            onMessage: (message) => {
              handleWebSocketMessage(message);

              // Start recording only after receiving connection_established
              if (message.type === 'connection_established') {
                console.log('🎤 Attempting to start MediaRecorder...', {
                  recorderExists: !!mediaRecorderRef.current,
                  recorderState: mediaRecorderRef.current?.state,
                });
                if (mediaRecorderRef.current?.state === 'inactive') {
                  console.log('🎙️ Starting MediaRecorder with 250ms timeslice...');
                  mediaRecorderRef.current.start(250);
                  console.log('✅ MediaRecorder.start(250) called, state:', mediaRecorderRef.current?.state);
                  startChunkTimer();
                  console.log('✅ Chunk timer started (1000ms interval) as backup');
                } else {
                  console.error('❌ Cannot start MediaRecorder, state:', mediaRecorderRef.current?.state);
                }
              }
            },
            onError: (err) => {
              handleError(err);
            },
            onClose: (code, reason) => {
              if (code === 1008) {
                handleError(reason || 'Access denied. Please check your subscription plan.');
              } else if (code !== 1000 && state === 'recording') {
                handleError('Connection lost');
              }
            },
            reconnect: false,
          }
        );

        wsRef.current = ws;
        ws.connect();
      }
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
  }, [session, apiBase, state, handleWebSocketMessage, handleError, startChunkTimer, startDurationTimer, isIos, iosRecorder]);

  const stopRecording = useCallback(() => {
    console.log('🛑 [useVoiceRecording] stopRecording called, isIos:', isIos, 'iosRecorder.isRecording:', iosRecorder.isRecording);

    stopDurationTimer();
    stopChunkTimer();

    // Stop iOS PCM recorder if active
    if (isIos && iosRecorder.isRecording) {
      console.log('📱 [useVoiceRecording] Stopping iOS PCM audio recording');
      iosRecorder.stop();
    } else {
      console.log('🌐 [useVoiceRecording] Stopping web MediaRecorder');
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
    }

    // Update state
    if (state !== 'error') {
      setState('idle');
    }

    mediaRecorderRef.current = null;
    console.log('✅ [useVoiceRecording] Recording stopped');
  }, [state, stopDurationTimer, stopChunkTimer, isIos, iosRecorder]);

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
    isRecording: isIos ? iosRecorder.isRecording : state === 'recording',
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
