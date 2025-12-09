import { useCallback, useSyncExternalStore } from 'react';
import Cookies from 'js-cookie';
import { useQueryClient } from '@tanstack/react-query';

const SELECTED_TENANT_COOKIE = 'selected_tenant_id';

// Store simple para sincronizar el estado entre todos los componentes
type Listener = () => void;
const listeners = new Set<Listener>();

let selectedTenantIdStore: string | null = 
  typeof window !== 'undefined' ? Cookies.get(SELECTED_TENANT_COOKIE) || null : null;

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): string | null {
  return selectedTenantIdStore;
}

function getServerSnapshot(): string | null {
  return null;
}

function setTenantId(tenantId: string | null): void {
  selectedTenantIdStore = tenantId;
  
  // Sincronizar con cookies
  if (tenantId) {
    Cookies.set(SELECTED_TENANT_COOKIE, tenantId, { expires: 7, path: '/' });
  } else {
    Cookies.remove(SELECTED_TENANT_COOKIE, { path: '/' });
  }
  
  // Notificar a todos los suscriptores
  listeners.forEach((listener) => listener());
}

/**
 * Hook para manejar el tenant seleccionado por SAAS_ADMIN
 * Guarda el tenant_id seleccionado en cookies para persistencia
 * Usa useSyncExternalStore para sincronizar entre todos los componentes
 */
export function useSelectedTenant() {
  const queryClient = useQueryClient();
  
  const selectedTenantId = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const setSelectedTenantId = useCallback(
    (tenantId: string | null) => {
      setTenantId(tenantId);
      // Invalidar todas las queries relacionadas con tenant para forzar refetch
      queryClient.invalidateQueries();
    },
    [queryClient]
  );

  const clearSelectedTenant = useCallback(() => {
    setTenantId(null);
    queryClient.invalidateQueries();
  }, [queryClient]);

  return {
    selectedTenantId,
    setSelectedTenantId,
    clearSelectedTenant,
  };
}
