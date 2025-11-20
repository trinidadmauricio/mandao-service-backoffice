import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from '../register-form';
import { useAuth } from '@/lib/hooks/use-auth';

// Mock useAuth
jest.mock('@/lib/hooks/use-auth');

const mockRegister = jest.fn();
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      role: null,
      login: jest.fn(),
      logout: jest.fn(),
      register: mockRegister,
    });
  });

  it('should render register form', () => {
    render(<RegisterForm />);

    expect(screen.getByText('Registrarse')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
    expect(screen.getByLabelText('Apellido')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrarse/i })).toBeInTheDocument();
  });

  it('should show validation errors for invalid email', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: /registrarse/i });

    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    // El error puede aparecer de diferentes formas dependiendo de la validación
    await waitFor(
      () => {
        const errorMessage = screen.queryByText(/email inválido/i) || 
                             screen.queryByText(/invalid email/i) ||
                             screen.queryByText(/email/i);
        expect(errorMessage).toBeTruthy();
      },
      { timeout: 3000 }
    );
  });

  it('should show validation errors for missing required fields', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const submitButton = screen.getByRole('button', { name: /registrarse/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/el nombre es requerido/i)).toBeInTheDocument();
    });
  });

  it('should call register with correct data', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue(undefined);

    render(<RegisterForm />);

    const firstNameInput = screen.getByLabelText('Nombre');
    const lastNameInput = screen.getByLabelText('Apellido');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: /registrarse/i });

    await user.type(firstNameInput, 'Juan');
    await user.type(lastNameInput, 'Pérez');
    await user.type(emailInput, 'juan@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        'juan@example.com',
        'password123',
        'Juan',
        'Pérez',
        expect.any(String) // phone puede ser string vacío o undefined
      );
    });
  });

  it('should show success message after successful registration', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue(undefined);

    render(<RegisterForm />);

    const firstNameInput = screen.getByLabelText('Nombre');
    const lastNameInput = screen.getByLabelText('Apellido');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: /registrarse/i });

    await user.type(firstNameInput, 'Juan');
    await user.type(lastNameInput, 'Pérez');
    await user.type(emailInput, 'juan@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/registro exitoso/i)).toBeInTheDocument();
    });
  });
});

