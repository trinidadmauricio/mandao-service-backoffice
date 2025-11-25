import { render, screen } from '@testing-library/react';
import ProductsPage from '../page';
import { useProducts, useDeleteProduct } from '@/lib/hooks/use-products';
import { usePermissions } from '@/lib/hooks/use-permissions';

// Mock hooks
jest.mock('@/lib/hooks/use-products');
jest.mock('@/lib/hooks/use-permissions');

const mockUseProducts = useProducts as jest.MockedFunction<typeof useProducts>;
const mockUseDeleteProduct = useDeleteProduct as jest.MockedFunction<typeof useDeleteProduct>;
const mockUsePermissions = usePermissions as jest.MockedFunction<typeof usePermissions>;

describe('ProductsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state', () => {
    mockUseProducts.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useProducts>);

    mockUsePermissions.mockReturnValue({
      role: 'OWNER',
      hasPermission: () => true,
      canAccess: () => true,
      getAllowedActions: () => [],
    });

    render(<ProductsPage />);

    expect(screen.getByText('Cargando productos...')).toBeInTheDocument();
  });

  it('should render products list when data is available', () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Producto 1',
        description: 'Descripción 1',
        sku: 'SKU-001',
        status: 'active',
        tenant_id: 'tenant-1',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    ];

    mockUseProducts.mockReturnValue({
      data: { data: mockProducts, total: mockProducts.length },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useProducts>);

    mockUsePermissions.mockReturnValue({
      role: 'OWNER',
      hasPermission: () => true,
      canAccess: () => true,
      getAllowedActions: () => [],
    });

    const mockMutate = jest.fn();
    mockUseDeleteProduct.mockReturnValue({
      mutateAsync: mockMutate,
      isPending: false,
    } as ReturnType<typeof useDeleteProduct>);

    render(<ProductsPage />);

    expect(screen.getByText('Producto 1')).toBeInTheDocument();
    expect(screen.getByText('SKU: SKU-001')).toBeInTheDocument();
  });

  it('should show empty state when no products', () => {
    mockUseProducts.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useProducts>);

    mockUsePermissions.mockReturnValue({
      role: 'OWNER',
      hasPermission: () => true,
      canAccess: () => true,
      getAllowedActions: () => [],
    });

    render(<ProductsPage />);

    expect(screen.getByText(/no hay productos registrados/i)).toBeInTheDocument();
  });
});

