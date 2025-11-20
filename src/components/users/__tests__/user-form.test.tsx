import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserForm } from '../user-form';
import { useCreateUser, useUpdateUser, useUser } from '@/lib/hooks/use-users';

// Mock hooks
jest.mock('@/lib/hooks/use-users');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

const mockUseCreateUser = useCreateUser as jest.MockedFunction<typeof useCreateUser>;
const mockUseUpdateUser = useUpdateUser as jest.MockedFunction<typeof useUpdateUser>;
const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;

describe('UserForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render create form', () => {
    mockUseCreateUser.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    } as any);

    mockUseUser.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as any);

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
      data: mockUser as any,
      isLoading: false,
      error: null,
    } as any);

    mockUseUpdateUser.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    } as any);

    render(<UserForm userId="1" />);

    expect(screen.getByText('Editar Usuario')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('user@example.com')).toBeInTheDocument();
  });

  it('should show validation errors', async () => {
    const user = userEvent.setup();
    mockUseCreateUser.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    } as any);

    mockUseUser.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as any);

    render(<UserForm />);

    const submitButton = screen.getByRole('button', { name: /crear/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/el nombre es requerido/i)).toBeInTheDocument();
    });
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
      data: mockUser as any,
      isLoading: false,
      error: null,
    } as any);

    mockUseUpdateUser.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    } as any);

    render(<UserForm userId="1" />);

    const emailInput = screen.getByLabelText('Email *');
    expect(emailInput).toBeDisabled();
  });
});

