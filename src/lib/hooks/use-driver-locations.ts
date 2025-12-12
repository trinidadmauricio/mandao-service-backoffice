/**
 * Hook para recibir ubicaciones de drivers en tiempo real vía WebSocket
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { getLocationWebSocketClient, DriverLocation, LocationMessage } from '../websocket/LocationWebSocketClient';
import { useAuth } from './use-auth';

export interface DriverLocationState {
  driver_id: string;
  location: DriverLocation | null;
  lastUpdate: Date | null;
  isOnline: boolean;
}

export interface UseDriverLocationsOptions {
  driverIds?: string[]; // Si se especifica, suscribirse solo a estos drivers. Si no, a todos.
  enabled?: boolean; // Si false, no se conecta al WebSocket
  autoConnect?: boolean; // Si true, se conecta automáticamente al montar
}

export function useDriverLocations(options: UseDriverLocationsOptions = {}) {
  const { enabled = true, autoConnect = true, driverIds } = options;
  const { isAuthenticated } = useAuth();
  const [locations, setLocations] = useState<Map<string, DriverLocationState>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const clientRef = useRef<ReturnType<typeof getLocationWebSocketClient> | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Inicializar cliente WebSocket
  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      return;
    }

    const client = getLocationWebSocketClient();
    clientRef.current = client;

    // Handler para mensajes de ubicación
    const unsubscribe = client.onMessage((message: LocationMessage) => {
      if (message.type === 'location_update' && message.driver_id && message.location) {
        setLocations((prev) => {
          const newMap = new Map(prev);
          newMap.set(message.driver_id!, {
            driver_id: message.driver_id!,
            location: message.location!,
            lastUpdate: new Date(),
            isOnline: true,
          });
          return newMap;
        });
      } else if (message.type === 'connected') {
        setIsConnected(true);
        setError(null);
      } else if (message.type === 'error') {
        setError(new Error(message.message || 'WebSocket error'));
      }
    });

    unsubscribeRef.current = unsubscribe;

    // Handler para conexión
    const unsubscribeConnect = client.onConnect(() => {
      setIsConnected(true);
      setError(null);

      // Suscribirse a drivers después de conectar
      if (driverIds && driverIds.length > 0) {
        client.subscribe(driverIds);
      } else {
        client.subscribe(); // Suscribirse a todos
      }
    });

    // Handler para desconexión
    const unsubscribeDisconnect = client.onDisconnect(() => {
      setIsConnected(false);
    });

    // Handler para errores
    const unsubscribeError = client.onError(() => {
      setIsConnected(false);
      setError(new Error('WebSocket connection error'));
    });

    // Conectar si autoConnect está habilitado
    if (autoConnect) {
      client.connect();
    }

    return () => {
      unsubscribe();
      unsubscribeConnect();
      unsubscribeDisconnect();
      unsubscribeError();
    };
  }, [enabled, isAuthenticated, autoConnect, driverIds]);

  // Actualizar suscripción cuando cambian los driverIds
  useEffect(() => {
    if (!clientRef.current || !isConnected) {
      return;
    }

    if (driverIds && driverIds.length > 0) {
      clientRef.current.subscribe(driverIds);
    } else {
      clientRef.current.subscribe(); // Suscribirse a todos
    }
  }, [driverIds, isConnected]);

  // Conectar manualmente
  const connect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.connect();
    }
  }, []);

  // Desconectar manualmente
  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnect();
    }
  }, []);

  // Obtener ubicación de un driver específico
  const getDriverLocation = useCallback(
    (driverId: string): DriverLocationState | null => {
      return locations.get(driverId) || null;
    },
    [locations]
  );

  // Obtener todas las ubicaciones
  const getAllLocations = useCallback((): Map<string, DriverLocationState> => {
    return locations;
  }, [locations]);

  return {
    locations,
    isConnected,
    error,
    connect,
    disconnect,
    getDriverLocation,
    getAllLocations,
  };
}

