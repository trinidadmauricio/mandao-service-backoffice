import { render, screen } from '@testing-library/react';
import SettingsPage from '../page';
import { useAuth } from '@/lib/hooks/use-auth';
import { useTenant, useUpdateTenant } from '@/lib/hooks/use-tenant';
import type { User } from '@/types/api';

// Mock hooks
jest.mock('@/lib/hooks/use-auth');
jest.mock('@/lib/hooks/use-tenant');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseTenant = useTenant as jest.MockedFunction<typeof useTenant>;
const mockUseUpdateTenant = useUpdateTenant as jest.MockedFunction<typeof useUpdateTenant>;

describe('SettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', tenant_id: 'tenant-1', role: 'OWNER', email: 'test@test.com', first_name: 'Test', last_name: 'User', email_verified: true } as User,
      isAuthenticated: true,
      isLoading: false,
      role: 'OWNER',
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    });

    mockUseTenant.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useTenant>);

    render(<SettingsPage />);

    expect(screen.getByText('Cargando configuración...')).toBeInTheDocument();
  });

  it('should render tenant settings form when data is available', () => {
    const mockTenant = {
      id: 'tenant-1',
      name: 'Test Tenant',
      default_currency: 'USD',
      default_locale: 'es',
    };

    mockUseAuth.mockReturnValue({
      user: { id: '1', tenant_id: 'tenant-1', role: 'OWNER', email: 'test@test.com', first_name: 'Test', last_name: 'User', email_verified: true } as User,
      isAuthenticated: true,
      isLoading: false,
      role: 'OWNER',
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    });

    mockUseTenant.mockReturnValue({
      data: mockTenant,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useTenant>);

    const mockMutate = jest.fn();
    mockUseUpdateTenant.mockReturnValue({
      mutateAsync: mockMutate,
      isPending: false,
    } as ReturnType<typeof useUpdateTenant>);

    render(<SettingsPage />);

    expect(screen.getByText('Configuración')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre del Tenant')).toBeInTheDocument();
    expect(screen.getByLabelText('Moneda por Defecto')).toBeInTheDocument();
  });

  it('should not render for non-OWNER users', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', tenant_id: 'tenant-1', role: 'SUPERVISOR', email: 'test@test.com', first_name: 'Test', last_name: 'User', email_verified: true } as User,
      isAuthenticated: true,
      isLoading: false,
      role: 'SUPERVISOR',
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    });

    mockUseTenant.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useTenant>);

    render(<SettingsPage />);

    expect(screen.getByText(/no tienes permisos/i)).toBeInTheDocument();
  });
});

