import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { endpoints } from "../api/endpoints";
import type { User } from "@/types/api";

export interface UsersFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'OWNER' | 'SUPERVISOR' | 'MERCHANT_USER' | 'LOGISTICS_PROVIDER' | 'CUSTOMER' | 'SAAS_ADMIN' | 'SAAS_EDITOR';
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface UsersResponse {
  data: User[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export function useUsers(filters?: UsersFilters) {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: async () => {
      const response = await apiClient.get<{
        status: string;
        data: User[];
        total?: number;
        page?: number;
        limit?: number;
        totalPages?: number;
      }>(endpoints.users.list, {
        params: filters,
      });
      // El backend devuelve { status: 'success', data: [...], total, page, limit, totalPages }
      const users = response.data.data || [];
      return {
        data: users,
        total: response.data.total ?? users.length,
        page: response.data.page ?? filters?.page ?? 1,
        limit: response.data.limit ?? filters?.limit ?? (users.length || 10),
        totalPages: response.data.totalPages ?? Math.ceil((response.data.total ?? users.length) / (response.data.limit ?? filters?.limit ?? 10)),
      } as UsersResponse;
    },
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: User }>(
        endpoints.users.get(userId)
      );
      return response.data.data;
    },
    enabled: !!userId,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await apiClient.post<{ data: User }>(
        endpoints.users.create,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      const response = await apiClient.patch<{ data: User }>(
        endpoints.users.update(id),
        data
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", data.id] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(endpoints.users.delete(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
