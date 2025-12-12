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
        limit: response.data.limit ?? filters?.limit ?? (drivers.length || 10),
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

export interface AvailableDriversFilters {
  logistics_provider_id?: string;
  cargo_size?: 'SMALL' | 'MEDIUM' | 'LARGE' | 'EXTRA_LARGE'; // Para filtrar por compatibilidad de vehículo
  order_lat?: number; // Latitud de la orden (para cálculo de proximidad)
  order_lng?: number; // Longitud de la orden (para cálculo de proximidad)
}

export interface AvailableDriver {
  id: string;
  user_id: string;
  logistics_provider_id: string;
  availability_status: 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'SUSPENDED';
  vehicle_id: string | null;
  vehicle_type: 'MOTORCYCLE' | 'SEDAN' | 'MINI_VAN' | 'PANEL' | 'TRUCK' | 'PICKUP' | null;
  vehicle_license_plate: string | null;
  active_orders_count: number;
  max_orders: number;
  rating_avg: number | null;
  total_deliveries: number;
  user: {
    first_name: string;
    last_name: string;
    phone: string | null;
    email: string;
  };
  distance_km?: number; // Distancia a la orden en km (si se proporciona order_lat/lng)
}

export function useAvailableDrivers(filters?: AvailableDriversFilters) {
  return useQuery({
    queryKey: ['drivers', 'available', filters],
    queryFn: async () => {
      const response = await apiClient.get<{
        status: string;
        data: AvailableDriver[];
      }>(endpoints.drivers.available, {
        params: filters,
      });
      return response.data.data || [];
    },
    staleTime: 30 * 1000, // 30 segundos - los drivers disponibles cambian frecuentemente
    refetchInterval: 10 * 1000, // Refrescar cada 10 segundos
  });
}

