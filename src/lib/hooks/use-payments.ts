import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';

export interface PaymentTransaction {
  id: string;
  tenant_id: string;
  order_id: string;
  transaction_type: 'CHARGE' | 'REFUND' | 'AUTHORIZATION' | 'CAPTURE';
  payment_method: 'CARD' | 'CASH' | 'TRANSFER' | 'WALLET';
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  payment_intent_id?: string;
  charge_id?: string;
  refund_id?: string;
  card_last4?: string;
  card_brand?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PaymentTransactionsFilters {
  order_id?: string;
  transaction_type?: PaymentTransaction['transaction_type'];
  payment_method?: PaymentTransaction['payment_method'];
  status?: PaymentTransaction['status'];
  start_date?: string;
  end_date?: string;
}

export function usePaymentsTransactions(filters?: PaymentTransactionsFilters) {
  return useQuery({
    queryKey: ['payments-transactions', filters],
    queryFn: async () => {
      // El endpoint POST crea transacciones, pero necesitamos un GET para listarlas
      // Por ahora, usamos el endpoint de transacciones con método GET (si existe)
      // Si no existe, necesitaríamos crear un endpoint específico para listar
      const response = await apiClient.get<{ data: PaymentTransaction[] }>(
        endpoints.payments.transactions,
        {
          params: filters,
        }
      );
      return response.data.data;
    },
  });
}

export function useOrderPayments(orderId: string) {
  return useQuery({
    queryKey: ['order-payments', orderId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: PaymentTransaction[] }>(
        endpoints.payments.orderPayments(orderId)
      );
      return response.data.data;
    },
    enabled: !!orderId,
  });
}

export function useRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      payment_transaction_id: string;
      amount?: number;
      reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
    }) => {
      const response = await apiClient.post<{ data: PaymentTransaction }>(
        endpoints.payments.refunds,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments-transactions'] });
    },
  });
}

