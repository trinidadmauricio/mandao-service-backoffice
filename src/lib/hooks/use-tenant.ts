import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from './use-auth';
import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  type: 'RETAIL' | 'ON_DEMAND' | 'HYBRID';
  subscription_status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
  default_currency: string;
  default_locale: string;
}

/**
 * Hook para obtener información del tenant del usuario
 */
export function useTenant(tenantId?: string) {
  const { user } = useAuth();
  const targetTenantId = tenantId || user?.tenant_id;

  const { data: tenant, isLoading, error } = useQuery<Tenant | null>({
    queryKey: ['tenant', targetTenantId],
    queryFn: async () => {
      if (!targetTenantId) {
        return null;
      }

      try {
        const response = await apiClient.get<{ data: Tenant }>(endpoints.tenants.get(targetTenantId));
        return response.data.data;
      } catch {
        // Si no hay endpoint de tenants, retornar null
        return null;
      }
    },
    enabled: !!targetTenantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    tenant,
    isLoading,
    error,
    isRetail: tenant?.type === 'RETAIL' || tenant?.type === 'HYBRID',
    isOnDemand: tenant?.type === 'ON_DEMAND' || tenant?.type === 'HYBRID',
    isHybrid: tenant?.type === 'HYBRID',
  };
}

/**
 * Hook para actualizar tenant
 */
export function useUpdateTenant() {
  const { mutateAsync, ...rest } = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Tenant> }) => {
      const response = await apiClient.patch<{ data: Tenant }>(endpoints.tenants.update(id), data);
      return response.data.data;
    },
  });

  return {
    mutateAsync,
    ...rest,
  };
}
