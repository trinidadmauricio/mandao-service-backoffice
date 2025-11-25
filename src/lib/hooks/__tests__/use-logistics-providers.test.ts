import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useLogisticsProviders,
  useLogisticsProvider,
  useCreateLogisticsProvider,
  useUpdateLogisticsProvider,
  useDeleteLogisticsProvider,
} from '../use-logistics-providers';
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

describe('useLogisticsProviders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch logistics providers', async () => {
    const mockProviders = [
      {
        id: '1',
        company_name: 'Delivery Express',
        tax_id: '12345678901',
        status: 'ACTIVE',
      },
    ];

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { data: mockProviders },
    });

    const { result } = renderHook(() => useLogisticsProviders(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockProviders);
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/logistics-providers')
    );
  });
});

describe('useLogisticsProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch a single logistics provider', async () => {
    const mockProvider = {
      id: '1',
      company_name: 'Delivery Express',
      tax_id: '12345678901',
      status: 'ACTIVE',
    };

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { data: mockProvider },
    });

    const { result } = renderHook(() => useLogisticsProvider('1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockProvider);
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/logistics-providers/1')
    );
  });
});

describe('useCreateLogisticsProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a logistics provider', async () => {
    const mockProvider = {
      id: '1',
      company_name: 'Delivery Express',
      tax_id: '12345678901',
      status: 'ACTIVE',
    };

    (apiClient.post as jest.Mock).mockResolvedValue({
      data: { data: mockProvider },
    });

    const { result } = renderHook(() => useCreateLogisticsProvider(), {
      wrapper: createWrapper(),
    });

    const providerData = {
      company_name: 'Delivery Express',
      tax_id: '12345678901',
      representative_name: 'John Doe',
      representative_phone: '+1234567890',
      representative_document: '12345678',
    };

    result.current.mutate(providerData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      expect.stringContaining('/logistics-providers'),
      providerData
    );
  });
});

describe('useUpdateLogisticsProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update a logistics provider', async () => {
    const mockProvider = {
      id: '1',
      company_name: 'Delivery Express Updated',
      tax_id: '12345678901',
      status: 'ACTIVE',
    };

    (apiClient.patch as jest.Mock).mockResolvedValue({
      data: { data: mockProvider },
    });

    const { result } = renderHook(() => useUpdateLogisticsProvider(), {
      wrapper: createWrapper(),
    });

    const updateData = {
      id: '1',
      data: {
        company_name: 'Delivery Express Updated',
      },
    };

    result.current.mutate(updateData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiClient.patch).toHaveBeenCalledWith(
      expect.stringContaining('/logistics-providers/1'),
      updateData.data
    );
  });
});

describe('useDeleteLogisticsProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a logistics provider', async () => {
    (apiClient.delete as jest.Mock).mockResolvedValue({});

    const { result } = renderHook(() => useDeleteLogisticsProvider(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('1');

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiClient.delete).toHaveBeenCalledWith(
      expect.stringContaining('/logistics-providers/1')
    );
  });
});

