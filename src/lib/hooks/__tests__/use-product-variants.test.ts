import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProductVariants } from '../use-product-variants';
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

describe('useProductVariants', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch product variants', async () => {
    const mockVariants = [
      {
        id: '1',
        product_id: 'product-1',
        sku: 'SKU-001',
        current_stock: 10,
      },
    ];

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { data: mockVariants },
    });

    const { result } = renderHook(
      () => useProductVariants({ product_id: 'product-1' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/product-variants'),
      expect.objectContaining({
        params: { product_id: 'product-1' },
      })
    );
  });
});

