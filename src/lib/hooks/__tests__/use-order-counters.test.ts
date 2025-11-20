import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useOrderCounter,
  useCreateOrderCounter,
  useUpdateOrderCounter,
  useIncrementOrderCounter,
} from '../use-order-counters';
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

describe('useOrderCounter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch order counter for tenant', async () => {
    const mockCounter = {
      id: '1',
      tenant_id: 'tenant-1',
      current_value: 100,
      prefix: 'ORD',
      padding_length: 6,
    };

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { data: mockCounter },
    });

    const { result } = renderHook(() => useOrderCounter('tenant-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockCounter);
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/order-counters/tenant/tenant-1')
    );
  });
});

describe('useCreateOrderCounter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an order counter', async () => {
    const mockCounter = {
      id: '1',
      tenant_id: 'tenant-1',
      current_value: 0,
      prefix: 'ORD',
      padding_length: 6,
    };

    (apiClient.post as jest.Mock).mockResolvedValue({
      data: { data: mockCounter },
    });

    const { result } = renderHook(() => useCreateOrderCounter(), {
      wrapper: createWrapper(),
    });

    const counterData = {
      tenant_id: 'tenant-1',
      prefix: 'ORD',
      padding_length: 6,
    };

    result.current.mutate(counterData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      expect.stringContaining('/order-counters'),
      counterData
    );
  });
});

describe('useUpdateOrderCounter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update an order counter', async () => {
    const mockCounter = {
      id: '1',
      tenant_id: 'tenant-1',
      current_value: 200,
      prefix: 'ORD',
      padding_length: 6,
    };

    (apiClient.patch as jest.Mock).mockResolvedValue({
      data: { data: mockCounter },
    });

    const { result } = renderHook(() => useUpdateOrderCounter(), {
      wrapper: createWrapper(),
    });

    const updateData = {
      tenantId: 'tenant-1',
      data: {
        current_value: 200,
        prefix: 'ORD',
      },
    };

    result.current.mutate(updateData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiClient.patch).toHaveBeenCalledWith(
      expect.stringContaining('/order-counters/tenant/tenant-1'),
      updateData.data
    );
  });
});

describe('useIncrementOrderCounter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should increment order counter', async () => {
    (apiClient.post as jest.Mock).mockResolvedValue({
      data: { data: { new_value: 101 } },
    });

    const { result } = renderHook(() => useIncrementOrderCounter(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('tenant-1');

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      expect.stringContaining('/order-counters/tenant/tenant-1/increment')
    );
  });
});

