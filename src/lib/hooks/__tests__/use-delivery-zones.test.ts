import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDeliveryZones } from '../use-delivery-zones';
import { apiClient } from '@/lib/api/client';

// Mock apiClient
jest.mock('@/lib/api/client');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('useDeliveryZones', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch delivery zones', async () => {
    const mockZones = [
      {
        id: '1',
        name: 'Zona Centro',
        boundary: 'POLYGON(...)',
        base_rate: 5,
        rate_per_km: 1.5,
        tenant_id: 'tenant-1',
        currency: 'USD',
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    ];

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { data: mockZones },
    });

    const { result } = renderHook(() => useDeliveryZones(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('/delivery-zones'));
  });
});

