import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useOrdersReport,
  useInventoryReport,
  useDriversReport,
  useExportOrdersCSV,
} from '../use-reports';
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

describe('useOrdersReport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch orders report with filters', async () => {
    const mockReport = {
      summary: {
        total_orders: 100,
        total_revenue: 10000,
        average_order_value: 100,
        orders_by_status: { PENDING: 50, DELIVERED: 50 },
      },
      orders: [],
    };

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { data: mockReport },
    });

    const { result } = renderHook(
      () => useOrdersReport({ start_date: '2024-01-01', end_date: '2024-01-31' }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockReport);
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/reports/orders'),
      expect.objectContaining({
        params: { start_date: '2024-01-01', end_date: '2024-01-31' },
      })
    );
  });
});

describe('useInventoryReport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch inventory report', async () => {
    const mockReport = {
      summary: {
        total_products: 50,
        low_stock_count: 5,
        out_of_stock_count: 2,
      },
      products: [],
    };

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { data: mockReport },
    });

    const { result } = renderHook(() => useInventoryReport({ low_stock: true }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockReport);
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/reports/inventory'),
      expect.objectContaining({
        params: { low_stock: true },
      })
    );
  });
});

describe('useDriversReport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch drivers report', async () => {
    const mockReport = {
      summary: {
        total_drivers: 10,
        total_deliveries: 500,
        average_rating: 4.5,
      },
      drivers: [],
    };

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { data: mockReport },
    });

    const { result } = renderHook(
      () => useDriversReport({ start_date: '2024-01-01', end_date: '2024-01-31' }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockReport);
    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/reports/drivers'),
      expect.objectContaining({
        params: { start_date: '2024-01-01', end_date: '2024-01-31' },
      })
    );
  });
});

describe('useExportOrdersCSV', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window methods
    global.URL.createObjectURL = jest.fn(() => 'blob:url');
    global.URL.revokeObjectURL = jest.fn();
    document.createElement = jest.fn(() => ({
      href: '',
      download: '',
      click: jest.fn(),
    })) as any;
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
  });

  it('should export orders to CSV', async () => {
    const mockBlob = new Blob(['csv,data'], { type: 'text/csv' });
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: mockBlob,
    });

    const exportCSV = useExportOrdersCSV({ start_date: '2024-01-01' });
    await exportCSV();

    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/reports/orders/export'),
      expect.objectContaining({
        params: { start_date: '2024-01-01' },
        responseType: 'blob',
      })
    );
  });
});

