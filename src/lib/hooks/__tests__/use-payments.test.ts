import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  usePaymentsTransactions,
  useOrderPayments,
  useRefund,
} from '../use-payments';
import { apiClient } from '@/lib/api/client';

// Mock dependencies
jest.mock('@/lib/api/client');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  Wrapper.displayName = 'QueryClientWrapper';
  return Wrapper;};

describe('usePaymentsTransactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch payment transactions with filters', async () => {
    const mockTransactions = [
      {
        id: '1',
        order_id: 'order-1',
        amount: 100.5,
        currency: 'USD',
        status: 'COMPLETED',
        transaction_type: 'CHARGE',
        payment_method: 'CARD',
      },
    ];

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { data: mockTransactions },
    });

    const { result } = renderHook(
      () => usePaymentsTransactions({ status: 'COMPLETED' }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockTransactions);
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/payments/transactions'),
      expect.objectContaining({
        params: { status: 'COMPLETED' },
      })
    );
  });
});

describe('useOrderPayments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch payments for an order', async () => {
    const mockPayments = [
      {
        id: '1',
        order_id: 'order-1',
        amount: 100.5,
        currency: 'USD',
        status: 'COMPLETED',
      },
    ];

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { data: mockPayments },
    });

    const { result } = renderHook(() => useOrderPayments('order-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockPayments);
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/payments/orders/order-1/payments')
    );
  });
});

describe('useRefund', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a refund', async () => {
    const mockRefund = {
      id: '1',
      transaction_type: 'REFUND',
      amount: 50.25,
      currency: 'USD',
    };

    (apiClient.post as jest.Mock).mockResolvedValue({
      data: { data: mockRefund },
    });

    const { result } = renderHook(() => useRefund(), {
      wrapper: createWrapper(),
    });

    const refundData = {
      payment_transaction_id: 'transaction-1',
      amount: 50.25,
      reason: 'requested_by_customer' as const,
    };

    result.current.mutate(refundData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      expect.stringContaining('/payments/refunds'),
      refundData
    );
  });
});

