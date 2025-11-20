import { render, screen, waitFor } from '@testing-library/react';
import DriversPage from '../page';
import { useDrivers, useDeleteDriver } from '@/lib/hooks/use-drivers';
import { usePermissions } from '@/lib/hooks/use-permissions';

// Mock hooks
jest.mock('@/lib/hooks/use-drivers');
jest.mock('@/lib/hooks/use-permissions');

const mockUseDrivers = useDrivers as jest.MockedFunction<typeof useDrivers>;
const mockUseDeleteDriver = useDeleteDriver as jest.MockedFunction<typeof useDeleteDriver>;
const mockUsePermissions = usePermissions as jest.MockedFunction<typeof usePermissions>;

describe('DriversPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state', () => {
    mockUseDrivers.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useDrivers>);

    mockUsePermissions.mockReturnValue({
      role: 'OWNER',
      hasPermission: () => true,
      canAccess: () => true,
      getAllowedActions: () => [],
    });

    render(<DriversPage />);

    expect(screen.getByText('Cargando drivers...')).toBeInTheDocument();
  });

  it('should render drivers list when data is available', () => {
    const mockDrivers = [
      {
        id: '1',
        user_id: 'user-1',
        logistics_provider_id: 'provider-1',
        identity_document: '12345678',
        driving_license: 'LIC-001',
        date_of_birth: '1990-01-01',
        emergency_contact: { name: 'John Doe', phone: '123456789' },
        has_own_vehicle: false,
        work_type: 'FULL_TIME' as const,
        availability_status: 'AVAILABLE' as const,
        total_deliveries: 10,
        documents: {},
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        user: {
          id: 'user-1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
        },
      },
    ];

    mockUseDrivers.mockReturnValue({
      data: mockDrivers as any,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useDrivers>);

    mockUsePermissions.mockReturnValue({
      role: 'OWNER',
      hasPermission: () => true,
      canAccess: () => true,
      getAllowedActions: () => [],
    });

    const mockMutate = jest.fn();
    mockUseDeleteDriver.mockReturnValue({
      mutateAsync: mockMutate,
      isPending: false,
    } as any);

    render(<DriversPage />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
});

