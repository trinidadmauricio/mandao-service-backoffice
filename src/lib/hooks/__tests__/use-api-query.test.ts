import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useApiQuery } from '../use-api-query';
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

describe('useApiQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch data from API', async () => {
    const mockData = { id: '1', name: 'Test' };
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { data: mockData },
    });

    const { result } = renderHook(
      () => useApiQuery(['test'], '/api/v1/test'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/test');
  });

  it('should handle errors', async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(
      () => useApiQuery(['test'], '/api/v1/test'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

