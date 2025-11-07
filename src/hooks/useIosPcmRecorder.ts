import { useCallback, useRef, useState } from 'react';
import { downsampleTo16k, createResampleState, ResampleState } from '@/lib/audio/resample';

type TranscriptHandler = (text: string, isFinal: boolean) => void;
type WebSocketMessage = {
  type: string;
  transcript?: string;
  is_final?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

async function loadAudioWorkletModule(ctx: AudioContext) {
  if (!ctx.audioWorklet) {
    throw new Error('AudioWorklet API is not available in this environment.');
  }

  const modulePath = '/pcm-worklet.js';

  // Try to register module directly first (works on Safari 17+ when served over https)
  try {
    await ctx.audioWorklet.addModule(modulePath);
    return;
  } catch (err) {
    console.warn('⚠️ [iOS PCM] Direct audio worklet load failed, trying blob fallback', err);
  }

  // Fallback: fetch script and register via blob URL, which works in Capacitor WKWebView contexts
  const response = await fetch(modulePath);
  if (!response.ok) {
    throw new Error(`Failed to fetch audio worklet module: ${response.status} ${response.statusText}`);
  }

  const scriptText = await response.text();
  const blob = new Blob([scriptText], { type: 'application/javascript' });
  const blobUrl = URL.createObjectURL(blob);

  try {
    await ctx.audioWorklet.addModule(blobUrl);
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

export function useIosPcmRecorder(onTranscript?: TranscriptHandler) {
  const [isRecording, setIsRecording] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const nodeRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const stRef = useRef<ResampleState>(createResampleState());

  const start = useCallback(async (wsUrl: string, _authToken: string) => {
    console.log('🎤 [iOS PCM] Starting recording with WebSocket URL:', wsUrl);

    try {
      console.log('🎤 [iOS PCM] Requesting microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      streamRef.current = stream;
      console.log('✅ [iOS PCM] Microphone permission granted, got MediaStream');

      const ctx = new AudioContext(); // often 48000 on iOS
      console.log('🎤 [iOS PCM] AudioContext created, sample rate:', ctx.sampleRate, 'state:', ctx.state);

      console.log('🎤 [iOS PCM] Loading AudioWorklet module...');
      await loadAudioWorkletModule(ctx);
      console.log('✅ [iOS PCM] AudioWorklet module loaded successfully');

      if (ctx.state === 'suspended') {
        console.log('🎤 [iOS PCM] AudioContext suspended, resuming...');
        await ctx.resume();
      }
      if (ctx.state !== 'running') {
        throw new Error('AudioContext failed to start, state: ' + ctx.state);
      }
      console.log('✅ [iOS PCM] AudioContext running');

      const src = ctx.createMediaStreamSource(stream);
      console.log('🎤 [iOS PCM] MediaStreamSource created');

      const node = new AudioWorkletNode(ctx, 'pcm-worklet');
      console.log('🎤 [iOS PCM] AudioWorkletNode created');

      const sink = new GainNode(ctx, { gain: 0 });
      node.connect(sink).connect(ctx.destination);
      src.connect(node);
      console.log('✅ [iOS PCM] Audio graph connected');

      // Connect to backend WebSocket (not directly to Deepgram)
      const resolvedWsUrl = (() => {
        if (_authToken && !wsUrl.includes('token=')) {
          try {
            const url = new URL(wsUrl);
            url.searchParams.set('token', _authToken);
            return url.toString();
          } catch {
            const separator = wsUrl.includes('?') ? '&' : '?';
            return `${wsUrl}${separator}token=${encodeURIComponent(_authToken)}`;
          }
        }
        return wsUrl;
      })();

      console.log('🌐 [iOS PCM] Connecting to backend WebSocket:', resolvedWsUrl);
      const ws = new WebSocket(resolvedWsUrl);
      ws.binaryType = 'arraybuffer';

      ws.onopen = () => {
        console.log('✅ [iOS PCM] WebSocket connected to backend');
      };

      ws.onmessage = (ev) => {
        try {
          console.log('📨 [iOS PCM] Received WebSocket message:', ev.data);
          const msg: WebSocketMessage = JSON.parse(ev.data);
          console.log('📨 [iOS PCM] Parsed message:', msg);
          // Handle backend WebSocket message format for transcription
          if (msg.type === 'transcript' && msg.transcript) {
            console.log('📝 [iOS PCM] Transcript received:', msg.transcript, 'is_final:', msg.is_final);
            onTranscript?.(msg.transcript, !!msg.is_final);
          }
        } catch (e) {
          console.error('❌ [iOS PCM] Error parsing WebSocket message:', e, 'data:', ev.data);
        }
      };

      ws.onerror = (err) => {
        console.error('❌ [iOS PCM] WebSocket error:', err);
      };

      ws.onclose = (ev) => {
        console.log('🔌 [iOS PCM] WebSocket closed, code:', ev.code, 'reason:', ev.reason);
      };

      node.port.onmessage = (ev: MessageEvent<Float32Array>) => {
        if (!ws || ws.readyState !== 1) {
          console.warn('⚠️ [iOS PCM] Cannot send audio, WebSocket not ready, state:', ws?.readyState);
          return;
        }
        const float32 = ev.data;
        const int16 = downsampleTo16k(float32, ctx.sampleRate, stRef.current);
        if (int16.length) {
          console.log('📤 [iOS PCM] Sending PCM chunk:', int16.length, 'samples (', int16.buffer.byteLength, 'bytes)');
          ws.send(int16.buffer);
        }
      };

      wsRef.current = ws;
      ctxRef.current = ctx;
      nodeRef.current = node;
      setIsRecording(true);
      console.log('✅ [iOS PCM] Recording started successfully');
    } catch (error) {
      console.error('❌ [iOS PCM] Failed to start recording:', error);
      throw error;
    }
  }, [onTranscript]);

  const stop = useCallback(() => {
    nodeRef.current?.port.postMessage('close');
    nodeRef.current?.disconnect();
    nodeRef.current = null;

    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;

    if (wsRef.current && wsRef.current.readyState <= 1) {
      wsRef.current.close(1000, 'User stopped recording');
    }
    wsRef.current = null;

    if (ctxRef.current?.state !== 'closed') ctxRef.current?.close();
    ctxRef.current = null;

    stRef.current = createResampleState();
    setIsRecording(false);
  }, []);

  return { isRecording, start, stop };
}
