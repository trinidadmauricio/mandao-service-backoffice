import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { DeliveryRate } from '@/types/api';

export interface DeliveryRateFilters {
  zone_id?: string;
}

export function useDeliveryRates(filters?: DeliveryRateFilters) {
  return useQuery({
    queryKey: ['delivery-rates', filters],
    queryFn: async () => {
      const response = await apiClient.get<{ data: DeliveryRate[] }>(
        endpoints.deliveryRates.list,
        {
          params: filters,
        }
      );
      return response.data.data;
    },
  });
}

export function useDeliveryRate(rateId: string) {
  return useQuery({
    queryKey: ['delivery-rate', rateId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: DeliveryRate }>(
        endpoints.deliveryRates.get(rateId)
      );
      return response.data.data;
    },
    enabled: !!rateId,
  });
}

export function useCreateDeliveryRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<DeliveryRate>) => {
      const response = await apiClient.post<{ data: DeliveryRate }>(
        endpoints.deliveryRates.create,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-rates'] });
    },
  });
}

export function useUpdateDeliveryRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DeliveryRate> }) => {
      const response = await apiClient.patch<{ data: DeliveryRate }>(
        endpoints.deliveryRates.update(id),
        data
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['delivery-rates'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-rate', data.id] });
    },
  });
}

export function useDeleteDeliveryRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(endpoints.deliveryRates.delete(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-rates'] });
    },
  });
}

