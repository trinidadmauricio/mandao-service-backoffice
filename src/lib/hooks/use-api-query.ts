import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { AxiosResponse } from 'axios';

/**
 * Hook genérico para queries de API
 * Facilita la creación de queries personalizadas
 */
export function useApiQuery<TData = unknown, TError = unknown>(
  queryKey: string[],
  endpoint: string,
  options?: Omit<UseQueryOptions<AxiosResponse<{ data: TData }>, TError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<AxiosResponse<{ data: TData }>, TError>({
    queryKey,
    queryFn: async () => {
      return await apiClient.get<{ data: TData }>(endpoint);
    },
    staleTime: 60 * 1000, // 1 minuto por defecto
    ...options,
  });
}

/**
 * Hook genérico para mutations de API
 */
export function useApiMutation<TData = unknown, TVariables = unknown, TError = unknown>() {
  const { useMutation, useQueryClient } = require('@tanstack/react-query');
  const queryClient = useQueryClient();

  return useMutation<AxiosResponse<{ data: TData }>, TError, TVariables>({
    mutationFn: async (variables: TVariables) => {
      // Este hook debe ser usado con useMutation directamente
      // Esta es solo una estructura base
      throw new Error('useApiMutation debe ser implementado con useMutation específico');
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

