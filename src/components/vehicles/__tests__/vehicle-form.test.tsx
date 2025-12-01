import { render, screen } from '@testing-library/react';
import { VehicleForm } from '../vehicle-form';
import { useCreateVehicle, useUpdateVehicle, useVehicle } from '@/lib/hooks/use-vehicles';
import { useLogisticsProviders } from '@/lib/hooks/use-logistics-providers';
import { useDrivers } from '@/lib/hooks/use-drivers';
import { useAuth } from '@/lib/hooks/use-auth';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock hooks
jest.mock('@/lib/hooks/use-vehicles');
jest.mock('@/lib/hooks/use-logistics-providers');
jest.mock('@/lib/hooks/use-drivers');
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

const mockUseCreateVehicle = useCreateVehicle as jest.MockedFunction<typeof useCreateVehicle>;
const mockUseUpdateVehicle = useUpdateVehicle as jest.MockedFunction<typeof useUpdateVehicle>;
const mockUseVehicle = useVehicle as jest.MockedFunction<typeof useVehicle>;
const mockUseLogisticsProviders = useLogisticsProviders as jest.MockedFunction<typeof useLogisticsProviders>;
const mockUseDrivers = useDrivers as jest.MockedFunction<typeof useDrivers>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('VehicleForm', () => {
  const defaultMutationReturn = {
    mutateAsync: jest.fn(),
    mutate: jest.fn(),
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
    data: undefined,
    reset: jest.fn(),
    status: 'idle' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseCreateVehicle.mockReturnValue(defaultMutationReturn as any);
    mockUseUpdateVehicle.mockReturnValue(defaultMutationReturn as any);
    mockUseVehicle.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as any);
    mockUseLogisticsProviders.mockReturnValue({
      data: [
        { id: 'provider-1', company_name: 'Provider 1' },
        { id: 'provider-2', company_name: 'Provider 2' },
      ],
    } as any);
    mockUseDrivers.mockReturnValue({
      data: { data: [] },
    } as any);
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      role: null,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    });
  });

  it('should hide logistics_provider_id field for LOGISTICS_PROVIDER', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'user-1',
        email: 'provider@test.com',
        role: 'LOGISTICS_PROVIDER',
        logistics_provider_id: 'provider-1',
        first_name: 'Test',
        last_name: 'User',
        email_verified: true,
      },
      isAuthenticated: true,
      isLoading: false,
      role: 'LOGISTICS_PROVIDER',
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    });

    render(<VehicleForm />);

    // El campo de proveedor no debe estar visible
    expect(screen.queryByLabelText(/proveedor logístico/i)).not.toBeInTheDocument();
  });

  it('should hide logistics_provider_id field for SUPERVISOR', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'user-1',
        email: 'supervisor@test.com',
        role: 'SUPERVISOR',
        logistics_provider_id: 'provider-1',
        first_name: 'Test',
        last_name: 'User',
        email_verified: true,
      },
      isAuthenticated: true,
      isLoading: false,
      role: 'SUPERVISOR',
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    });

    render(<VehicleForm />);

    // El campo de proveedor no debe estar visible
    expect(screen.queryByLabelText(/proveedor logístico/i)).not.toBeInTheDocument();
  });

  it('should show logistics_provider_id field for SAAS_ADMIN', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'user-1',
        email: 'admin@test.com',
        role: 'SAAS_ADMIN',
        first_name: 'Test',
        last_name: 'User',
        email_verified: true,
      },
      isAuthenticated: true,
      isLoading: false,
      role: 'SAAS_ADMIN',
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    });

    render(<VehicleForm />);

    // El campo de proveedor debe estar visible
    expect(screen.getByLabelText(/proveedor logístico/i)).toBeInTheDocument();
  });

  it('should show logistics_provider_id field for SAAS_EDITOR', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'user-1',
        email: 'editor@test.com',
        role: 'SAAS_EDITOR',
        first_name: 'Test',
        last_name: 'User',
        email_verified: true,
      },
      isAuthenticated: true,
      isLoading: false,
      role: 'SAAS_EDITOR',
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    });

    render(<VehicleForm />);

    // El campo de proveedor debe estar visible
    expect(screen.getByLabelText(/proveedor logístico/i)).toBeInTheDocument();
  });
});
