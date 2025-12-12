/**
 * Cliente WebSocket para ubicaciones de drivers en tiempo real
 * Se conecta al servidor WebSocket del backend para recibir actualizaciones de ubicación
 */

import Cookies from 'js-cookie';

const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }
  return 'http://localhost:3001';
};

const getWsUrl = (): string => {
  const apiUrl = getApiBaseUrl();
  return apiUrl.replace(/^http/, 'ws');
};

export interface DriverLocation {
  driver_id: string;
  lat: number;
  lng: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  order_id?: string;
  recorded_at: string;
}

export interface LocationMessage {
  type: 'location_update' | 'connected' | 'error' | 'location_received' | 'subscribed';
  driver_id?: string;
  location?: DriverLocation;
  timestamp?: string;
  message?: string;
  user_id?: string;
  role?: string;
  driver_ids?: string[] | 'all';
}

type MessageHandler = (message: LocationMessage) => void;
type ErrorHandler = (error: Event) => void;
type ConnectionHandler = () => void;

export class LocationWebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 1 segundo inicial
  private reconnectTimer: NodeJS.Timeout | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();
  private connectionHandlers: Set<ConnectionHandler> = new Set();
  private disconnectionHandlers: Set<ConnectionHandler> = new Set();
  private isConnecting = false;
  private subscribedDriverIds: Set<string> = new Set();
  private subscribeToAll = false;

  /**
   * Conecta al servidor WebSocket
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return; // Ya está conectado o conectando
    }

    this.isConnecting = true;

    try {
      const token = Cookies.get('access_token');
      if (!token) {
        console.error('[LocationWebSocketClient] No access token found');
        this.isConnecting = false;
        return;
      }

      // Construir URL con token como query param
      const wsUrl = `${getWsUrl()}/ws/location?token=${encodeURIComponent(token)}`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[LocationWebSocketClient] Connected to WebSocket server');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;

        // Notificar handlers de conexión
        this.connectionHandlers.forEach((handler) => handler());
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as LocationMessage;
          this.handleMessage(message);
        } catch (error) {
          console.error('[LocationWebSocketClient] Error parsing message', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[LocationWebSocketClient] WebSocket error', error);
        this.errorHandlers.forEach((handler) => handler(error));
        this.isConnecting = false;
      };

      this.ws.onclose = (event) => {
        console.log('[LocationWebSocketClient] WebSocket closed', {
          code: event.code,
          reason: event.reason,
        });
        this.isConnecting = false;
        this.ws = null;

        // Notificar handlers de desconexión
        this.disconnectionHandlers.forEach((handler) => handler());

        // Intentar reconectar si no fue un cierre intencional
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };
    } catch (error) {
      console.error('[LocationWebSocketClient] Error creating WebSocket', error);
      this.isConnecting = false;
    }
  }

  /**
   * Desconecta del servidor WebSocket
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.isConnecting = false;
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevenir reconexión automática
  }

  /**
   * Suscribe a ubicaciones de drivers específicos o a todos
   */
  subscribe(driverIds?: string[]): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[LocationWebSocketClient] Cannot subscribe: WebSocket not connected');
      return;
    }

    if (driverIds && driverIds.length > 0) {
      this.subscribedDriverIds = new Set(driverIds);
      this.subscribeToAll = false;
    } else {
      this.subscribedDriverIds.clear();
      this.subscribeToAll = true;
    }

    this.ws.send(
      JSON.stringify({
        type: 'subscribe',
        driver_ids: driverIds && driverIds.length > 0 ? driverIds : undefined,
      })
    );
  }

  /**
   * Registra un handler para mensajes de ubicación
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  /**
   * Registra un handler para errores
   */
  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler);
    return () => {
      this.errorHandlers.delete(handler);
    };
  }

  /**
   * Registra un handler para conexión establecida
   */
  onConnect(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler);
    return () => {
      this.connectionHandlers.delete(handler);
    };
  }

  /**
   * Registra un handler para desconexión
   */
  onDisconnect(handler: ConnectionHandler): () => void {
    this.disconnectionHandlers.add(handler);
    return () => {
      this.disconnectionHandlers.delete(handler);
    };
  }

  /**
   * Verifica si está conectado
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Obtiene el estado de la conexión
   */
  getReadyState(): number | null {
    return this.ws?.readyState ?? null;
  }

  private handleMessage(message: LocationMessage): void {
    // Filtrar mensajes según suscripción
    if (message.type === 'location_update' && message.driver_id) {
      if (!this.subscribeToAll && !this.subscribedDriverIds.has(message.driver_id)) {
        return; // No está suscrito a este driver
      }
    }

    // Notificar a todos los handlers
    this.messageHandlers.forEach((handler) => handler(message));
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return; // Ya hay un reconnect programado
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000); // Max 30 segundos

    console.log(`[LocationWebSocketClient] Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }
}

// Singleton instance
let clientInstance: LocationWebSocketClient | null = null;

export function getLocationWebSocketClient(): LocationWebSocketClient {
  if (!clientInstance) {
    clientInstance = new LocationWebSocketClient();
  }
  return clientInstance;
}

