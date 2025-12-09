import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import { useTenantEnabled } from './use-tenant-enabled';

export interface SubscriptionLimits {
  max_products: number;
  max_orders_month: number;
  max_branches: number;
  current_products: number;
  current_orders_month: number;
  current_branches: number;
}

export interface Subscription {
  id: string;
  tenant_id: string;
  plan_id: string;
  status: 'ACTIVE' | 'TRIAL' | 'CANCELLED' | 'EXPIRED';
  current_period_start: string;
  current_period_end: string;
  trial_start?: string;
  trial_end?: string;
  created_at: string;
  updated_at: string;
}

export function useSubscriptionLimits() {
  const tenantEnabled = useTenantEnabled();
  
  return useQuery({
    queryKey: ['subscription-limits'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: SubscriptionLimits }>(
        endpoints.subscriptions.limits
      );
      return response.data.data;
    },
    enabled: tenantEnabled,
  });
}

export function useChangePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string) => {
      await apiClient.post(endpoints.subscriptions.changePlan, {
        plan_id: planId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-limits'] });
      queryClient.invalidateQueries({ queryKey: ['tenant'] });
    },
  });
}

export function useStartTrial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { plan_id: string; trial_days: number }) => {
      await apiClient.post(endpoints.subscriptions.startTrial, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-limits'] });
      queryClient.invalidateQueries({ queryKey: ['tenant'] });
    },
  });
}

export function useConvertTrial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentMethodId: string) => {
      await apiClient.post(endpoints.subscriptions.convertTrial, {
        payment_method_id: paymentMethodId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-limits'] });
      queryClient.invalidateQueries({ queryKey: ['tenant'] });
    },
  });
}

