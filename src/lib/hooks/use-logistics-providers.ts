import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { endpoints } from "../api/endpoints";

export interface LogisticsProvider {
  id: string;
  tenant_id?: string;
  company_name: string;
  tax_id: string;
  representative_name: string;
  representative_phone: string;
  representative_document: string;
  verification_status: "PENDING" | "VERIFIED" | "REJECTED";
  verification_documents?: Record<string, unknown>;
  status: "ACTIVE" | "SUSPENDED" | "INACTIVE";
  created_at: string;
  updated_at: string;
}

export interface CreateLogisticsProviderData {
  tenant_id?: string;
  company_name: string;
  tax_id: string;
  representative_name: string;
  representative_phone: string;
  representative_document: string;
  verification_status?: "PENDING" | "VERIFIED" | "REJECTED";
  verification_documents?: Record<string, unknown>;
  status?: "ACTIVE" | "SUSPENDED" | "INACTIVE";
}

export interface UpdateLogisticsProviderData {
  company_name?: string;
  tax_id?: string;
  representative_name?: string;
  representative_phone?: string;
  representative_document?: string;
  verification_status?: "PENDING" | "VERIFIED" | "REJECTED";
  verification_documents?: Record<string, unknown>;
  status?: "ACTIVE" | "SUSPENDED" | "INACTIVE";
}

export interface LogisticsProvidersFilters {
  search?: string;
  status?: "ACTIVE" | "SUSPENDED" | "INACTIVE";
  verification_status?: "PENDING" | "VERIFIED" | "REJECTED";
  is_global?: boolean;
}

export function useLogisticsProviders(
  filters?: LogisticsProvidersFilters,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["logistics-providers", filters],
    queryFn: async () => {
      const params: Record<string, string | boolean> = {};

      if (filters?.search) {
        params.search = filters.search;
      }
      if (filters?.status) {
        params.status = filters.status;
      }
      if (filters?.verification_status) {
        params.verification_status = filters.verification_status;
      }
      if (filters?.is_global !== undefined) {
        params.is_global = filters.is_global;
      }

      const config = Object.keys(params).length > 0 ? { params } : undefined;
      const response = await apiClient.get<{ data: LogisticsProvider[] }>(
        endpoints.logisticsProviders.list,
        config
      );
      return response.data.data;
    },
    enabled: options?.enabled ?? true,
  });
}

export function useLogisticsProvider(providerId: string) {
  return useQuery({
    queryKey: ["logistics-provider", providerId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: LogisticsProvider }>(
        endpoints.logisticsProviders.get(providerId)
      );
      return response.data.data;
    },
    enabled: !!providerId,
  });
}

export function useCreateLogisticsProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLogisticsProviderData) => {
      const response = await apiClient.post<{ data: LogisticsProvider }>(
        endpoints.logisticsProviders.create,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logistics-providers"] });
    },
  });
}

export function useUpdateLogisticsProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateLogisticsProviderData;
    }) => {
      const response = await apiClient.patch<{ data: LogisticsProvider }>(
        endpoints.logisticsProviders.update(id),
        data
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["logistics-providers"] });
      queryClient.invalidateQueries({
        queryKey: ["logistics-provider", data.id],
      });
    },
  });
}

export function useDeleteLogisticsProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(endpoints.logisticsProviders.delete(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logistics-providers"] });
    },
  });
}
