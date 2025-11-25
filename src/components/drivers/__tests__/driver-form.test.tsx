import { render, screen } from '@testing-library/react';
import { DriverForm } from '../driver-form';
import { useCreateDriver, useDriver } from '@/lib/hooks/use-drivers';
import { useLogisticsProviders } from '@/lib/hooks/use-logistics-providers';
import { useUsers } from '@/lib/hooks/use-users';
import { useVehicles } from '@/lib/hooks/use-vehicles';

// Mock hooks
jest.mock('@/lib/hooks/use-drivers');
jest.mock('@/lib/hooks/use-logistics-providers');
jest.mock('@/lib/hooks/use-users');
jest.mock('@/lib/hooks/use-vehicles');
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

const mockUseCreateDriver = useCreateDriver as jest.MockedFunction<typeof useCreateDriver>;
const mockUseDriver = useDriver as jest.MockedFunction<typeof useDriver>;
const mockUseLogisticsProviders = useLogisticsProviders as jest.MockedFunction<typeof useLogisticsProviders>;
const mockUseUsers = useUsers as jest.MockedFunction<typeof useUsers>;
const mockUseVehicles = useVehicles as jest.MockedFunction<typeof useVehicles>;

describe('DriverForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render create form', () => {
    mockUseCreateDriver.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    } as ReturnType<typeof useCreateDriver>);

    mockUseDriver.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useDriver>);

    mockUseLogisticsProviders.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useLogisticsProviders>);

    mockUseUsers.mockReturnValue({
      data: { data: [], total: 0 },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useUsers>);

    mockUseVehicles.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useVehicles>);

    render(<DriverForm />);

    expect(screen.getByText('Nuevo Driver')).toBeInTheDocument();
    expect(screen.getByLabelText('Proveedor Logístico *')).toBeInTheDocument();
  });
});

