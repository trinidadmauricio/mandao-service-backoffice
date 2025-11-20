import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { Tenant } from '@/types/api';

/**
 * Hook para obtener la lista de tenants
 * Solo disponible para usuarios con permisos de administrador (SAAS_ADMIN, SAAS_EDITOR)
 */
export function useTenants() {
  return useQuery({
    queryKey: ['tenants', 'list'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Tenant[] }>(endpoints.tenants.list);
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

