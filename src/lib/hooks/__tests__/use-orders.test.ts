import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useOrders, useOrder, useCreateOnDemandOrder, useCreateRetailOrder } from '../use-orders';
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
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useOrders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch orders with filters', async () => {
    const mockOrders = [
      {
        id: '1',
        order_number: 'ORD-000001',
        order_display_number: 'ORD-000001',
        status: 'PENDING',
        order_type: 'ON_DEMAND',
      },
    ];

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { data: mockOrders },
    });

    const { result } = renderHook(() => useOrders({ status: 'PENDING' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockOrders);
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/orders'),
      expect.objectContaining({
        params: { status: 'PENDING' },
      })
    );
  });

  it('should fetch orders without filters', async () => {
    const mockOrders = [];

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { data: mockOrders },
    });

    const { result } = renderHook(() => useOrders(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockOrders);
  });
});

describe('useOrder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch a single order', async () => {
    const mockOrder = {
      id: '1',
      order_number: 'ORD-000001',
      order_display_number: 'ORD-000001',
      status: 'PENDING',
      order_type: 'ON_DEMAND',
    };

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { data: mockOrder },
    });

    const { result } = renderHook(() => useOrder('1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockOrder);
    expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('/orders/1'));
  });

  it('should not fetch when orderId is empty', () => {
    const { result } = renderHook(() => useOrder(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(apiClient.get).not.toHaveBeenCalled();
  });
});

describe('useCreateOnDemandOrder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an on-demand order', async () => {
    const mockOrder = {
      id: '1',
      order_number: 'ORD-000001',
      status: 'PENDING',
    };

    (apiClient.post as jest.Mock).mockResolvedValue({
      data: { data: mockOrder },
    });

    const { result } = renderHook(() => useCreateOnDemandOrder(), {
      wrapper: createWrapper(),
    });

    const orderData = {
      customer_snapshot: { name: 'John Doe' },
      delivery_address: { street: '123 Main St' },
      delivery_lat: 40.7128,
      delivery_lng: -74.006,
      estimated_delivery_at: '2024-01-20T12:00:00Z',
      items: [],
    };

    result.current.mutate(orderData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      expect.stringContaining('/orders'),
      orderData
    );
  });
});

describe('useCreateRetailOrder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a retail order', async () => {
    const mockOrder = {
      id: '1',
      order_number: 'ORD-000001',
      status: 'PENDING',
    };

    (apiClient.post as jest.Mock).mockResolvedValue({
      data: { data: mockOrder },
    });

    const { result } = renderHook(() => useCreateRetailOrder(), {
      wrapper: createWrapper(),
    });

    const orderData = {
      customer_snapshot: { name: 'John Doe' },
      delivery_address: { street: '123 Main St' },
      delivery_lat: 40.7128,
      delivery_lng: -74.006,
      branch_id: 'branch-1',
      estimated_delivery_at: '2024-01-20T12:00:00Z',
      items: [],
    };

    result.current.mutate(orderData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      expect.stringContaining('/orders/retail'),
      orderData
    );
  });
});

