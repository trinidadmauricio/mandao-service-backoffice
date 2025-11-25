import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { endpoints } from "../api/endpoints";
import type { User } from "@/types/api";

export interface UsersFilters {
  page?: number;
  limit?: number;
  search?: string;
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
      const response = await apiClient.get<{ status: string; data: User[] }>(
        endpoints.users.list,
        {
          params: filters,
        }
      );
      // El backend devuelve { status: 'success', data: [...] }
      const users = response.data.data || [];
      return {
        data: users,
        total: users.length,
        page: 1,
        limit: users.length,
        totalPages: 1,
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
