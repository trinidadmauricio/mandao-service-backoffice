import { render, screen, waitFor } from '@testing-library/react';
import BranchesPage from '../page';
import { useBranches, useDeleteBranch } from '@/lib/hooks/use-branches';
import { usePermissions } from '@/lib/hooks/use-permissions';

// Mock hooks
jest.mock('@/lib/hooks/use-branches');
jest.mock('@/lib/hooks/use-permissions');

const mockUseBranches = useBranches as jest.MockedFunction<typeof useBranches>;
const mockUseDeleteBranch = useDeleteBranch as jest.MockedFunction<typeof useDeleteBranch>;
const mockUsePermissions = usePermissions as jest.MockedFunction<typeof usePermissions>;

describe('BranchesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state', () => {
    mockUseBranches.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useBranches>);

    mockUsePermissions.mockReturnValue({
      role: 'OWNER',
      hasPermission: () => true,
      canAccess: () => true,
      getAllowedActions: () => [],
    });

    render(<BranchesPage />);

    expect(screen.getByText('Cargando sucursales...')).toBeInTheDocument();
  });

  it('should render branches list when data is available', () => {
    const mockBranches = [
      {
        id: '1',
        name: 'Sucursal Centro',
        address: 'Calle Principal 123',
        gps_lat: 19.432608,
        gps_lng: -99.133209,
        contact_phone: '+1234567890',
        is_main: true,
        status: 'ACTIVE' as const,
        tenant_id: 'tenant-1',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    ];

    mockUseBranches.mockReturnValue({
      data: mockBranches as any,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useBranches>);

    mockUsePermissions.mockReturnValue({
      role: 'OWNER',
      hasPermission: () => true,
      canAccess: () => true,
      getAllowedActions: () => [],
    });

    const mockMutate = jest.fn();
    mockUseDeleteBranch.mockReturnValue({
      mutateAsync: mockMutate,
      isPending: false,
    } as any);

    render(<BranchesPage />);

    expect(screen.getByText('Sucursal Centro')).toBeInTheDocument();
    expect(screen.getByText('Calle Principal 123')).toBeInTheDocument();
  });
});

