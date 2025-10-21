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
      // Convert https:// to wss:// and http:// to ws://
      const wsUrl = this.config.url
        .replace(/^https:/, 'wss:')
        .replace(/^http:/, 'ws:');

      const url = `${wsUrl}/v1/transcribe/stream?token=${encodeURIComponent(this.config.token)}`;

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

      this.ws.onerror = () => {
        this.config.onError(new Error('WebSocket connection error'));
      };

      this.ws.onclose = (event) => {
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
