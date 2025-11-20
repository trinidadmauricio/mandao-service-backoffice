import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from '../page';
import { useDashboardKPIs } from '@/lib/hooks/use-dashboard-kpis';
import { useOrdersReport } from '@/lib/hooks/use-orders-report';

// Mock hooks
jest.mock('@/lib/hooks/use-dashboard-kpis');
jest.mock('@/lib/hooks/use-orders-report');

const mockUseDashboardKPIs = useDashboardKPIs as jest.MockedFunction<typeof useDashboardKPIs>;
const mockUseOrdersReport = useOrdersReport as jest.MockedFunction<typeof useOrdersReport>;

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state', () => {
    mockUseDashboardKPIs.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useDashboardKPIs>);

    mockUseOrdersReport.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useOrdersReport>);

    render(<DashboardPage />);

    expect(screen.getByText('Cargando KPIs...')).toBeInTheDocument();
  });

  it('should render error state', () => {
    mockUseDashboardKPIs.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('API Error'),
    } as ReturnType<typeof useDashboardKPIs>);

    mockUseOrdersReport.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useOrdersReport>);

    render(<DashboardPage />);

    expect(screen.getByText(/error al cargar los kpis/i)).toBeInTheDocument();
  });

  it('should render KPIs when data is available', () => {
    const mockKPIs = {
      total_orders: 100,
      total_revenue: 50000,
      average_order_value: 500,
      active_drivers: 5,
    };

    mockUseDashboardKPIs.mockReturnValue({
      data: mockKPIs,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useDashboardKPIs>);

    mockUseOrdersReport.mockReturnValue({
      data: {
        orders_by_date: [],
        orders_by_status: [],
        revenue_by_date: [],
        top_products: [],
      },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useOrdersReport>);

    render(<DashboardPage />);

    expect(screen.getByText('Total de Órdenes')).toBeInTheDocument();
    expect(screen.getByText('Revenue Total')).toBeInTheDocument();
    expect(screen.getByText('Valor Promedio')).toBeInTheDocument();
    expect(screen.getByText('Drivers Activos')).toBeInTheDocument();
  });

  it('should render period filter buttons', () => {
    mockUseDashboardKPIs.mockReturnValue({
      data: {
        total_orders: 0,
        total_revenue: 0,
        average_order_value: 0,
        active_drivers: 0,
      },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useDashboardKPIs>);

    mockUseOrdersReport.mockReturnValue({
      data: {
        orders_by_date: [],
        orders_by_status: [],
        revenue_by_date: [],
        top_products: [],
      },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useOrdersReport>);

    render(<DashboardPage />);

    expect(screen.getByText('Hoy')).toBeInTheDocument();
    expect(screen.getByText('Esta Semana')).toBeInTheDocument();
    expect(screen.getByText('Este Mes')).toBeInTheDocument();
    expect(screen.getByText('Este Año')).toBeInTheDocument();
  });
});

