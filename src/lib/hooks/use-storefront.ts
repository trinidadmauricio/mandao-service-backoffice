import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './use-auth';
import { useSelectedTenant } from './use-selected-tenant';
import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import { USER_ROLE } from '../constants/roles';

export interface StorefrontConfig {
  storefront: {
    id: string;
    subdomain: string;
    custom_domain: string | null;
    is_active: boolean;
    theme_config: {
      template?: 'classic' | 'modern' | 'minimal' | 'fashion';
      [key: string]: unknown;
    };
    seo_config: Record<string, unknown> | null;
    business_hours: Record<string, unknown> | null;
    about_us: string | null;
    terms: string | null;
    privacy_policy: string | null;
  };
  tenant: {
    id: string;
    name: string;
    default_currency: string;
    default_locale: string;
  };
}

export interface UpdateStorefrontData {
  theme_config: {
    template: 'classic' | 'modern' | 'minimal' | 'fashion';
  };
}

/**
 * Hook para obtener configuración del storefront
 */
export function useStorefront() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { selectedTenantId } = useSelectedTenant();
  
  const isSAASAdmin = user && (user.role === USER_ROLE.SAAS_ADMIN || user.role === USER_ROLE.SAAS_EDITOR);
  
  // Determinar el tenant_id a usar
  const targetTenantId = isSAASAdmin ? selectedTenantId : user?.tenant_id;

  const { data: config, isLoading, error } = useQuery<StorefrontConfig | null>({
    queryKey: ['storefront', 'config', targetTenantId],
    queryFn: async () => {
      if (!targetTenantId) {
        return null;
      }

      try {
        const response = await apiClient.get<{ data: StorefrontConfig }>(
          endpoints.storefront.config,
          {
            headers: {
              'X-Tenant-Id': targetTenantId,
            },
          }
        );
        return response.data.data;
      } catch {
        return null;
      }
    },
    enabled: !isAuthLoading && !!targetTenantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    config,
    isLoading: isLoading || isAuthLoading,
    error,
    template: config?.storefront.theme_config.template || 'classic',
  };
}

/**
 * Hook para actualizar configuración del storefront
 */
export function useUpdateStorefront() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { selectedTenantId } = useSelectedTenant();
  
  const isSAASAdmin = user && (user.role === USER_ROLE.SAAS_ADMIN || user.role === USER_ROLE.SAAS_EDITOR);
  const targetTenantId = isSAASAdmin ? selectedTenantId : user?.tenant_id;

  const { mutateAsync, ...rest } = useMutation({
    mutationFn: async (data: UpdateStorefrontData) => {
      const response = await apiClient.patch<{ data: StorefrontConfig['storefront'] }>(
        endpoints.storefront.update,
        data,
        {
          headers: {
            'X-Tenant-Id': targetTenantId || '',
          },
        }
      );
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidar query para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['storefront', 'config', targetTenantId] });
    },
  });

  return {
    mutateAsync,
    ...rest,
  };
}

