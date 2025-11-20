import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import { useSelectedTenant } from './use-selected-tenant';
import { useAuth } from './use-auth';

export interface OrdersReportFilters {
  start_date?: string;
  end_date?: string;
  status?: string;
}

export interface OrdersReportData {
  orders_by_date: Array<{
    date: string;
    count: number;
  }>;
  orders_by_status: Array<{
    status: string;
    count: number;
  }>;
  revenue_by_date: Array<{
    date: string;
    revenue: number;
  }>;
  top_products: Array<{
    product_name: string;
    quantity: number;
    revenue: number;
  }>;
}

export function useOrdersReport(filters?: OrdersReportFilters) {
  const { selectedTenantId } = useSelectedTenant();
  const { user } = useAuth();
  const isSAASAdmin = user && (user.role === 'SAAS_ADMIN' || user.role === 'SAAS_EDITOR');

  return useQuery({
    queryKey: ['orders-report', filters, selectedTenantId],
    queryFn: async () => {
      const params: Record<string, string | undefined> = { ...filters };
      
      // Si es SAAS_ADMIN y tiene un tenant seleccionado, agregarlo como query parameter
      if (isSAASAdmin && selectedTenantId) {
        params.tenant_id = selectedTenantId;
      }

      const response = await apiClient.get<{ data: OrdersReportData }>(
        endpoints.reports.orders,
        {
          params,
        }
      );
      return response.data.data;
    },
    enabled: !isSAASAdmin || !!selectedTenantId, // Solo habilitar si no es SAAS_ADMIN o si tiene tenant seleccionado
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

