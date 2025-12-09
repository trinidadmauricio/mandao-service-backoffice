import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import { useTenantEnabled } from './use-tenant-enabled';
import type { Product } from '@/types/api';

export interface ProductsFilters {
  category_id?: string;
  brand_id?: string;
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  data: Product[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export function useProducts(filters?: ProductsFilters) {
  const tenantEnabled = useTenantEnabled();
  
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const response = await apiClient.get<{ status: string; data: Product[] }>(
        endpoints.products.list,
        {
          params: filters,
        }
      );
      // El backend devuelve { status: 'success', data: [...] }
      const products = response.data.data || [];
      return {
        data: products,
        total: products.length,
        page: 1,
        limit: products.length,
        totalPages: 1,
      } as ProductsResponse;
    },
    enabled: tenantEnabled,
  });
}

export function useProduct(productId: string) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Product }>(endpoints.products.get(productId));
      return response.data.data;
    },
    enabled: !!productId,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Product>) => {
      const response = await apiClient.post<{ data: Product }>(endpoints.products.create, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Product> }) => {
      const response = await apiClient.patch<{ data: Product }>(endpoints.products.update(id), data);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', data.id] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(endpoints.products.delete(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

