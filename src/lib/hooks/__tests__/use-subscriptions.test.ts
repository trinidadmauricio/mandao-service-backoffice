import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useSubscriptionLimits,
  useChangePlan,
  useStartTrial,
  useConvertTrial,
} from '../use-subscriptions';
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

describe('useSubscriptionLimits', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch subscription limits', async () => {
    const mockLimits = {
      max_products: 100,
      max_orders_month: 1000,
      max_branches: 10,
      current_products: 50,
      current_orders_month: 500,
      current_branches: 5,
    };

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { data: mockLimits },
    });

    const { result } = renderHook(() => useSubscriptionLimits(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockLimits);
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/subscriptions/limits')
    );
  });
});

describe('useChangePlan', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should change subscription plan', async () => {
    (apiClient.post as jest.Mock).mockResolvedValue({});

    const { result } = renderHook(() => useChangePlan(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('plan-1');

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      expect.stringContaining('/subscriptions/change-plan'),
      { plan_id: 'plan-1' }
    );
  });
});

describe('useStartTrial', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should start a trial', async () => {
    (apiClient.post as jest.Mock).mockResolvedValue({});

    const { result } = renderHook(() => useStartTrial(), {
      wrapper: createWrapper(),
    });

    const trialData = {
      plan_id: 'plan-1',
      trial_days: 14,
    };

    result.current.mutate(trialData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      expect.stringContaining('/subscriptions/start-trial'),
      trialData
    );
  });
});

describe('useConvertTrial', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should convert trial to paid plan', async () => {
    (apiClient.post as jest.Mock).mockResolvedValue({});

    const { result } = renderHook(() => useConvertTrial(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('pm_1234567890');

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      expect.stringContaining('/subscriptions/convert-trial'),
      { payment_method_id: 'pm_1234567890' }
    );
  });
});

