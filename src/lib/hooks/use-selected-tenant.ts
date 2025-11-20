import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useQueryClient } from '@tanstack/react-query';

const SELECTED_TENANT_COOKIE = 'selected_tenant_id';

/**
 * Hook para manejar el tenant seleccionado por SAAS_ADMIN
 * Guarda el tenant_id seleccionado en cookies para persistencia
 */
export function useSelectedTenant() {
  const [selectedTenantId, setSelectedTenantIdState] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return Cookies.get(SELECTED_TENANT_COOKIE) || null;
  });
  const queryClient = useQueryClient();

  // Sincronizar con cookies cuando cambia
  useEffect(() => {
    if (selectedTenantId) {
      Cookies.set(SELECTED_TENANT_COOKIE, selectedTenantId, { expires: 7, path: '/' });
    } else {
      Cookies.remove(SELECTED_TENANT_COOKIE, { path: '/' });
    }
  }, [selectedTenantId]);

  const setSelectedTenantId = useCallback(
    (tenantId: string | null) => {
      setSelectedTenantIdState(tenantId);
      // Invalidar todas las queries relacionadas con tenant para forzar refetch
      queryClient.invalidateQueries();
    },
    [queryClient]
  );

  const clearSelectedTenant = useCallback(() => {
    setSelectedTenantIdState(null);
    Cookies.remove(SELECTED_TENANT_COOKIE, { path: '/' });
    queryClient.invalidateQueries();
  }, [queryClient]);

  return {
    selectedTenantId,
    setSelectedTenantId,
    clearSelectedTenant,
  };
}

