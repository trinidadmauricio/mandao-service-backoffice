import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDeliveryRates, useCreateDeliveryRate } from '../use-delivery-rates';
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
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useDeliveryRates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch delivery rates', async () => {
    const mockRates = [
      {
        id: '1',
        vehicle_type: 'MOTORCYCLE' as const,
        distance_km_min: 0,
        distance_km_max: 5,
        base_price: 5,
        price_per_km: 1.5,
        tenant_id: 'tenant-1',
        currency: 'USD',
        priority_multiplier: { NORMAL: 1, EXPRESS: 1.5 },
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    ];

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { data: mockRates },
    });

    const { result } = renderHook(() => useDeliveryRates(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('/delivery-rates'));
  });
});

