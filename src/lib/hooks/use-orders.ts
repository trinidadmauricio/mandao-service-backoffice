import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import { useTenantEnabled } from './use-tenant-enabled';
import type { Order } from '@/types/api';

export interface OrdersFilters {
  status?: 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED' | 'FAILED';
  driver_id?: string;
  branch_id?: string;
  order_type?: 'RETAIL' | 'ON_DEMAND';
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface OrdersResponse {
  data: Order[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export function useOrders(filters?: OrdersFilters) {
  const tenantEnabled = useTenantEnabled();
  
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Order[]; total?: number; page?: number; limit?: number; totalPages?: number }>(
        endpoints.orders.list,
        {
          params: filters,
        }
      );
      return {
        data: response.data.data,
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
        totalPages: response.data.totalPages,
      } as OrdersResponse;
    },
    enabled: tenantEnabled,
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Order }>(endpoints.orders.get(orderId));
      return response.data.data;
    },
    enabled: !!orderId,
  });
}

export function useCreateOnDemandOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: unknown) => {
      const response = await apiClient.post<{ data: { order: Order; order_number: string; order_display_number: string; tracking_code: string } }>(
        endpoints.orders.create,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useCreateRetailOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: unknown) => {
      const response = await apiClient.post<{ data: { order_id: string; order_number: string; order_display_number: string; tracking_code: string; status: string } }>(
        endpoints.orders.createRetail,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, to_status, notes, cancellation_reason }: { id: string; to_status: Order['status']; notes?: string; cancellation_reason?: string }) => {
      await apiClient.patch(endpoints.orders.update(id), {
        to_status,
        notes,
        cancellation_reason,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
    },
  });
}

export function useAssignDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, driverId }: { orderId: string; driverId: string }) => {
      await apiClient.post(endpoints.orders.assignDriver(orderId), {
        driver_id: driverId,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
    },
  });
}

export function useChangeBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, branchId }: { orderId: string; branchId: string }) => {
      await apiClient.post(endpoints.orders.changeBranch(orderId), {
        branch_id: branchId,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
    },
  });
}

export function useModifyItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, items }: { orderId: string; items: unknown[] }) => {
      await apiClient.post(endpoints.orders.modifyItems(orderId), {
        items,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, cancellation_reason }: { orderId: string; cancellation_reason?: string }) => {
      await apiClient.post(endpoints.orders.cancel(orderId), {
        cancellation_reason,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
    },
  });
}

export function useRecalculateTotals() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, tax_rate, discount_amount }: { orderId: string; tax_rate?: number; discount_amount?: number }) => {
      await apiClient.post(endpoints.orders.recalculateTotals(orderId), {
        tax_rate,
        discount_amount,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
    },
  });
}

export function useDeliveryProof() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, proof_type, proof_data, delivered_to_name, delivered_at, driver_notes }: { orderId: string; proof_type: 'SIGNATURE' | 'PHOTO' | 'CODE' | 'NONE'; proof_data: Record<string, unknown>; delivered_to_name: string; delivered_at: string; driver_notes?: string }) => {
      await apiClient.post(endpoints.orders.deliveryProof(orderId), {
        proof_type,
        proof_data,
        delivered_to_name,
        delivered_at,
        driver_notes,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
    },
  });
}

export function useOrderRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, customer_rating, driver_rating, customer_comment, driver_comment }: { orderId: string; customer_rating: number; driver_rating?: number; customer_comment?: string; driver_comment?: string }) => {
      await apiClient.post(endpoints.orders.rating(orderId), {
        customer_rating,
        driver_rating,
        customer_comment,
        driver_comment,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
    },
  });
}

