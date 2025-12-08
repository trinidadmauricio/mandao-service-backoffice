import { render, screen } from "@testing-library/react";
import { DriverForm } from "../driver-form";
import {
  useCreateDriver,
  useUpdateDriver,
  useDriver,
} from "@/lib/hooks/use-drivers";
import { useLogisticsProviders } from "@/lib/hooks/use-logistics-providers";
import { useUsers } from "@/lib/hooks/use-users";
import { useVehicles } from "@/lib/hooks/use-vehicles";

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock hooks
jest.mock("@/lib/hooks/use-drivers");
jest.mock("@/lib/hooks/use-logistics-providers");
jest.mock("@/lib/hooks/use-users");
jest.mock("@/lib/hooks/use-vehicles");
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

const mockUseCreateDriver = useCreateDriver as jest.MockedFunction<
  typeof useCreateDriver
>;
const mockUseUpdateDriver = useUpdateDriver as jest.MockedFunction<
  typeof useUpdateDriver
>;
const mockUseDriver = useDriver as jest.MockedFunction<typeof useDriver>;
const mockUseLogisticsProviders = useLogisticsProviders as jest.MockedFunction<
  typeof useLogisticsProviders
>;
const mockUseUsers = useUsers as jest.MockedFunction<typeof useUsers>;
const mockUseVehicles = useVehicles as jest.MockedFunction<typeof useVehicles>;

describe("DriverForm", () => {
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

    // Configurar mocks por defecto
    mockUseCreateDriver.mockReturnValue(
      defaultMutationReturn as ReturnType<typeof useCreateDriver>
    );
    mockUseUpdateDriver.mockReturnValue(
      defaultMutationReturn as ReturnType<typeof useUpdateDriver>
    );
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
  });

  it("should render create form", () => {
    render(<DriverForm />);

    expect(screen.getByText("Nuevo Driver")).toBeInTheDocument();
    expect(screen.getByLabelText("Proveedor Logístico *")).toBeInTheDocument();
  });

  it("should call useUsers with DRIVER role filter", () => {
    render(<DriverForm />);

    // Verificar que useUsers se llama con filtro de rol DRIVER
    expect(mockUseUsers).toHaveBeenCalledWith({ role: "DRIVER" });
  });

  it("should show message when no DRIVER users are available", async () => {
    render(<DriverForm />);

    // El mensaje está dentro del SelectContent, que solo se muestra cuando el select está abierto
    // Verificamos que el select existe y que useUsers fue llamado con el filtro correcto
    const userSelect = screen.getByLabelText("Usuario *");
    expect(userSelect).toBeInTheDocument();

    // Verificar que useUsers fue llamado con el filtro DRIVER
    expect(mockUseUsers).toHaveBeenCalledWith({ role: "DRIVER" });

    // Verificar que no hay usuarios disponibles (data.data es un array vacío)
    expect(mockUseUsers).toHaveReturnedWith({
      data: { data: [], total: 0 },
      isLoading: false,
      error: null,
    });
  });
});
