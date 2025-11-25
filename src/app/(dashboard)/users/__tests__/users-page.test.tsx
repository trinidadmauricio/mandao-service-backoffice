import { render, screen } from '@testing-library/react';
import UsersPage from '../page';
import { useUsers, useDeleteUser } from '@/lib/hooks/use-users';
import { usePermissions } from '@/lib/hooks/use-permissions';

// Mock hooks
jest.mock('@/lib/hooks/use-users');
jest.mock('@/lib/hooks/use-permissions');

const mockUseUsers = useUsers as jest.MockedFunction<typeof useUsers>;
const mockUseDeleteUser = useDeleteUser as jest.MockedFunction<typeof useDeleteUser>;
const mockUsePermissions = usePermissions as jest.MockedFunction<typeof usePermissions>;

describe('UsersPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state', () => {
    mockUseUsers.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useUsers>);

    mockUsePermissions.mockReturnValue({
      role: 'OWNER',
      hasPermission: () => true,
      canAccess: () => true,
      getAllowedActions: () => [],
    });

    render(<UsersPage />);

    expect(screen.getByText('Cargando usuarios...')).toBeInTheDocument();
  });

  it('should render error state', () => {
    mockUseUsers.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('API Error'),
    } as ReturnType<typeof useUsers>);

    mockUsePermissions.mockReturnValue({
      role: 'OWNER',
      hasPermission: () => true,
      canAccess: () => true,
      getAllowedActions: () => [],
    });

    render(<UsersPage />);

    expect(screen.getByText(/error al cargar los usuarios/i)).toBeInTheDocument();
  });

  it('should render users list when data is available', () => {
    const mockUsers = [
      {
        id: '1',
        email: 'user1@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'SUPERVISOR',
        active: true,
        email_verified: true,
        tenant_id: 'tenant-1',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      {
        id: '2',
        email: 'user2@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        role: 'MERCHANT_USER',
        active: true,
        email_verified: true,
        tenant_id: 'tenant-1',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    ];

    mockUseUsers.mockReturnValue({
      data: { data: mockUsers, total: mockUsers.length },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useUsers>);

    mockUsePermissions.mockReturnValue({
      role: 'OWNER',
      hasPermission: () => true,
      canAccess: () => true,
      getAllowedActions: () => [],
    });

    const mockMutate = jest.fn();
    mockUseDeleteUser.mockReturnValue({
      mutateAsync: mockMutate,
      isPending: false,
    } as ReturnType<typeof useDeleteUser>);

    render(<UsersPage />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    expect(screen.getByText('user2@example.com')).toBeInTheDocument();
  });

  it('should show empty state when no users', () => {
    mockUseUsers.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useUsers>);

    mockUsePermissions.mockReturnValue({
      role: 'OWNER',
      hasPermission: () => true,
      canAccess: () => true,
      getAllowedActions: () => [],
    });

    render(<UsersPage />);

    expect(screen.getByText(/no hay usuarios registrados/i)).toBeInTheDocument();
  });
});

