import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import { useSelectedTenant } from './use-selected-tenant';
import { useAuth } from './use-auth';
import { USER_ROLE } from '../constants/roles';
import type { DashboardKPIs } from '@/types/api';

export type Period = 'today' | 'week' | 'month' | 'year';

export function useDashboardKPIs(period: Period = 'month') {
  const { selectedTenantId } = useSelectedTenant();
  const { user } = useAuth();
  const isSAASAdmin = user && (user.role === USER_ROLE.SAAS_ADMIN || user.role === USER_ROLE.SAAS_EDITOR);

  return useQuery({
    queryKey: ['dashboard-kpis', period, selectedTenantId],
    queryFn: async () => {
      const params: Record<string, string> = { period };
      
      // Si es SAAS_ADMIN y tiene un tenant seleccionado, agregarlo como query parameter
      if (isSAASAdmin && selectedTenantId) {
        params.tenant_id = selectedTenantId;
      }

      const response = await apiClient.get<{ data: DashboardKPIs }>(
        endpoints.reports.dashboardKPIs,
        {
          params,
        }
      );
      return response.data.data;
    },
    enabled: !isSAASAdmin || !!selectedTenantId, // Solo habilitar si no es SAAS_ADMIN o si tiene tenant seleccionado
    staleTime: 60 * 1000, // 1 minuto
  });
}

