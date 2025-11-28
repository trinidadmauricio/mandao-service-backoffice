import { render, screen } from '@testing-library/react';
import type { User } from '@/types/api';
import { UserForm } from '../user-form';
import { useCreateUser, useUpdateUser, useUser } from '@/lib/hooks/use-users';
import { useAuth } from '@/lib/hooks/use-auth';
import { USER_ROLE } from '@/lib/constants/roles';

// Mock hooks
jest.mock('@/lib/hooks/use-users');
jest.mock('@/lib/hooks/use-auth');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockUseCreateUser = useCreateUser as jest.MockedFunction<typeof useCreateUser>;
const mockUseUpdateUser = useUpdateUser as jest.MockedFunction<typeof useUpdateUser>;
const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('UserForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock hooks por defecto
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
    } as ReturnType<typeof useAuth>);

    mockUseCreateUser.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    } as ReturnType<typeof useCreateUser>);

    mockUseUpdateUser.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    } as ReturnType<typeof useUpdateUser>);
  });

  it('should render create form', () => {
    mockUseCreateUser.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    } as ReturnType<typeof useCreateUser>);

    mockUseUser.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useUser>);

    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
    } as ReturnType<typeof useAuth>);

    render(<UserForm />);

    expect(screen.getByText('Nuevo Usuario')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre *')).toBeInTheDocument();
    expect(screen.getByLabelText('Email *')).toBeInTheDocument();
  });

  it('should render edit form when userId is provided', () => {
    const mockUser = {
      id: '1',
      email: 'user@example.com',
      first_name: 'John',
      last_name: 'Doe',
      phone: '1234567890',
      role: 'SUPERVISOR',
      active: true,
      email_verified: true,
      tenant_id: 'tenant-1',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    mockUseUser.mockReturnValue({
      data: mockUser as User,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useUser>);

    mockUseUpdateUser.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    } as ReturnType<typeof useUpdateUser>);

    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
    } as ReturnType<typeof useAuth>);

    render(<UserForm userId="1" />);

    expect(screen.getByText('Editar Usuario')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('user@example.com')).toBeInTheDocument();
  });

  it('should show form fields', () => {
    mockUseCreateUser.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    } as ReturnType<typeof useCreateUser>);

    mockUseUser.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useUser>);

    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
    } as ReturnType<typeof useAuth>);

    render(<UserForm />);

    expect(screen.getByLabelText('Nombre *')).toBeInTheDocument();
    expect(screen.getByLabelText('Email *')).toBeInTheDocument();
  });

  it('should disable email field when editing', () => {
    const mockUser = {
      id: '1',
      email: 'user@example.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'SUPERVISOR',
      active: true,
      email_verified: true,
      tenant_id: 'tenant-1',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    mockUseUser.mockReturnValue({
      data: mockUser as User,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useUser>);

    mockUseUpdateUser.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    } as ReturnType<typeof useUpdateUser>);

    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
    } as ReturnType<typeof useAuth>);

    render(<UserForm userId="1" />);

    const emailInput = screen.getByLabelText('Email *');
    expect(emailInput).toBeDisabled();
  });

  describe('DRIVER role creation', () => {
    beforeEach(() => {
      mockUseCreateUser.mockReturnValue({
        mutateAsync: jest.fn().mockResolvedValue({}),
        isPending: false,
      } as ReturnType<typeof useCreateUser>);

      mockUseUser.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      } as ReturnType<typeof useUser>);
    });

    it('should render form for LOGISTICS_PROVIDER with DRIVER option', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '1',
          email: 'provider@example.com',
          role: USER_ROLE.LOGISTICS_PROVIDER,
          logistics_provider_id: 'provider-id',
        } as User,
        isLoading: false,
      } as ReturnType<typeof useAuth>);

      render(<UserForm />);

      const roleSelect = screen.getByLabelText('Rol *');
      expect(roleSelect).toBeInTheDocument();
      expect(screen.getByText('Nuevo Usuario')).toBeInTheDocument();
    });

    it('should render form for SUPERVISOR with DRIVER option', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '1',
          email: 'supervisor@example.com',
          role: USER_ROLE.SUPERVISOR,
          logistics_provider_id: 'provider-id',
        } as User,
        isLoading: false,
      } as ReturnType<typeof useAuth>);

      render(<UserForm />);

      const roleSelect = screen.getByLabelText('Rol *');
      expect(roleSelect).toBeInTheDocument();
      expect(screen.getByText('Nuevo Usuario')).toBeInTheDocument();
    });
  });
});

