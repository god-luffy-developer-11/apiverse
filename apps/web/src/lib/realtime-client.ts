import { RealtimeEnvelope } from './types';

type ListenerCallback = (data: RealtimeEnvelope) => void;

class RealtimeUniverseGateway {
  private ws: WebSocket | null = null;
  private listeners: Set<ListenerCallback> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private isConnecting = false;
  public status: 'LIVE' | 'RECONNECTING' | 'OFFLINE' = 'OFFLINE';
  public onStatusChange?: (status: 'LIVE' | 'RECONNECTING' | 'OFFLINE') => void;

  connect(workspaceId = 'ws_solar_alpha', userId = 'astro_01') {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) return;

    this.isConnecting = true;
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `ws://localhost:8000/ws/${workspaceId}?user_id=${userId}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.status = 'LIVE';
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        this.onStatusChange?.('LIVE');
        console.log('[Realtime Universe Gateway] Connected to galaxy channel:', workspaceId);
      };

      this.ws.onmessage = (event) => {
        try {
          const envelope: RealtimeEnvelope = JSON.parse(event.data);
          this.listeners.forEach((cb) => cb(envelope));
        } catch (e) {
          console.error('[Realtime Gateway] JSON parse error:', e);
        }
      };

      this.ws.onclose = () => {
        this.status = 'RECONNECTING';
        this.isConnecting = false;
        this.onStatusChange?.('RECONNECTING');
        this.scheduleReconnect(workspaceId, userId);
      };

      this.ws.onerror = () => {
        this.status = 'OFFLINE';
        this.onStatusChange?.('OFFLINE');
      };
    } catch (err) {
      this.status = 'OFFLINE';
      this.isConnecting = false;
      this.onStatusChange?.('OFFLINE');
      this.scheduleReconnect(workspaceId, userId);
    }
  }

  private scheduleReconnect(workspaceId: string, userId: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const backoffDelay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 15000);
      setTimeout(() => this.connect(workspaceId, userId), backoffDelay);
    } else {
      this.status = 'OFFLINE';
      this.onStatusChange?.('OFFLINE');
    }
  }

  subscribe(callback: ListenerCallback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
}

export const realtimeGateway = new RealtimeUniverseGateway();
