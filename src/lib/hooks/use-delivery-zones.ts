import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { DeliveryZone } from '@/types/api';

export function useDeliveryZones() {
  return useQuery({
    queryKey: ['delivery-zones'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: DeliveryZone[] }>(
        endpoints.deliveryZones.list
      );
      return response.data.data;
    },
  });
}

export function useDeliveryZone(zoneId: string) {
  return useQuery({
    queryKey: ['delivery-zone', zoneId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: DeliveryZone }>(
        endpoints.deliveryZones.get(zoneId)
      );
      return response.data.data;
    },
    enabled: !!zoneId,
  });
}

export function useCreateDeliveryZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<DeliveryZone>) => {
      const response = await apiClient.post<{ data: DeliveryZone }>(
        endpoints.deliveryZones.create,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-zones'] });
    },
  });
}

export function useUpdateDeliveryZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DeliveryZone> }) => {
      const response = await apiClient.patch<{ data: DeliveryZone }>(
        endpoints.deliveryZones.update(id),
        data
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['delivery-zones'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-zone', data.id] });
    },
  });
}

export function useDeleteDeliveryZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(endpoints.deliveryZones.delete(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-zones'] });
    },
  });
}

