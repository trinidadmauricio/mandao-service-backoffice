import { render, screen } from '@testing-library/react';
import { DeliveryRateForm } from '../delivery-rate-form';
import { useCreateDeliveryRate, useUpdateDeliveryRate, useDeliveryRate } from '@/lib/hooks/use-delivery-rates';
import { useDeliveryZones } from '@/lib/hooks/use-delivery-zones';
import { useAuth } from '@/lib/hooks/use-auth';
import { useTenants } from '@/lib/hooks/use-tenants';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock hooks
jest.mock('@/lib/hooks/use-delivery-rates');
jest.mock('@/lib/hooks/use-delivery-zones');
jest.mock('@/lib/hooks/use-auth');
jest.mock('@/lib/hooks/use-tenants');
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

const mockUseCreateDeliveryRate = useCreateDeliveryRate as jest.MockedFunction<typeof useCreateDeliveryRate>;
const mockUseUpdateDeliveryRate = useUpdateDeliveryRate as jest.MockedFunction<typeof useUpdateDeliveryRate>;
const mockUseDeliveryRate = useDeliveryRate as jest.MockedFunction<typeof useDeliveryRate>;
const mockUseDeliveryZones = useDeliveryZones as jest.MockedFunction<typeof useDeliveryZones>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseTenants = useTenants as jest.MockedFunction<typeof useTenants>;

describe('DeliveryRateForm', () => {
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

    mockUseCreateDeliveryRate.mockReturnValue(defaultMutationReturn as any);
    mockUseUpdateDeliveryRate.mockReturnValue(defaultMutationReturn as any);
    mockUseDeliveryRate.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as any);
    mockUseDeliveryZones.mockReturnValue({
      data: [],
    } as any);
    mockUseTenants.mockReturnValue({
      data: [
        { id: 'tenant-1', name: 'Tenant 1' },
        { id: 'tenant-2', name: 'Tenant 2' },
      ],
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

  it('should hide logistics_provider_id and show tenant_id field for SAAS_ADMIN', () => {
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

    render(<DeliveryRateForm />);

    // El campo tenant debe estar visible
    expect(screen.getByLabelText(/tenant/i)).toBeInTheDocument();
    // El campo logistics_provider_id no debe estar visible
    expect(screen.queryByLabelText(/proveedor logístico/i)).not.toBeInTheDocument();
  });

  it('should hide tenant_id and show logistics_provider_id (hidden) field for LOGISTICS_PROVIDER', () => {
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

    render(<DeliveryRateForm />);

    // El campo tenant no debe estar visible
    expect(screen.queryByLabelText(/tenant/i)).not.toBeInTheDocument();
    // El campo logistics_provider_id no debe estar visible (está oculto)
    expect(screen.queryByLabelText(/proveedor logístico/i)).not.toBeInTheDocument();
  });
});
