import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { Driver } from '@/types/api';

export function useDrivers() {
  return useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Driver[] }>(endpoints.drivers.list);
      return response.data.data;
    },
  });
}

export function useDriver(driverId: string) {
  return useQuery({
    queryKey: ['driver', driverId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Driver }>(endpoints.drivers.get(driverId));
      return response.data.data;
    },
    enabled: !!driverId,
  });
}

export function useCreateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Driver>) => {
      const response = await apiClient.post<{ data: Driver }>(endpoints.drivers.create, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}

export function useUpdateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Driver> }) => {
      const response = await apiClient.patch<{ data: Driver }>(endpoints.drivers.update(id), data);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['driver', data.id] });
    },
  });
}

export function useDeleteDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(endpoints.drivers.delete(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}

