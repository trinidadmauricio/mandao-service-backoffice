import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';

export interface OrderCounter {
  id: string;
  tenant_id: string;
  current_value: number;
  prefix?: string;
  padding_length: number;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderCounterData {
  tenant_id: string;
  prefix?: string;
  padding_length?: number;
}

export interface UpdateOrderCounterData {
  current_value?: number;
  prefix?: string;
  padding_length?: number;
  reset?: boolean;
}

export function useOrderCounter(tenantId: string) {
  return useQuery({
    queryKey: ['order-counter', tenantId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: OrderCounter }>(
        endpoints.orderCounters.getByTenant(tenantId)
      );
      return response.data.data;
    },
    enabled: !!tenantId,
  });
}

export function useCreateOrderCounter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOrderCounterData) => {
      const response = await apiClient.post<{ data: OrderCounter }>(
        endpoints.orderCounters.create,
        data
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['order-counter', data.tenant_id] });
    },
  });
}

export function useUpdateOrderCounter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tenantId, data }: { tenantId: string; data: UpdateOrderCounterData }) => {
      const response = await apiClient.patch<{ data: OrderCounter }>(
        endpoints.orderCounters.update(tenantId),
        data
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['order-counter', data.tenant_id] });
    },
  });
}

export function useIncrementOrderCounter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tenantId: string) => {
      const response = await apiClient.post<{ data: { new_value: number } }>(
        endpoints.orderCounters.increment(tenantId)
      );
      return response.data.data;
    },
    onSuccess: (_, tenantId) => {
      queryClient.invalidateQueries({ queryKey: ['order-counter', tenantId] });
    },
  });
}

