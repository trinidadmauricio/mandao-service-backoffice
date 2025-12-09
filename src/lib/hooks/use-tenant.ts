import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from './use-auth';
import { useSelectedTenant } from './use-selected-tenant';
import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import { USER_ROLE } from '../constants/roles';

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  type: 'RETAIL' | 'ON_DEMAND';
  subscription_status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
  default_currency: string;
  default_locale: string;
}

/**
 * Hook para obtener información del tenant del usuario
 * Para SAAS_ADMIN/SAAS_EDITOR, usa el selectedTenantId
 * Para otros roles, usa el tenant_id del usuario
 */
export function useTenant(tenantId?: string) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { selectedTenantId } = useSelectedTenant();
  
  const isSAASAdmin = user && (user.role === USER_ROLE.SAAS_ADMIN || user.role === USER_ROLE.SAAS_EDITOR);
  
  // Determinar el tenant_id a usar:
  // 1. Si se pasa explícitamente un tenantId, usar ese
  // 2. Si es SAAS_ADMIN, usar el selectedTenantId
  // 3. Sino, usar el tenant_id del usuario
  const targetTenantId = tenantId || (isSAASAdmin ? selectedTenantId : user?.tenant_id);

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
    enabled: !isAuthLoading && !!targetTenantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    tenant,
    isLoading: isLoading || isAuthLoading,
    error,
    isRetail: tenant?.type === 'RETAIL',
    isOnDemand: tenant?.type === 'ON_DEMAND',
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
