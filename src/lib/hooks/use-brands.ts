import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';

export interface Brand {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Brand[] }>(endpoints.brands.list);
      return response.data.data;
    },
  });
}

export function useBrand(brandId: string) {
  return useQuery({
    queryKey: ['brand', brandId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Brand }>(endpoints.brands.get(brandId));
      return response.data.data;
    },
    enabled: !!brandId,
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Brand>) => {
      const response = await apiClient.post<{ data: Brand }>(endpoints.brands.create, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Brand> }) => {
      const response = await apiClient.patch<{ data: Brand }>(endpoints.brands.update(id), data);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['brand', data.id] });
    },
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(endpoints.brands.delete(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
}

