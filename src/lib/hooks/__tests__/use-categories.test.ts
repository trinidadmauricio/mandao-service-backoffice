import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCategories, useCreateCategory } from '../use-categories';
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

describe('useCategories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch categories', async () => {
    const mockCategories = [
      {
        id: '1',
        name: 'Categoría 1',
        tenant_id: 'tenant-1',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    ];

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { data: mockCategories },
    });

    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('/categories'));
  });
});

