import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { Driver } from '@/types/api';

export interface DriversFilters {
  page?: number;
  limit?: number;
  search?: string;
  logistics_provider_id?: string;
  availability_status?: 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'SUSPENDED';
  work_type?: 'FULL_TIME' | 'PART_TIME' | 'FREELANCE';
}

export interface DriversResponse {
  data: Driver[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export function useDrivers(filters?: DriversFilters) {
  return useQuery({
    queryKey: ['drivers', filters],
    queryFn: async () => {
      const response = await apiClient.get<{
        status: string;
        data: Driver[];
        total?: number;
        page?: number;
        limit?: number;
        totalPages?: number;
      }>(endpoints.drivers.list, {
        params: filters,
      });
      // El backend devuelve { status: 'success', data: [...], total, page, limit, totalPages }
      const drivers = response.data.data || [];
      return {
        data: drivers,
        total: response.data.total ?? drivers.length,
        page: response.data.page ?? filters?.page ?? 1,
        limit: response.data.limit ?? filters?.limit ?? drivers.length || 10,
        totalPages: response.data.totalPages ?? Math.ceil((response.data.total ?? drivers.length) / (response.data.limit ?? filters?.limit ?? 10)),
      } as DriversResponse;
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

