import { render, screen } from "@testing-library/react";
import { DeliveryZoneForm } from "../delivery-zone-form";
import {
  useCreateDeliveryZone,
  useUpdateDeliveryZone,
  useDeliveryZone,
} from "@/lib/hooks/use-delivery-zones";
import { useAuth } from "@/lib/hooks/use-auth";
import { useTenants } from "@/lib/hooks/use-tenants";

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock hooks
jest.mock("@/lib/hooks/use-delivery-zones");
jest.mock("@/lib/hooks/use-auth");
jest.mock("@/lib/hooks/use-tenants");
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));
jest.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockUseCreateDeliveryZone = useCreateDeliveryZone as jest.MockedFunction<
  typeof useCreateDeliveryZone
>;
const mockUseUpdateDeliveryZone = useUpdateDeliveryZone as jest.MockedFunction<
  typeof useUpdateDeliveryZone
>;
const mockUseDeliveryZone = useDeliveryZone as jest.MockedFunction<
  typeof useDeliveryZone
>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseTenants = useTenants as jest.MockedFunction<typeof useTenants>;

describe("DeliveryZoneForm", () => {
  const defaultMutationReturn = {
    mutateAsync: jest.fn(),
    mutate: jest.fn(),
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
    data: undefined,
    reset: jest.fn(),
    status: "idle" as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseCreateDeliveryZone.mockReturnValue(defaultMutationReturn as ReturnType<typeof useCreateDeliveryZone>);
    mockUseUpdateDeliveryZone.mockReturnValue(defaultMutationReturn as ReturnType<typeof useUpdateDeliveryZone>);
    mockUseDeliveryZone.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useDeliveryZone>);
    mockUseTenants.mockReturnValue({
      data: [
        { id: "tenant-1", name: "Tenant 1" },
        { id: "tenant-2", name: "Tenant 2" },
      ],
    } as ReturnType<typeof useTenants>);
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

  it("should hide logistics_provider_id and show tenant_id field for SAAS_ADMIN", () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: "user-1",
        email: "admin@test.com",
        role: "SAAS_ADMIN",
        first_name: "Test",
        last_name: "User",
        email_verified: true,
      },
      isAuthenticated: true,
      isLoading: false,
      role: "SAAS_ADMIN",
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    });

    render(<DeliveryZoneForm />);

    // El campo tenant debe estar visible
    expect(screen.getByLabelText(/tenant/i)).toBeInTheDocument();
    // El campo logistics_provider_id no debe estar visible
    expect(
      screen.queryByLabelText(/proveedor logístico/i)
    ).not.toBeInTheDocument();
  });

  it("should hide logistics_provider_id and show tenant_id field for OWNER", () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: "user-1",
        email: "owner@test.com",
        role: "OWNER",
        tenant_id: "tenant-1",
        first_name: "Test",
        last_name: "User",
        email_verified: true,
      },
      isAuthenticated: true,
      isLoading: false,
      role: "OWNER",
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    });

    render(<DeliveryZoneForm />);

    // El campo tenant debe estar visible
    expect(screen.getByLabelText(/tenant/i)).toBeInTheDocument();
    // El campo logistics_provider_id no debe estar visible
    expect(
      screen.queryByLabelText(/proveedor logístico/i)
    ).not.toBeInTheDocument();
  });

  it("should hide tenant_id and show logistics_provider_id (hidden) field for LOGISTICS_PROVIDER", () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: "user-1",
        email: "provider@test.com",
        role: "LOGISTICS_PROVIDER",
        logistics_provider_id: "provider-1",
        first_name: "Test",
        last_name: "User",
        email_verified: true,
      },
      isAuthenticated: true,
      isLoading: false,
      role: "LOGISTICS_PROVIDER",
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    });

    render(<DeliveryZoneForm />);

    // El campo tenant no debe estar visible
    expect(screen.queryByLabelText(/tenant/i)).not.toBeInTheDocument();
    // El campo logistics_provider_id no debe estar visible (está oculto)
    expect(
      screen.queryByLabelText(/proveedor logístico/i)
    ).not.toBeInTheDocument();
  });

  it("should hide tenant_id and show logistics_provider_id (hidden) field for SUPERVISOR", () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: "user-1",
        email: "supervisor@test.com",
        role: "SUPERVISOR",
        logistics_provider_id: "provider-1",
        first_name: "Test",
        last_name: "User",
        email_verified: true,
      },
      isAuthenticated: true,
      isLoading: false,
      role: "SUPERVISOR",
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    });

    render(<DeliveryZoneForm />);

    // El campo tenant no debe estar visible
    expect(screen.queryByLabelText(/tenant/i)).not.toBeInTheDocument();
    // El campo logistics_provider_id no debe estar visible (está oculto)
    expect(
      screen.queryByLabelText(/proveedor logístico/i)
    ).not.toBeInTheDocument();
  });
});
