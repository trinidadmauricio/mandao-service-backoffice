import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { Branch } from '@/types/api';

export function useBranches() {
  return useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Branch[] }>(endpoints.branches.list);
      return response.data.data;
    },
  });
}

export function useBranch(branchId: string) {
  return useQuery({
    queryKey: ['branch', branchId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Branch }>(endpoints.branches.get(branchId));
      return response.data.data;
    },
    enabled: !!branchId,
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Branch>) => {
      const response = await apiClient.post<{ data: Branch }>(endpoints.branches.create, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });
}

export function useUpdateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Branch> }) => {
      const response = await apiClient.patch<{ data: Branch }>(endpoints.branches.update(id), data);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      queryClient.invalidateQueries({ queryKey: ['branch', data.id] });
    },
  });
}

export function useDeleteBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(endpoints.branches.delete(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });
}

