// WebSocket client utility for real-time transcription

import type { WebSocketMessage } from '@/types/transcription';

export interface WebSocketConfig {
  url: string;
  token: string;
  onMessage: (message: WebSocketMessage) => void;
  onError: (error: Error) => void;
  onClose: (code: number, reason: string) => void;
  onOpen: () => void;
  reconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
}

export class TranscriptionWebSocket {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isClosedManually = false;

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnect: true,
      maxReconnectAttempts: 3,
      reconnectDelay: 2000,
      ...config,
    };
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isClosedManually = false;

    try {
      // WebSocket URL must be provided via config
      if (!this.config.url || this.config.url.trim() === '') {
        throw new Error('WebSocket URL is required. Please provide a valid API base URL in configuration.');
      }

      const configured = this.config.url.trim();

      // Ensure the value parses as a URL, defaulting to https if protocol omitted
      const candidate = configured.match(/^https?:|^wss?:/)
        ? configured
        : `https://${configured}`;

      let urlBuilder: URL;
      try {
        urlBuilder = new URL(candidate);
      } catch {
        throw new Error(`Invalid WebSocket URL provided: ${configured}`);
      }

      // Upgrade protocol to websocket variants
      urlBuilder.protocol = urlBuilder.protocol === 'http:' ? 'ws:' : 'wss:';

      // Remove any trailing slash before appending path segment
      const basePath = urlBuilder.pathname.replace(/\/+$/, '');
      const normalizedBase = `${urlBuilder.origin}${basePath}`;

      const url = `${normalizedBase}/v1/transcribe/stream?token=${encodeURIComponent(this.config.token)}`;

      console.log('🔌 Connecting to WebSocket:', url);

      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.config.onOpen();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.config.onMessage(message);
        } catch {
          this.config.onError(new Error('Failed to parse WebSocket message'));
        }
      };

      this.ws.onerror = (event) => {
        // WebSocket errors are typically followed by onclose with more details
        // Log at warn level instead of error to reduce noise
        console.warn('⚠️ WebSocket error detected (details will be in close event):', {
          type: event.type,
          target: event.target instanceof WebSocket ? {
            readyState: event.target.readyState,
            url: event.target.url,
          } : 'unknown'
        });

        // Don't call onError here - wait for onclose which has more details
        // Only set a generic error if close doesn't happen
        setTimeout(() => {
          if (this.ws?.readyState === WebSocket.CLOSED) {
            this.config.onError(new Error('WebSocket connection error'));
          }
        }, 100);
      };

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket closed:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        });

        // Provide helpful error messages based on close code
        if (event.code === 1006) {
          console.error('❌ WebSocket failed to connect. This usually means:');
          console.error('   1. Backend WebSocket endpoint is not accepting connections');
          console.error('   2. CORS is blocking the WebSocket upgrade request');
          console.error('   3. Backend is returning an HTTP error during handshake');
          console.error('   4. SSL/TLS certificate issue');
        }

        this.config.onClose(event.code, event.reason);

        // Handle specific close codes
        if (event.code === 1008) {
          // Authentication error or access denied - don't reconnect
          this.isClosedManually = true;
          return;
        }

        // Attempt to reconnect if enabled and not manually closed
        if (
          !this.isClosedManually &&
          this.config.reconnect &&
          this.reconnectAttempts < (this.config.maxReconnectAttempts || 3)
        ) {
          this.reconnectAttempts++;
          const delay = this.config.reconnectDelay! * Math.pow(2, this.reconnectAttempts - 1);

          this.reconnectTimer = setTimeout(() => {
            this.connect();
          }, delay);
        }
      };
    } catch (error) {
      this.config.onError(
        error instanceof Error ? error : new Error('Failed to create WebSocket connection')
      );
    }
  }

  send(data: ArrayBuffer | Blob | string): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      this.ws.send(data);
      return true;
    } catch (error) {
      this.config.onError(
        error instanceof Error ? error : new Error('Failed to send data')
      );
      return false;
    }
  }

  close(): void {
    this.isClosedManually = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      // Send close message to server
      if (this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send('close');
        } catch {
          // Ignore errors when sending close message
        }
      }

      this.ws.close();
      this.ws = null;
    }

    this.reconnectAttempts = 0;
  }

  get isOpen(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  get isConnecting(): boolean {
    return this.ws?.readyState === WebSocket.CONNECTING;
  }

  get isClosed(): boolean {
    return this.ws?.readyState === WebSocket.CLOSED;
  }
}

// Helper function to create WebSocket connection
export function createTranscriptionWebSocket(
  apiBase: string,
  token: string,
  callbacks: Omit<WebSocketConfig, 'url' | 'token'>
): TranscriptionWebSocket {
  return new TranscriptionWebSocket({
    url: apiBase,
    token,
    ...callbacks,
  });
}
