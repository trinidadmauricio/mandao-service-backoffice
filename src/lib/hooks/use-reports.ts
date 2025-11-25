import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';

export interface OrdersReportFilters {
  start_date?: string;
  end_date?: string;
  status?: string;
}

export interface InventoryReportFilters {
  category_id?: string;
  low_stock?: boolean;
}

export interface DriversReportFilters {
  start_date?: string;
  end_date?: string;
  driver_id?: string;
}

export interface OrdersReportData {
  summary?: {
    total_orders?: number;
    total_revenue?: number;
    average_order_value?: number;
    orders_by_status?: Record<string, number>;
  };
  orders?: Array<{
    id: string;
    order_number: string;
    status: string;
    total_amount?: number;
    created_at: string;
  }>;
}

export interface InventoryReportData {
  summary: {
    total_products: number;
    low_stock_count: number;
    out_of_stock_count: number;
  };
  products: Array<{
    id: string;
    name: string;
    sku: string;
    stock_quantity: number;
    min_stock_level: number;
    category_name?: string;
  }>;
}

export interface DriversReportData {
  summary: {
    total_drivers: number;
    total_deliveries: number;
    average_rating: number;
  };
  drivers: Array<{
    id: string;
    name: string;
    total_deliveries: number;
    rating_avg: number;
    total_revenue: number;
  }>;
}

export function useOrdersReport(filters?: OrdersReportFilters) {
  return useQuery({
    queryKey: ['orders-report', filters],
    queryFn: async () => {
      const response = await apiClient.get<{ data: OrdersReportData }>(
        endpoints.reports.orders,
        {
          params: filters,
        }
      );
      return response.data.data;
    },
  });
}

export function useInventoryReport(filters?: InventoryReportFilters) {
  return useQuery({
    queryKey: ['inventory-report', filters],
    queryFn: async () => {
      const response = await apiClient.get<{ data: InventoryReportData }>(
        endpoints.reports.inventory,
        {
          params: filters,
        }
      );
      return response.data.data;
    },
  });
}

export function useDriversReport(filters?: DriversReportFilters) {
  return useQuery({
    queryKey: ['drivers-report', filters],
    queryFn: async () => {
      const response = await apiClient.get<{ data: DriversReportData }>(
        endpoints.reports.drivers,
        {
          params: filters,
        }
      );
      return response.data.data;
    },
  });
}

export function useExportOrdersCSV(filters?: OrdersReportFilters) {
  return async () => {
    const response = await apiClient.get(endpoints.reports.ordersExport, {
      params: filters,
      responseType: 'blob',
    });
    
    // Crear un blob y descargarlo
    const blob = new Blob([response.data as BlobPart], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };
}

