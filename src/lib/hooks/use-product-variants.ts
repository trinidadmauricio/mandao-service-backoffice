import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';

export interface ProductVariant {
  id: string;
  product_id: string;
  tenant_id: string;
  sku: string;
  barcode?: string;
  option1_name?: string;
  option1_value?: string;
  option2_name?: string;
  option2_value?: string;
  option3_name?: string;
  option3_value?: string;
  price_adjustment: number;
  cost_price?: number;
  currency: string;
  track_inventory: boolean;
  current_stock: number;
  weight_kg?: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariantFilters {
  product_id?: string;
}

export function useProductVariants(filters?: ProductVariantFilters) {
  return useQuery({
    queryKey: ['product-variants', filters],
    queryFn: async () => {
      const response = await apiClient.get<{ data: ProductVariant[] }>(
        endpoints.productVariants.list,
        {
          params: filters,
        }
      );
      return response.data.data;
    },
  });
}

export function useProductVariant(variantId: string) {
  return useQuery({
    queryKey: ['product-variant', variantId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: ProductVariant }>(
        endpoints.productVariants.get(variantId)
      );
      return response.data.data;
    },
    enabled: !!variantId,
  });
}

export function useCreateProductVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<ProductVariant>) => {
      const response = await apiClient.post<{ data: ProductVariant }>(
        endpoints.productVariants.create,
        data
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product-variants'] });
      queryClient.invalidateQueries({ queryKey: ['product', data.product_id] });
    },
  });
}

export function useUpdateProductVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProductVariant> }) => {
      const response = await apiClient.patch<{ data: ProductVariant }>(
        endpoints.productVariants.update(id),
        data
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product-variants'] });
      queryClient.invalidateQueries({ queryKey: ['product-variant', data.id] });
      queryClient.invalidateQueries({ queryKey: ['product', data.product_id] });
    },
  });
}

export function useDeleteProductVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(endpoints.productVariants.delete(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants'] });
    },
  });
}

